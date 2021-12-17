/** @param {NS} ns **/
const DEPLOYABLE = "self_hgw.js";

export async function main(ns) {
  const args = ns.flags([
		["help", false],
		["target", ""]
	]);

	if (!args.target || args.help) {
        ns.tprint("This script deploys a self-hosted hack against a target server.");
        ns.tprint(`Usage: run ${ns.getScriptName()} --target HOSTNAME`);
        ns.tprint("Example:");
        ns.tprint(`> run ${ns.getScriptName()} n00dles`);
        return;
    }

	const threads = Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target)) / ns.getScriptRam(DEPLOYABLE));
	ns.tprint(`Launching ${DEPLOYABLE} on ${target}`);
	await ns.scp(DEPLOYABLE, "home", target);
	ns.exec(script, target, threads);
}

export function autocomplete(data, args) {
    return data.servers;
}
