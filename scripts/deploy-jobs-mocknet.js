require('dotenv').config({ path: '../.env' });
const utils = require('./utils');

async function deployAll() {

  const contracts1 = [
    { name: "job-test-mocknet", file: "jobs/job-test-mocknet.clar"},
    { name: "job-diko-liquidation-pool-mocknet", file: "jobs/job-diko-liquidation-pool-mocknet.clar"},
  ]

  await utils.deployContractBatch(contracts1, process.env.USER_ADDRESS, process.env.USER_PRIVATE_KEY);

  console.log("Deployed all")
}

deployAll();
