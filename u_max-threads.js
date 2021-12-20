/** @param {NS} ns **/
export async function main(ns) {
  const args = ns.flags([
		["target", "home"],
    ["script", ""]
	]);

	if (!args.script || !args.target) {
      ns.tprint("This script calculates the max threads on a target host for a script.");
      ns.tprint(`Usage: run ${ns.getScriptName()} --target HOSTNAME --script SCRIPT`);
      ns.tprint("Example:");
      ns.tprint(`> run ${ns.getScriptName()} --target n00dles --script run_me.js`);
      return;
  }

	const maxThreads = Math.floor((ns.getServerMaxRam(args.target) - ns.getServerUsedRam(args.target)) / ns.getScriptRam(args.script));
  ns.tprint(`max threads to run ${args.script} on ${args.target}: ${maxThreads}`);
}

export function autocomplete(data, args) {
    return [...data.servers, ...data.script];
}
