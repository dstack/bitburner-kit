function dec2hex (dec) {
  return dec.toString(16).padStart(2, "0")
}
function scan(ns, parent, server, list) {
  const children = ns.scan(server);
  for (let child of children) {
    if (parent == child) {
      continue;
    }
    list.push(child);
    scan(ns, server, child, list);
  }
}
function recursiveScan(ns, parent, server, target, route) {
  const children = ns.scan(server);
  for (let child of children) {
    if (parent == child) {
      continue;
    }
    if (child == target) {
      route.unshift(child);
      route.unshift(server);
      return true;
    }

    if (recursiveScan(ns, server, child, target, route)) {
      route.unshift(server);
      return true;
    }
  }
  return false;
}

export function generateId (len) {
  var arr = new Uint8Array((len || 40) / 2)
  crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}

export function serverList(ns, start, list = []) {
  scan(ns, '', start, list);
  return list;
}

export function allServers(ns, includeHome) {
  let list = [];
  if(includeHome){ list = ["home"]; }
  return serverList(ns, "home", list);
}

export function findServer(ns, host, start) {
	let route = [];
	recursiveScan(ns, '', start, host, route);
	return route;
}

export function getConfig(ns){
  return JSON.parse(ns.read("config.json.txt"));
}

export function maxThreads(cost, avail){
  return Math.floor(avail/cost);
}
