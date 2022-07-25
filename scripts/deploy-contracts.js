require('dotenv').config({ path: '../.env' });
const utils = require('./utils');

async function deployAll() {

  const contracts1 = [

    // SIP-010
    { name: "sip-010-trait-ft-standard", file: "sip-010-trait-ft-standard.clar"},

    // Traits
    { name: "arkadiko-automation-trait-v1", file: "arkadiko-automation-trait-v1.clar"},
    { name: "arkadiko-job-cost-calculation-trait-v1", file: "arkadiko-job-cost-calculation-trait-v1.clar"},
  ]

  const contracts2 = [

    // Traits
    { name: "arkadiko-job-executor-trait-v1", file: "arkadiko-job-executor-trait-v1.clar"},
  ]

  const contracts3 = [

    // Traits
    { name: "arkadiko-job-registry-trait-v1", file: "arkadiko-job-registry-trait-v1.clar"},
  ]

  const contracts4 = [

    // Contracts
    { name: "arkadiko-job-cost-calculation-v1-1", file: "arkadiko-job-cost-calculation-v1-1.clar"},
    { name: "arkadiko-job-executor-v1-1", file: "arkadiko-job-executor-v1-1.clar"},
  ]

  const contracts5 = [

    // Contracts
    { name: "arkadiko-job-registry-v1-1", file: "arkadiko-job-registry-v1-1.clar"},
  ]

  await utils.deployContractBatch(contracts1, process.env.APP_ADDRESS, process.env.APP_PRIVATE_KEY);
  await utils.deployContractBatch(contracts2, process.env.APP_ADDRESS, process.env.APP_PRIVATE_KEY);
  await utils.deployContractBatch(contracts3, process.env.APP_ADDRESS, process.env.APP_PRIVATE_KEY);
  await utils.deployContractBatch(contracts4, process.env.APP_ADDRESS, process.env.APP_PRIVATE_KEY);
  await utils.deployContractBatch(contracts5, process.env.APP_ADDRESS, process.env.APP_PRIVATE_KEY);

  console.log("Deployed all")
}

deployAll();
