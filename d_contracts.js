/** @param {NS} ns **/
import { allServers, getConfig, autoDiscovery } from "util.js";
import * as Solvers from "util.ContractSolutions.js";

export async function main(ns) {
  const ALL_SERVERS = allServers(ns, true);

  while(true){
    await autoDiscovery(ns, ALL_SERVERS);
    const INTERVAL_MS = getConfig(ns).daemonInterval;
    const INTERNAL_INTERVAL_MS = Math.ceil(INTERVAL_MS / 10);

    const HAS_CONTRACT = ALL_SERVERS.filter((s) => {
      return ns.ls(s, ".cct");
    });
    let outstandingContracts = [];
    let target = HAS_CONTRACT.shift();
    while(target){
      let contracts = ns.ls(target, ".cct");
      contracts.forEach((c) => {
        outstandingContracts.push({file: c, target});
      })
      target = HAS_CONTRACT.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS);
    }
    let cc = outstandingContracts.shift();
    while(cc){

      let inputData = ns.codingcontract.getData(cc.file, cc.target),
      inputType = ns.codingcontract.getContractType(cc.file, cc.target),
      outputData = null, outputResult = null;

      // figure out the contract type and solve it
      switch(inputType){
        case "Algorithmic Stock Trader I":
          if(inputData.length > 1){
            outputData = await Solvers.solverStockTrader(ns, [1, inputData]);
          }
          else { outputData = 0; }
          break;

        case "Algorithmic Stock Trader II":
          if(inputData.length > 1){
            outputData = await Solvers.solverStockTrader(ns, [Math.floor(inputData.length / 2), inputData]);
          }
          else { outputData = 0; }
          break;

        case "Algorithmic Stock Trader III":
          if(inputData.length > 1){
            outputData = await Solvers.solverStockTrader(ns, [2, inputData]);
          }
          else { outputData = 0; }
          break;

        case "Algorithmic Stock Trader IV":
          outputData = await Solvers.solverStockTrader(ns, inputData);
          break;

        case "Array Jumping Game":
          outputData = await Solvers.solverArrayJumpingGame(ns, inputData);
          break;

        case "Find All Valid Math Expressions":
          outputData = await Solvers.solverWaysToExpress(ns, inputData);
          break;

        case "Find Largest Prime Factor":
          outputData = await Solvers.solverLargestPrime(ns, inputData);
          break;

        case "Generate IP Addresses":
          outputData = await Solvers.solverGenerateIPs(ns, inputData);
          break;

        case "Merge Overlapping Intervals":
          outputData = await Solvers.solverMergeRanges(ns, inputData);
          break;

        case "Minimum Path Sum in a Triangle":
          outputData = await Solvers.solverTrianglePath(ns, inputData);
          break;

        case "Spiralize Matrix":
          outputData = await Solvers.solverSpiralizeMatrix(ns, inputData);
          break;

        case "Subarray with Maximum Sum":
          outputData = await Solvers.solverLargestSubset(ns, inputData);
          break;

        case "Total Ways to Sum":
          outputData = await Solvers.solverWaysToSum(ns, inputData);
          break;

        case "Unique Paths in a Grid I":
          outputData = await Solvers.solverUniquePaths(ns, inputData);
          break;

        case "Unique Paths in a Grid II":
          outputData = await Solvers.solverUniquePathsII(ns, inputData);
          break;

        case "Sanitize Parentheses in Expression":
          outputData = await Solvers.solverInvalidParens(ns, inputData);
          break;

        default:
          ns.tprint([cc.target, cc.file, inputType, "NO SOLVER YET"]);
          break;
      }
      if(outputData || outputData === 0){
        outputResult = ns.codingcontract.attempt(outputData, cc.file, cc.target);
      }
      if(outputResult){
        ns.tprint([cc.target, cc.file, inputType, outputData, outputResult ]);
      }
      else {
        ns.tprint([cc.target, cc.file, inputType]);
        ns.tprint("Failed data for debug: " + JSON.stringify(inputData));
      }

      //next contract
      cc = outstandingContracts.shift();
      await ns.sleep(INTERNAL_INTERVAL_MS);
    }
    await ns.sleep(INTERVAL_MS);
  }
}
