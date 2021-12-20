/** @param {NS} ns **/
export async function main(ns) {
	const f = ns.flags([
		["size", 1],
		["exec", false]
		]);
	const size = Math.min(20, Math.max(1, f.size));
	const RAM = Math.pow(2, size);
	const RAM_DISPLAY = RAM * 1024 * 1024 * 1024;
	let me = ns.getPlayer();
  let cost = ns.getPurchasedServerCost(RAM);
	ns.tprint(`Server Size: ${ns.nFormat(RAM_DISPLAY, "0ib")}`);
	ns.tprint(`Server Cost: ${ns.nFormat(cost, "$0.000a")}`);
	ns.tprint(`Funds: ${ns.nFormat(me.money, "$0.000a")}`);
	if(me.money > cost && f.exec){
		let result = ns.purchaseServer("p-cloud", RAM);
		ns.tprint(`buying size ${size} server for ${cost} - ${result}`);
	}
}
