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

// scan mempool:
// https://stacks-node-api.stacks.co/extended/v1/tx/mempool?address=SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-job-registry-v1-1&unanchored=true

const runJob = async (jobId) => {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "run-job",
    functionArgs: [
      tx.uintCV(jobId),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'job-steal-tokens'),
      tx.contractPrincipalCV(CONTRACT_ADDRESS, 'arkadiko-job-executor-v1-1'),
    ],
    senderKey: process.env.STACKS_PRIVATE_KEY,
    postConditionMode: 1,
    network
  };

  const transaction = await tx.makeContractCall(txOptions);
  const result = tx.broadcastTransaction(transaction, network);
  await utils.processing(result, transaction.txid(), 0);
};

const exec = async () => {
  response = await axios(url, { credentials: 'omit' });
  fs.readFile('lastBlockExecution', 'utf8', function (err, data) {
    const lastBlockExecution = data || 0;
    const lastBlock = response.data['stacks_tip_height'];

    if (lastBlock > lastBlockExecution) {
      console.log('Last executed on block', lastBlockExecution, '... running automation bot');

      fs.writeFile('lastBlockExecution', lastBlock.toString(), 'utf8', function (x, y) { console.log(x,y); });
    }
  });
};

exec();
