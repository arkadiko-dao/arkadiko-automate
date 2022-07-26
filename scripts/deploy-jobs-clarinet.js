require('dotenv').config({ path: '../.env' });
const utils = require('./utils');

async function deployAll() {

  const contracts1 = [
    { name: "job-test-clarinet", file: "jobs/job-test-clarinet.clar"},
    { name: "job-diko-liquidation-pool-clarinet", file: "jobs/job-diko-liquidation-pool-clarinet.clar"},
  ]

  await utils.deployContractBatch(contracts1, process.env.USER_ADDRESS, process.env.USER_PRIVATE_KEY);

  console.log("Deployed all")
}

deployAll();
