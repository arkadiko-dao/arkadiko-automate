require('dotenv').config();
const APP_ADDRESS = process.env.APP_ADDRESS;
const USER_ADDRESS = process.env.USER_ADDRESS;
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');

const registerJob = async () => {
  const txOptions = {
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "register-job",
    functionArgs: [
      tx.contractPrincipalCV(USER_ADDRESS, 'job-diko-liquidation-pool'),
      tx.uintCV(1000),
      tx.contractPrincipalCV(APP_ADDRESS, 'arkadiko-job-cost-calculation-v1-1'),
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

registerJob();
