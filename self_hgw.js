/** @param {NS} ns **/
const MONEY_TARGET_PCT = 0.65;
export async function main(ns) {
  const target = ns.getHostname();
	ns.toast(`Self-Hack started on ${target}`, "info");
	while(true) {
		const curMoney = ns.getServerMoneyAvailable(target);
		const maxMoney = ns.getServerMaxMoney(target);
		const curSec = ns.getServerSecurityLevel(target);
		const minSec = ns.getServerMinSecurityLevel(target);

		if(curSec > 15 && curSec > minSec + 5){
			ns.print("weakening self");
			await ns.weaken(target);
		}
		else if(curMoney > 0 && curMoney < (maxMoney * MONEY_TARGET_PCT)) {
			ns.print("growing self");
			await ns.grow(target);
		}
		else if(curMoney > 0){
			ns.print("hacking self");
			await ns.hack(target);
		}

		await ns.sleep(100);
	}
}
