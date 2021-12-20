/** @param {NS} ns **/
import { allServers, getConfig } from "util.js";

export async function main(ns) {
  while(true){
    const INTERVAL_MS = getConfig(ns).daemonInterval;
    const newServers = allServers(ns);
    ns.clearPort(4);
    await ns.writePort(4, JSON.stringify(newServers));
    await ns.sleep(INTERVAL_MS*10);
  }
}
