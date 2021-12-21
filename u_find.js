/** @param {NS} ns **/
import { allServers, findServer } from "util.js"
export async function main(ns) {
	const f = ns.flags([
		["go", false]
	]);
  const target = f._[0];
  const serverPath = findServer(ns, target, "home");
  ns.tprint(serverPath.join("->"));
  if(f.go){
    let doc = eval("document");
    let terminal = doc.getElementById("terminal-input");
    let cmd = "home; "
    serverPath.forEach((p) => {
      cmd += `connect ${p};`
    });
    terminal.value = cmd;
    // Get a reference to the React event handler.
    const handler = Object.keys(terminal)[1];
    // Perform an onChange event to set some internal values.
    terminal[handler].onChange({target:terminal});
    // Simulate an enter press
    terminal[handler].onKeyDown({keyCode:13,preventDefault:()=>null});
  }
}

export function autocomplete(data, args) {
    return data.servers;
}
