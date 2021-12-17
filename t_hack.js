/** @param {NS} ns **/
export async function main(ns) {
  const args = ns.flags([
    ["target", ""],
    ["taskId", ""],
    ["projectId", ""]
  ]);
  if(!args.target){
    ns.tprint("Please specify a target. (--target {SERVER})");
  }
  let result = await ns.hack(args.target);
  await ns.writePort(2, JSON.stringify({taskId: args.taskId, projectId: args.projectId, result}));
}

export function autocomplete(data, args) {
  return data.servers;
}
