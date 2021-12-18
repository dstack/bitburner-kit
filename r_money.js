/** @param {NS} ns **/
import { allServers, getConfig } from "util.js";

export async function main(ns) {
  const ALL_SERVERS = allServers(ns);

  let report = ALL_SERVERS.map((s) => {
    return {
      host: s,
      maxMon: ns.getServerMaxMoney(s),
      currMon: ns.getServerMoneyAvailable(s),
      currSec: ns.getServerSecurityLevel(s),
      minSec: ns.getServerMinSecurityLevel(s)
    }
  })
  .filter((s) => {
    return s.maxMon > 0 &&
      ns.getServerRequiredHackingLevel(s.host) <= ns.getHackingLevel();
  })
  .sort((a,b) => {
    return b.currMon - a.currMon;
  });

  report.forEach((l) => {
    ns.tprint(`${l.host} || ${l.currMon} || ${l.maxMon} || ${((l.currMon / l.maxMon)*100).toFixed(2)}% || ${l.currSec.toFixed(2)}`);
  });
}
