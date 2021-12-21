const CONF_FILE_NAME = "config.json.txt";
const BASE_URL = "https://raw.githubusercontent.com/dstack/bitburner-kit/main";
const INSTALL_FILES = [
  "config.default.json.txt",
  "analysis-ignore.txt",
  "d_cluster.js",
  "d_contracts.js",
  "d_discovery.js",
  "d_rancher.js",
  "d_scanner.js",
  "d_small-scanner.js",
  "d_tasker.js",
  "r_money.js",
  "r_servers.js",
  "self_hgw.js",
  "start.js",
  "t_grow.js",
  "t_hack.js",
  "t_pwn.js",
  "t_weak.js",
  "t_xp-farm.js",
  "u_deploy.js",
  "u_find.js",
  "u_lud_speed.js",
  "u_max-threads.js",
  "u_peek.js",
  "u_server-buy.js",
  "u_rm-all.js",
  "util.ContractSolutions.js",
  "util.js",
  "util.TextTable.js"
];

const INSTALL_ALIAS = [
  `alias nuke="run NUKE.exe"`,
  `alias goto-plaid="run u_lud_speed.js"`,
  `alias start="run start.js"`,
  `alias hackup="run u_deploy.js --script t_xp-farm.js --target"`,
  `alias editconf="nano config.json.txt"`,
  `alias peek="run peek.js --port"`
];

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

async function downloadFiles(ns){
  let filesImported = true;
  for (let file of INSTALL_FILES) {
    let remoteFileName = `${BASE_URL}/${file}`;
    let result = await ns.wget(remoteFileName, `${file}`);
    filesImported = filesImported && result;
    ns.tprint(`File: ${file}: ${result ? '✔️' : '❌'}`);
  }
  return filesImported;
}

export async function main(ns){

  ns.tprint(`Downloading ${INSTALL_FILES.length} files ...`);
  ns.tprint("=".repeat(20));
  await downloadFiles(ns);
  ns.tprint("=".repeat(20));
  ns.tprint(`Merging Config ...`);
  let existingConfig = {};
  let defaultConfig = JSON.parse(ns.read("config.default.json.txt"));
  if(ns.fileExists(CONF_FILE_NAME)){
    existingConfig = JSON.parse(ns.read(CONF_FILE_NAME));
  }
  else{
    ns.tprint(`Could not find ${CONF_FILE_NAME}, using defaults.`)
  }
  let config = merge(defaultConfig, {});
  config = merge(existingConfig, config);
  ns.print(config);
  await ns.write(CONF_FILE_NAME, JSON.stringify(config, null, "  "), "w");
  ns.tprint("=".repeat(20));
  ns.tprint("Setting up aliases ...");
  let doc = eval("document");
  let terminal = doc.getElementById("terminal-input");
  let cmd = INSTALL_ALIAS.join("; ");
  terminal.value = cmd;
  const h = Object.keys(terminal)[1];
  terminal[h].onChange({target:terminal});
  terminal[h].onKeyDown({keyCode:13,preventDefault:()=>null});
  ns.tprint("All Done!  Try running \"start\" ...");
}
