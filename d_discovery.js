/** @param {NS} ns **/
import { allServers, getConfig } from "util.js";

export async function main(ns) {
  ns.print("Starting discovery daemon");
  let newServers = [];
  while(true) {
    const INTERVAL_MS = getConfig(ns).daemonInterval*100; //100 times as long
    newServers = allServers(ns);
    ns.clearPort(4);
    await ns.writePort(4, JSON.stringify(newServers));
    await ns.sleep(INTERVAL_MS + Math.ceil(Math.random() * 25));
  }
}
