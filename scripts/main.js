require('dotenv').config();
const APP_ADDRESS = process.env.APP_ADDRESS;
const KEEPER_ADDRESS = process.env.KEEPER_ADDRESS;
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();
const fs = require('fs');

async function getLastJobId() {
  const result = await tx.callReadOnlyFunction({
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "get-contract-info",
    functionArgs: [],
    senderAddress: APP_ADDRESS,
    network
  });
  return tx.cvToJSON(result).value["last-job-id"].value;
}

async function getJobInfo(jobId) {
  const result = await tx.callReadOnlyFunction({
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "get-job-by-id",
    functionArgs: [
      tx.uintCV(jobId),
    ],
    senderAddress: APP_ADDRESS,
    network
  });
  return tx.cvToJSON(result).value;
}

async function shouldRun(jobId, contract) {
  const result = await tx.callReadOnlyFunction({
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "should-run",
    functionArgs: [
      tx.uintCV(jobId),
      tx.contractPrincipalCV(contract.split(".")[0], contract.split(".")[1]),
    ],
    senderAddress: APP_ADDRESS,
    network
  });
  return tx.cvToJSON(result).value.value;
}

const executeJob = async (jobId, contract, fee, nonce) => {
  console.log(" - Execute " + jobId + " with nonce " + nonce);
  const txOptions = {
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "run-job",
    functionArgs: [
      tx.uintCV(jobId),
      tx.contractPrincipalCV(contract.split(".")[0], contract.split(".")[1]),
      tx.contractPrincipalCV(APP_ADDRESS, 'arkadiko-job-executor-v1-1'),
    ],
    senderKey: process.env.KEEPER_PRIVATE_KEY,
    postConditionMode: 1,
    fee: fee,
    nonce: nonce,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = await tx.broadcastTransaction(transaction, network);
  if (result.reason == "ConflictingNonceInMempool") {
    return await executeJob(jobId, contract, fee, nonce+1);
  } else if (result.reason == "BadNonce"){
    return await executeJob(jobId, contract, fee, result.reason_data.expected);
  }
  return await utils.waitForTransactionCompletion(transaction.txid());
};

const run = async () => {

  const lastJobId = await getLastJobId();
  console.log("Number of jobs: ", lastJobId);

  for (let jobId = lastJobId; jobId > 0; jobId--) {
    try {
      console.log("\nJob #", jobId);

      const jobInfo = await getJobInfo(jobId);
      console.log(" - JobInfo: ", jobInfo);
      const jobContract = jobInfo["contract"].value;
      const jobFee =  jobInfo["fee"].value;
      const shouldExecute = await shouldRun(jobId, jobContract);
      
      console.log(" - Contract:", jobContract);
      console.log(" - Should run: ", shouldExecute);

      if (shouldExecute) {
        console.log(" - Fee:", jobFee / 1000000, "STX");

        const nonce = await utils.getNonce(KEEPER_ADDRESS);
        const executionResult = await executeJob(jobId, jobContract, jobFee, nonce);
        console.log(" - Result:", executionResult);
      }

    } catch (e) {
      console.log(" - Error:", e);
    }
  }
};

const execute = async () => {
  const lastBlock = await utils.getBlockHeight();

  fs.readFile('lastBlockExecution', 'utf8', function (err, data) {
    const lastBlockExecution = data || 0;
    const shouldRun = lastBlock > lastBlockExecution;
    console.log("Current block:", lastBlock, ", last block execution:", lastBlockExecution, "- Run:", shouldRun);

    if (shouldRun) {
      fs.writeFile('lastBlockExecution', lastBlock.toString(), 'utf8', function (x, y) { });
      run();
    }
  });
};

execute();
