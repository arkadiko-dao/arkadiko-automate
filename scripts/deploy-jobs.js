require('dotenv').config({ path: '../.env' });
const utils = require('./utils');

async function deployAll() {

  const contracts1 = [
    { name: "job-test", file: "jobs/job-test.clar"},
    { name: "job-diko-liquidation-pool", file: "jobs/job-diko-liquidation-pool.clar"},
  ]

  await utils.deployContractBatch(contracts1, process.env.USER_ADDRESS, process.env.USER_PRIVATE_KEY);

  console.log("Deployed all")
}

deployAll();
