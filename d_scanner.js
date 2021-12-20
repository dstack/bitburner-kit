/** @param {NS} ns **/
/*
  publish new projects to 1
  listen for finished projects on 3
*/
import { generateId, allServers, getConfig, maxThreads, handlePort, autoDiscovery } from "util.js";

const CRACK_NAMES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
const ANALYSIS_FLAG_FILE = "analysis-ignore.txt";

export async function main(ns) {
  const ALL_SERVERS = allServers(ns);
  const trackedProjects = [];
  ns.clearPort(1);
  ns.clearPort(3);

  async function addProject(type, threads, target){
    let prj = {
      type,
      threads,
      target,
      id: generateId(16)
    };
    trackedProjects.push(prj);
    await ns.writePort(1, JSON.stringify(prj));
    // add analysis flag file
    await ns.scp(ANALYSIS_FLAG_FILE, "home", target);
  }

  async function handleProjectFinish(prjId){
    let projectIndex = trackedProjects.findIndex((prj) => {
      return prj.id == prjId;
    });
    if(projectIndex > -1){
      let cPrj = trackedProjects.splice(projectIndex, 1)[0];
      ns.rm(ANALYSIS_FLAG_FILE, cPrj.target);
    }
  }

  let cycleCounter = 0
  while(true){
    const availableCracks = CRACK_NAMES.filter((cn) => {
      return ns.fileExists(cn, "home");
    }).length;
    const CONFIG = getConfig(ns);
    const INTERVAL_MS = CONFIG.daemonInterval;
    const INTERNAL_INTERVAL_MS = Math.ceil(INTERVAL_MS / 10);

    // auto-discover
    await autoDiscovery(ns, ALL_SERVERS);

    // get current config
    const config = getConfig(ns);
    // get current hacking lvl
    const HLVL = ns.getHackingLevel();

    // clear finished projects
    await handlePort(ns, 3, INTERNAL_INTERVAL_MS, handleProjectFinish);

    //scan servers for pwnable
    const pwnable = ALL_SERVERS.filter((s) => {
      return !ns.hasRootAccess(s) && ns.getServerNumPortsRequired(s) <= availableCracks;
    });
    let pwnTarget = pwnable.shift();
    while(pwnTarget){
      await addProject("pwn", 1, pwnTarget);
      pwnTarget = pwnable.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS)
    }

    //scan for servers we consider hackable
    const hackable = ALL_SERVERS.filter((s) => {
      return !ns.fileExists(ANALYSIS_FLAG_FILE, s) &&
        ns.hasRootAccess(s) &&
        ns.getServerRequiredHackingLevel(s) <= HLVL &&
        ns.getServerMaxMoney(s) > 0;
    });
    let hTarget = hackable.shift();
    while(hTarget){
      // analyze target for projects
      // BEGIN  STRAT 1
      let currSec = ns.getServerSecurityLevel(hTarget),
        minSec = ns.getServerMinSecurityLevel(hTarget),
        currMon = ns.getServerMoneyAvailable(hTarget),
        maxMon = ns.getServerMaxMoney(hTarget);
      if(currSec > config.targetMaxSecurity && currSec > minSec + config.targetMaxOverMinSecurity){
        // weaken the server
        let diff = currSec - minSec,
          threadsReq = Math.ceil(diff / 0.05);
        await addProject("weak", threadsReq, hTarget);
      }
      else if(currMon < maxMon * config.targetMoneyThreshold){
        // grow the server
        let delta = maxMon / (currMon || 1),
          threadsReq = ns.growthAnalyze(hTarget, delta);
        await addProject("grow", threadsReq, hTarget);
      }
      else if(currMon > 0){
        // hack the server
        let threadsReq = Math.floor(config.targetMoneyTakeThreshold / ns.hackAnalyze(hTarget));
        await addProject("hack", threadsReq, hTarget);
      }
      else {
        ns.print(`${hTarget} - cannot be analyzed`);
      }
      // END STRAT 1
      hTarget = hackable.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS);
    }
    cycleCounter++;

    // periodically check for stuck project targets
    if(cycleCounter >= 100){
      cycleCounter = 0;
      let hasIgnore = ALL_SERVERS.filter((s) => {
        return ns.fileExists(ANALYSIS_FLAG_FILE, s);
      });
      let activePrjTargets = trackedProjects.map((p) => {
        return p.target;
      });
      let diff = hasIgnore.filter((s) => {
        return !activePrjTargets.includes(s);
      });
      diff.forEach((s) => {
        ns.rm(ANALYSIS_FLAG_FILE, s);
      });
      if(diff.length > 0){
        ns.toast(`Cleaned up ${diff.length} Flag Files`, "warning");
      }
    }

    await ns.sleep(INTERVAL_MS);
  }
}
