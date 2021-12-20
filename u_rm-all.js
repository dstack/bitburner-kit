/** @param {NS} ns **/
export async function main(ns) {
	ns.ls(ns.getHostname()).forEach((f) => {
    ns.rm(f, ns.getHostname());
  })
}
