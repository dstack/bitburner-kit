/** @param {NS} ns **/
export async function main(ns) {
    var args = ns.flags([["port", 1]]);
	ns.tprint(ns.peek(args.port));
}
