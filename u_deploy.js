/** @param {NS} ns **/
export async function main(ns) {
  const args = ns.flags([
		["help", false],
		["target", ""],
    ["script", ""],
    ["threads", 0]
	]);

	if (!args.script || !args.target || args.help) {
      ns.tprint("This script deploys a script to a target server.");
      ns.tprint(`Usage: run ${ns.getScriptName()} --target HOSTNAME --script SCRIPT --threads 2`);
      ns.tprint("Example:");
      ns.tprint(`> run ${ns.getScriptName()} --target n00dles --script run_me.js`);
      return;
  }

	const maxThreads = Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target)) / ns.getScriptRam(args.script));
  let threads = args.threads;
  if(threads < 1 || threads > maxThreads){
    threads = maxThreads;
  }
  if(threads < 1){
    ns.tprint(`${args.target} cannot support this script, not enough RAM.`)
  }
	ns.tprint(`Launching ${args.script} on ${args.target} with ${threads} threads.`);
	await ns.scp(args.script, "home", args.target);
	ns.exec(args.script, args.target, threads);
}

export function autocomplete(data, args) {
    return [...data.servers, ...data.script];
}
