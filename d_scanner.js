/** @param {NS} ns **/
/*
  publish new projects to 1
  listen for finished projects on 3
*/
import { generateId, allServers, getConfig, maxThreads } from "util.js";

const CRACK_NAMES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
const ANALYSIS_FLAG_FILE = "analysis-ignore.txt";

export async function main(ns) {
  const INTERVAL_MS = getConfig(ns).daemonInterval;
  const INTERNAL_INTERVAL_MS = Math.ceil(INTERVAL_MS / 10);
  const ALL_SERVERS = allServers(ns);
  const trackedProjects = [];
  const availableCracks = CRACK_NAMES.filter((cn) => {
    return ns.fileExists(cn, "home");
  }).length;
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

  let cycleCounter = 0
  while(true){
    // get current config
    const config = getConfig(ns);
    // get current hacking lvl
    const HLVL = ns.getHackingLevel();

    // clear finished projects
    let port3Data = await ns.readPort(3);
    while(port3Data != "NULL PORT DATA"){
      let projectIndex = trackedProjects.findIndex((prj) => {
        return prj.id == port3Data;
      });
      if(projectIndex > -1){
        let cPrj = trackedProjects.splice(projectIndex, 1)[0];
        ns.rm(ANALYSIS_FLAG_FILE, cPrj.target);
      }
      port3Data = await ns.readPort(3);
      await ns.sleep(INTERNAL_INTERVAL_MS);
    }

    //scan servers for pwnable
    const pwnable = ALL_SERVERS.filter((s) => {
      return !ns.hasRootAccess(s) && ns.getServerNumPortsRequired(s) <= availableCracks;
    });
    let pwnTarget = pwnable.shift();
    while(pwnTarget){
      await addProject("pwn", 1, pwnTarget);
    }
    await ns.sleep(INTERVAL_MS);

    //scan for servers we consider hackable
    const hackable = ALL_SERVERS.filter((s) => {
      return ns.hasRootAccess(s) &&
        ns.getServerRequiredHackingLevel(s) <= HLVL &&
        !ns.fileExists(ANALYSIS_FLAG_FILE, s) &&
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
        let diff = currSec - (minSec + config.targetMaxOverMinSecurity),
          diffPerThread = ns.weakenAnalyze(1),
          threadsReq = Math.ceil(diff / (diffPerThread || 1));
        await addProject("weak", threadsReq, hTarget);
      }
      else if(currMon < maxMon * config.targetMoneyThreshold){
        // grow the server
        let delta = (maxMon * config.targetMoneyThreshold) / (currMon || 1),
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
