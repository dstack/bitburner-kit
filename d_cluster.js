/** @param {NS} ns **/
import { getConfig } from "util.js";

const SERVICE_MAP = [
  {conf: "runDiscoveryDaemon", script: "discovery"},
  {conf: "runTaskerDaemon", script: "tasker"},
  {conf: "runScannerDaemon", script: "scanner"},
  {conf: "runContractorDaemon", script: "contracts"},
  {conf: "runRancherDaemon", script: "rancher"},
];

export async function main(ns) {
  const ME = ns.getHostname();
  while(true){
    const CONFIG = getConfig(ns);
    for(var i=0; i < SERVICE_MAP.length; i++){
      const service = SERVICE_MAP[i];
      const scriptName = `d_${service.script}.js`;
      if(ns.scriptRunning(scriptName, ME)){
        if(!CONFIG[service.conf]){
          ns.scriptKill(scriptName, ME);
        }
      }
      else {
        if(CONFIG[service.conf]){
          ns.run(scriptName, 1);
        }
      }
    }
    await ns.sleep(CONFIG.daemonInterval);
  }
}
