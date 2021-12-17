/** @param {NS} ns **/
const CLUSTER_SCRIPTS = ["d_tasker.js", "d_scanner.js"];

export async function main(ns) {
  const args = ns.flags([
    ["cluster", false],
    ["small", false],
    ["help", false]
  ]);
  const clusterRamReq = CLUSTER_SCRIPTS.map((s) => { return ns.getScriptRam(s); }).reduce(Math.sum, 0);
  const auto = !args.cluster && !args.small;
  function showHelp(){
    ns.tprint(`
------------------------------
HACK THE PLANET!
------------------------------
This script starts the automatic scan, root, and exploit system.
  --cluster   Attempts to start in cluster mode.
              Requires ${clusterRamReq} RAM
  --small     Attempts to start in small mode (no clustering).
              Requires ${"some"} RAM.
If neither mode is selected, this script will chose automatically.
      `);
  }
  if(args.help){
    showHelp();
  }
}
