/** @param {NS} ns **/
import { allServers, getConfig } from "util.js";

const CRACK_NAMES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
const DEPLOYABLE = "self_hgw.js";

export async function main(ns) {
  const INTERVAL_MS = getConfig(ns).daemonInterval;
  const INTERNAL_INTERVAL_MS = Math.ceil(INTERVAL_MS / 10);
  const availableCracks = CRACK_NAMES.filter((cn) => {
    return ns.fileExists(cn, "home");
  }).length;

  while(true){
    // get current hacking lvl
    const HLVL = ns.getHackingLevel();

    const ALL_SERVERS = allServers(ns);
    //scan servers for pwnable
    const pwnable = ALL_SERVERS.filter((s) => {
      return !ns.hasRootAccess(s) && ns.getServerNumPortsRequired(s) <= availableCracks;
    });
    let pwnTarget = pwnable.shift();
    while(pwnTarget){
      await ns.run("t_pwn.js", 1, pwnTarget);
      pwnTarget = pwnable.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS)
    }

    //scan for servers we consider hackable
    const hackable = ALL_SERVERS.filter((s) => {
      return ns.hasRootAccess(s) && // we have root
        ns.getServerRequiredHackingLevel(s) <= HLVL && // we can beat the hack lvl
        ns.getServerMaxMoney(s) > 0 && //has money
        !ns.scriptRunning(DEPLOYABLE, s) && // not already running self-hack
        ns.getServerMaxRam(s) > 3;
    });
    let hTarget = hackable.shift();
    while(hTarget){
      const threads = Math.floor((ns.getServerMaxRam(hTarget) - ns.getServerUsedRam(hTarget)) / ns.getScriptRam(DEPLOYABLE));
      await ns.scp(DEPLOYABLE, "home", hTarget);
      await ns.exec(DEPLOYABLE, hTarget, threads)
      hTarget = hackable.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS)
    }
    await ns.sleep(INTERVAL_MS);
  }
}
