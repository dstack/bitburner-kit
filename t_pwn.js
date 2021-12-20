/** @param {NS} ns **/
const CRACK_NAMES = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];

export async function main(ns) {
  const args = ns.flags([
    ["target", ""],
    ["taskId", ""],
    ["projectId", ""]
  ]);
  if(!args.target){
    ns.tprint("Please specify a target. (--target {SERVER})");
  }
  // check if we already have root
  if(!ns.hasRootAccess(args.target)){
    const availableCracks = CRACK_NAMES.filter((cn) => {
      return ns.fileExists(cn, "home");
    });
    availableCracks.forEach((ac) => {
      switch(ac) {
        case "BruteSSH.exe":
          ns.brutessh(args.target);
          break;
        case "FTPCrack.exe":
          ns.ftpcrack(args.target);
          break;
        case "relaySMTP.exe":
          ns.relaysmtp(args.target);
          break;
        case "HTTPWorm.exe":
          ns.httpworm(args.target);
          break;
        case "SQLInject.exe":
          ns.sqlinject(args.target);
          break;
      }
    });
    ns.nuke(args.target);
    // auto-backdoor here later
  }
  else {
    ns.tprint(`${args.target} already pwnd!`);
  }
  await ns.writePort(2, JSON.stringify({taskId: args.taskId, projectId: args.projectId, result: true}));
}

export function autocomplete(data, args) {
    return data.servers;
}
