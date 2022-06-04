require('dotenv').config();
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const axios = require('axios');
const url = 'https://stacks-node-api.mainnet.stacks.co/v2/info';
const fs = require('fs');
const enabledJobIds = [1, 2];

// scan mempool:
// https://stacks-node-api.stacks.co/extended/v1/tx/mempool?address=SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-job-registry-v1-1&unanchored=true

const runJob = async (jobId) => {
  
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
