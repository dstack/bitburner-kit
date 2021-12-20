/** @param {NS} ns **/
const MAX_SIZE = 20;
import { getConfig, setConfig } from "util.js";

function ramToSize(ram){
  let size = 1;
  for(size; size < MAX_SIZE + 1; size++){
    if(Math.pow(2, size) == ram){
      break;
    }
  }
  return size;
}

function sizeToRam(size){
  return Math.pow(2, size);
}

export async function main(ns) {
  function serverBuy(prefix, size){
    ns.purchaseServer(prefix, sizeToRam(size));
  }
  function serverPrice(size){
    return ns.getPurchasedServerCost(sizeToRam(size));
  }
  function serverUpgrade(hostname, size){
    // we need to change this to gracefull end
    ns.killall
    ns.deleteServer
    serverBuy(hostname, size);
    ns.toast(`Upgraded ${hostname} to size ${size}`, "info");
  }
  const SERVER_COUNT_LIMIT = ns.getPurchasedServerLimit();
  while(true){
    let myFunds = ns.getPlayer().money;
    const CONFIG = getConfig(ns);
    const INTERVAL_MS = CONFIG.daemonInterval;
    const INTERNAL_INTERVAL_MS = Math.ceil(INTERVAL_MS / 10);
    // figure out which servers we have
    const PLAYER_SERVERS = ns.getPurchasedServers().map((h) => {
      let ram = ns.getServerMaxRam(h);
      let size = ramToSize(ram);
      return {
        host: h,
        ram,
        size
      }
    });
    let MAXED_OUT = PLAYER_SERVERS.filter((s) => {
      return s.size == MAX_SIZE;
    });
    // if we have maxServers at size 20, exit
    if(MAXED_OUT.length == SERVER_COUNT_LIMIT){
      ns.toast("Ranch is Full, exiting!", "error");
      setConfig(ns, {runRancherDaemon: false});
      ns.exit();
    }
    // try to reach minimums first
    if(PLAYER_SERVERS.length < CONFIG.servers.minServerCount){
      let diff = CONFIG.servers.minServerCount - PLAYER_SERVERS.length;
      let cost = serverPrice(CONFIG.servers.minSize) * diff;
      if(cost < myFunds){
        for(let i=0; i< diff; i++){
          let res = ns.purchaseServer(CONFIG.server.prefix, CONFIG.servers.minSize);
          ns.toast(`Purchased ${res} - size ${CONFIG.servers.minSize}`, "info");
        }
      }
    }
    // get new balance
    myFunds = ns.getPlayer().money;
    // get every server in the ranch to target lvl
    for(let i=0, l=PLAYER_SERVERS.length; i<l; i++){
      let server = PLAYER_SERVERS[i];
      for(let ss = server.size, ts = CONFIG.servers.targetServerSize; ts > ss; ts--){
        let cost = serverPrice(ts);
        if(myFunds > cost){
          serverUpgrade(server.host, ts);
        }
      }
      myFunds = ns.getPlayer().money;
    }
    if(PLAYER_SERVERS.length < SERVER_COUNT_LIMIT){
      // now try to fill the ranch
      // buy one per cycle
      let cost = serverPrice(CONFIG.servers.targetServerSize);
      if(myFunds > cost){
        let res = serverBuy(CONFIG.server.prefix, CONFIG.servers.targetServerSize);
        ns.toast(`Purchased ${res} - size ${CONFIG.servers.targetServerSize}`, "info");
      }
    }
    else {
      setConfig(ns, {servers:{ targetServerSize: CONFIG.server.targetServerSize + 1 }});
      ns.toast(`UPGRADE Target Server Size: ${CONFIG.server.targetServerSize + 1}`, "info");
    }

    await ns.sleep(INTERVAL_MS);
  }
}
