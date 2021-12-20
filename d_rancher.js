/** @param {NS} ns **/
import { getConfig } from "util.js";

function findServerSize(ram){
  let size = 0;
  for(size; size < 21; size++){
    if(Math.pow(2, size) == ram){
      break;
    }
  }
  return size;
}

export async function main(ns) {

  while(true){
    const CONFIG = getConfig(ns);
    const INTERVAL_MS = CONFIG.daemonInterval;
    const INTERNAL_INTERVAL_MS = Math.ceil(INTERVAL_MS / 10);
    // figure out which servers we have
    // if we have maxServers at size 20, exit

    // if we have any below min lvl, upgrade as many as we can

    // if we don't have enough yet, buy more

    await ns.sleep(INTERVAL_MS);
  }
}
