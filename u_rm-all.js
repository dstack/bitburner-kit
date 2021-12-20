/** @param {NS} ns **/
export async function main(ns) {
	ns.ls(ns.getHostname()).forEach((f) => {
    if(f.indexOf(".exe") == -1){
      ns.rm(f, ns.getHostname());
    }
  })
}
