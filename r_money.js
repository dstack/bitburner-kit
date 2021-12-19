/** @param {NS} ns **/
import { allServers, getConfig } from "util.js";
import { TextTable } from "util.TextTable.js";
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
  })
  .map((l) => {
    return [
      l.host,
      ns.nFormat(l.currMon, "0.000a"),
      ns.nFormat(l.maxMon, "0.000a"),
      `${((l.currMon / l.maxMon)*100).toFixed(2)}%`,
      `${l.currSec.toFixed(2)}`
    ]
  });

  ns.tprint("\n"+TextTable(report, {hsep: "  |  "}))
}
