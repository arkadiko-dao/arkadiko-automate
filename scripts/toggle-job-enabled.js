require('dotenv').config();
const APP_ADDRESS = process.env.APP_ADDRESS;
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const toggleEnabled = async (jobId) => {
  const txOptions = {
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "toggle-job-enabled",
    functionArgs: [
      tx.uintCV(jobId),
    ],
    senderKey: process.env.USER_PRIVATE_KEY,
    postConditionMode: 1,
    fee: new BN(10000, 1),
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.waitForTransactionCompletion(transaction.txid());
};

const jobId = process.argv.slice(2)[0];
console.log("Toggle job #", jobId);
toggleEnabled(jobId);
