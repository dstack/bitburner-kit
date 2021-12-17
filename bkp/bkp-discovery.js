/** @param {NS} ns **/
import {
	serverList,
	findServer
} from "common.ns"
export async function main(ns) {
	const args = ns.flags([
		["help", false],
		["path", ""]
	]);
	if(args.path){
		const serverPath = findServer(ns, args.path, "home");
		ns.tprint(serverPath);
	}
	else {
		const allServers = serverList(ns, "home");
		ns.tprint(allServers);
	}
}

export function autocomplete(data, args) {
    return data.servers;
}
