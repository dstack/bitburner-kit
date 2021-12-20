/** @param {NS} ns **/
const CLUSTER_SCRIPTS = ["d_cluster.js", "d_discovery.js", "d_tasker.js", "d_scanner.js"];
const SMALL_SCRIPTS = ["d_small_scanner.js"];

export async function main(ns) {
  const args = ns.flags([
    ["cluster", false],
    ["small", false],
    ["help", false]
  ]);
  const clusterRamReq = CLUSTER_SCRIPTS.map((s) => { return ns.getScriptRam(s); }).reduce(Math.sum, 0);
  const smallRamReq = SMALL_SCRIPTS.map((s) => { return ns.getScriptRam(s); }).reduce(Math.sum, 0);
  function showHelp(){
    ns.tprint(`
------------------------------
DSTACK'S BITBURNER KIT!
------------------------------
This script starts the automatic scan, root, and exploit system.
  --cluster   Attempts to start in cluster mode.
              Requires ${clusterRamReq} RAM
  --small     Attempts to start in small mode (no clustering).
              Requires ${smallRamReq} RAM.
If neither mode is selected, this script will chose automatically.
      `);
  }
  if(args.help){
    showHelp();
  }

  const auto = !args.cluster && !args.small;
}
