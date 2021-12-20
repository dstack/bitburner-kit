/** @param {NS} ns **/
const TARGET = "foodnstuff"; // always most optimal
export async function main(ns) {
  while(true){
    await ns.weak(TARGET);
    await ns.sleep(10);
  }
}
