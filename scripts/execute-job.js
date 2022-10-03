require('dotenv').config();
const APP_ADDRESS = process.env.APP_ADDRESS;
const KEEPER_ADDRESS = process.env.KEEPER_ADDRESS;
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();

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
  console.log("Broadcast result:", result);
  return await utils.waitForTransactionCompletion(transaction.txid());
};

const execute = async () => {

  // Job info
  const jobId = 5;
  const jobContract = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.job-diko-liquidation-rewards-v1";
  const jobFee = 0.01 * 1000000;

  // Execute
  const nonce = await utils.getNonce(KEEPER_ADDRESS);
  const executionResult = await executeJob(jobId, jobContract, jobFee, nonce);
  console.log("Execution result:", executionResult);
};

execute();
