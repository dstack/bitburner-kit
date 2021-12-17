/** @param {NS} ns **/
import {
	serverList,
	isPwnd,
	isHackable,
	getPortCracks,
	describeServer,
	addTask
} from "common.ns"

const REFRESH_RATE = 1000;
const TARGET_MONEY_MULTI = 0.65;

let BUSY_SERVERS = [];

function isBusy(server){
	return BUSY_SERVERS.indexOf(server) > -1;
}

function unBusy(server){
	let busyPos = BUSY_SERVERS.indexOf(server);
	if(busyPos > -1){
		BUSY_SERVERS.splice(busyPos, 1);
	}
	return;
}

export async function main(ns) {
	while(true){
		// unbusy anything we can
		let finished = ns.readPort(2);
		while(finished != "NULL PORT DATA") {
			ns.print(`unbusy ${finished}`);
			unBusy(finished);
			finished = ns.readPort(2);
			await ns.sleep(500)
		}
		// find all hosts
		const allServers = serverList(ns, "home").map((s) => {
			return describeServer(ns, s);
		});
		// list current cracks
		let cracks = getPortCracks(ns);
		// find all hosts we think we can pwn
		let pwnable = allServers.filter((s) => {
			return !isPwnd(ns, s.hostname) && s.portsReq <= cracks.length;
		})
		// pwn all pwnable hosts
		pwnable.forEach((s) => {
			ns.print(`pwning ${s.hostname}`);
			ns.run("f_pwn.ns", 1, s.hostname);
		});

		// analyze hackable hosts
		let hackable = allServers.filter((s) => {
			return isPwnd(ns, s.hostname) && isHackable(ns, s) && !isBusy(s.hostname);
		});
		for(let i=0, l=hackable.length; i < l; i++){
			let s = hackable[i];
			BUSY_SERVERS.push(s.hostname);(s.hostname);
			// determine whether to hack, grow, or weaken
			if(s.curSec > 15 && s.curSec > (s.minSec + 5)){
				// weaken
				ns.print(`weakening ${s.hostname}`)
				await addTask(ns, {task: "weak", target: s.hostname});
			}
			else if(s.curMoney < (s.maxMoney*TARGET_MONEY_MULTI) && s.curMoney > 0){
				// grow
				ns.print(`growing ${s.hostname}`)
				await addTask(ns, {task: "grow", target: s.hostname});
			}
			else if(s.curMoney > 0){
				// time2hack
				ns.print(`hacking ${s.hostname}`)
				await addTask(ns, {task: "hack", target: s.hostname});
			}
		}
		ns.print(`requesting cluster ${BUSY_SERVERS.length}`);
		await ns.writePort(3, BUSY_SERVERS.length);
		await ns.sleep(REFRESH_RATE);
	}
}
