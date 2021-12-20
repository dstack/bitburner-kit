const CONFIG_FILE = "config.json.txt";

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

function merge(source, target) {
  for (const [key, val] of Object.entries(source)) {
    if (val !== null && typeof val === `object`) {
      if (target[key] === undefined) {
        target[key] = new val.__proto__.constructor();
      }
      merge(val, target[key]);
    } else {
      target[key] = val;
    }
  }
  return target; // we're replacing in-situ, so this is more for chaining than anything else
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
  return JSON.parse(ns.read(CONFIG_FILE));
}

export async function setConfig(ns, nVal){
  let conf = getConfig(ns),
  nConf = merge(nVal, conf);
  await ns.write(CONFIG_FILE, JSON.stringify(nConf, null, "  "), "w");
  return nConf;
}

export function maxThreads(cost, avail){
  return Math.floor(avail/cost);
}

export async function handlePort(ns, portN, portTiming, cb){
  let portData = await ns.readPort(portN);
  while(portData != "NULL PORT DATA"){
    // pass the portData to the callback
    await cb(portData);
    portData = await ns.readPort(portN);
    await ns.sleep(portTiming);
  }
}

export async function autoDiscovery(ns, serverList){
  let pd = await ns.peek(4);
  if(pd != "NULL PORT DATA"){
    let newServers = JSON.parse(pd).filter((s) => {
      return !serverList.includes(s);
    });
    serverList.push(...newServers);
  }
}
