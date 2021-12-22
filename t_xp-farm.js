/** @param {NS} ns **/
const TARGET = "joesguns"; // always most optimal
export async function main(ns) {
  while(true){
    await ns.weaken(TARGET);
    await ns.sleep(10);
  }
}
