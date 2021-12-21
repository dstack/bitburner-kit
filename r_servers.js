/** @param {NS} ns **/
import { TextTable } from "util.TextTable.js";

const MAX_SIZE = 20;

function ramToSize(ram){
  let size = 1;
  for(size; size < MAX_SIZE + 1; size++){
    if(Math.pow(2, size) == ram){
      break;
    }
  }
  return size;
}

function sizeToRam(size){
  return Math.pow(2, size);
}

export async function main(ns) {
  let report = ns.getPurchasedServers().map((h) => {
    let ram = ns.getServerMaxRam(h);
    let size = ramToSize(ram);
    return [
      h, ns.nFormat(ram*1024*1024*1024, "0ib"), size
    ]
  }).sort((a,b) => {
    return b.size - a.size;
  });

  report.unshift(["Host", "RAM", "Size"])

  ns.tprint("\n"+TextTable(report, {hsep: "  |  "}))
}
