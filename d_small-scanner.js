/** @param {NS} ns **/
import { allServers, getConfig } from "util.js";

const CRACK_NAMES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
const ANALYSIS_FLAG_FILE = "analysis-ignore.txt";

export async function main(ns) {
  const INTERVAL_MS = getConfig(ns).daemonInterval;
  const INTERNAL_INTERVAL_MS = Math.ceil(INTERVAL_MS / 10);
  const ALL_SERVERS = allServers(ns);
  const availableCracks = CRACK_NAMES.filter((cn) => {
    return ns.fileExists(cn, "home");
  }).length;

  while(true){
    //scan servers for pwnable
    const pwnable = ALL_SERVERS.filter((s) => {
      return !ns.hasRootAccess(s) && ns.getServerNumPortsRequired(s) <= availableCracks;
    });
    let pwnTarget = pwnable.shift();
    while(pwnTarget){
      await ns.run()
      pwnTarget = pwnable.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS)
    }

    //scan for servers we consider hackable
    const hackable = ALL_SERVERS.filter((s) => {
      return ns.hasRootAccess(s) &&
        ns.getServerRequiredHackingLevel(s) <= HLVL &&
        ns.getServerMaxMoney(s) > 0;
    });
    let hTarget = hackable.shift();
    while(hTarget){
      hTarget = hackable.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS)
    }
    await ns.sleep(INTERVAL_MS);
  }
}
