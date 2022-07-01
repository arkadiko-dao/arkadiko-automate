require('dotenv').config();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const axios = require('axios');
const url = 'https://stacks-node-api.mainnet.stacks.co/v2/info';
const fs = require('fs');
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();
const BN = require('bn.js');
const stacking = require('@stacks/stacking');
const c32 = require('c32check');
const enabledJobIds = [1, 2];

const registerJob = async (jobId) => {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "register-job",
    functionArgs: [
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'job-diko-liquidation-pool'),
      tx.uintCV(10000),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'arkadiko-job-cost-calculation-v1-1'),
    ],
    senderKey: process.env.STACKS_PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.waitForTransactionCompletion(transaction.txid());
};

registerJob();
