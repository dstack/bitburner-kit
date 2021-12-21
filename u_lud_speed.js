/** @param {NS} ns **/
export async function main(ns) {
    let win = eval("window");
	win.OST = win.setTimeout;
	ns.atExit(function(){ win.setTimeout = win.OST; });
	win.setTimeout = function(cb, t){
		win.setImmediate(cb);
	}
	while(true){

		await ns.sleep(1);
	}
}
