/** @param {NS} ns **/
/*
Project Object Contract
id: project id
target: target hostname
type: hack, grow, weak, etc.
threads: int
results: []
tasks: []

*/
import { generateId, allServers, getConfig, maxThreads, handlePort, autoDiscovery } from "util.js";

function convertToFollowUp(prj, newThreads, keepId){
  return {
    id: keepId? prj.id : `fup-${generateId(16)}`,
    threads: newThreads,
    target: prj.target,
    type: prj.type,
    originalProjectId: prj.originalProjectId || prj.id
  }
}

export async function main(ns) {
  const ALL_SERVERS = allServers(ns, true);
  const trackedProjects = [];
  const projectQueue = [];
  // clear any task finishes
  ns.clearPort(2);

  function getAvailableRAM(host){
    let RAM = ns.getServerMaxRam(host);
    let used = ns.getServerUsedRam(host);
    return RAM - used;
  }

  function getTaskableServers(){
    const config = getConfig(ns);
    return ALL_SERVERS.map((s) => {
      let reserve = config.reservedRAM[s] || 0;
      if(reserve == "ALL"){ return {host: s, aRAM: 0}; }
      let available = getAvailableRAM(s) - reserve;
      return {host: s, aRAM: available};
    })
    .filter((s) => {
      return s.aRAM > 2;
    })
    .sort((a,b) => {
      return b.aRAM - a.aRAM;
    });
  }

  async function finishProject(prj){
    let pid = prj.originalProjectId || prj.id;
    let result = prj.results.reduce((pv,cv)=>{ return pv+cv; }, 0);
    await ns.writePort(3, pid);
    if(prj.type == "pwn"){
      ns.toast(`${prj.target} pwnd!`, "error");
    }
    else if(prj.type == "hack"){
      ns.toast(`${prj.target} hacked for ${ns.nFormat(result, "0.000a")}!`, "success");
    }
    else if(prj.type == "grow"){
      ns.toast(`${prj.target} grown by ${result.toFixed(2)}!`, "info");
    }
    else if(prj.type == "weak"){
      ns.toast(`${prj.target} weakened by ${result.toFixed(2)}!`, "warning");
    }
  }

  async function handleTaskFinish(pd){
    let pData = JSON.parse(pd);
    let projectIndex = trackedProjects.findIndex((prj) => {
      return prj.id == pData.projectId;
    });
    if(projectIndex > -1){
      let tProj = trackedProjects[projectIndex];
      tProj.tasks.splice(tProj.tasks.indexOf(pData.taskId), 1);
      tProj.results.push(pData.result);
      if(tProj.tasks.length == 0){
        // project is finished
        let cProj = trackedProjects.splice(projectIndex, 1)[0];
        if(!cProj.hasFollowup){
          await finishProject(cProj);
        }
      }
    }
  }

  while(true){
    const CONFIG = getConfig(ns);
    const INTERVAL_MS = CONFIG.daemonInterval;
    const INTERNAL_INTERVAL_MS = Math.ceil(INTERVAL_MS / 10);

    // auto-discover
    await autoDiscovery(ns, ALL_SERVERS);

    // clear any finishes
    await handlePort(ns, 2, INTERNAL_INTERVAL_MS, handleTaskFinish);

    // start a list of projects to start
    let projectsToStart = [];

    // check for queued projects
    if(projectQueue.length > 0){
      projectsToStart.push(...projectQueue.splice(0, projectQueue.length));
    }

    // check for new projects
    async function handleProjectStart(pd){
      let project = JSON.parse(pd);
      projectsToStart.push(project);
    }
    await handlePort(ns, 1, INTERNAL_INTERVAL_MS, handleProjectStart);

    // we have projects to start
    let currentProject = projectsToStart.shift();
    while(currentProject){
      // spin up this project
      if(!currentProject.tasks){ currentProject.tasks = []; }
      if(!currentProject.results){ currentProject.results = []; }
      // determine task script
      let taskScript = false;
      if(currentProject.type == "hack"){ taskScript = "t_hack.js"; }
      else if(currentProject.type == "grow"){ taskScript = "t_grow.js"; }
      else if(currentProject.type == "weak"){ taskScript = "t_weak.js"; }
      else if(currentProject.type == "pwn"){ taskScript = "t_pwn.js"; }
      // add more here later
      else {
        // unknown kick it back to the queue for now
        projectQueue.push(currentProject);
      }
      // get taskScript RAM size
      const taskScriptRAM = ns.getScriptRam(taskScript);
      const taskables = getTaskableServers();
      let filledThreads = 0;

      while(filledThreads < currentProject.threads && taskables.length > 0){
        const ts = taskables.shift();
        const mt = maxThreads(taskScriptRAM, ts.aRAM);
        const taskThreads = Math.min(mt, currentProject.threads);
        const task = {host: ts.host, threads: taskThreads, id: generateId(16)}
        currentProject.tasks.push(task);
        filledThreads += taskThreads;
        await ns.sleep(INTERNAL_INTERVAL_MS);
      }

      if(filledThreads == 0){
        // no taskables, back to the queue
        projectQueue.push(convertToFollowUp(currentProject, currentProject.threads, true));
      }
      else {

        if(filledThreads < currentProject.threads){
          projectQueue.push(convertToFollowUp(currentProject, currentProject.threads - filledThreads));
          currentProject.hasFollowup = true;
        }

        // track this project
        trackedProjects.push(currentProject);

        // start the tasks
        for(var i in currentProject.tasks){
          const ct = currentProject.tasks[i];
          const argsArr = ["--target", currentProject.target, "--taskId", ct.id, "--projectId", currentProject.id];
          if(ct.host != "home"){
            await ns.scp(taskScript, "home", ct.host);
          }
          await ns.exec(taskScript, ct.host, ct.threads, ...argsArr);
          currentProject.tasks[i] = ct.id;
        }
      }

      currentProject = projectsToStart.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS);
    }

    await ns.sleep(INTERVAL_MS);
  }
}
