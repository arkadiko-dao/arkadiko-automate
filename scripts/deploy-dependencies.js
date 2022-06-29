require('dotenv').config({ path: '../.env' });
const utils = require('./utils');

async function deployAll() {

  const contracts1 = [

    // SIP-010
    { name: "sip-010-trait-ft-standard", file: "sip-010-trait-ft-standard.clar"},

    // Traits
    { name: "arkadiko-dao-token-trait-v1", file: "arkadiko/arkadiko-dao-token-trait-v1.clar"},
    { name: "arkadiko-liquidation-rewards-trait-v2", file: "arkadiko/arkadiko-liquidation-rewards-trait-v2.clar"},
  ]

  const contracts2 = [

    // Contracts
    { name: "arkadiko-token", file: "arkadiko/arkadiko-token.clar"},
    { name: "arkadiko-liquidation-rewards-diko-v1-1", file: "arkadiko/arkadiko-liquidation-rewards-diko-v1-1.clar"},
    { name: "arkadiko-liquidation-rewards-v1-2", file: "arkadiko/arkadiko-liquidation-rewards-v1-2.clar"},
  ]

  await utils.deployContractBatch(contracts1, process.env.ARKADIKO_ADDRESS, process.env.ARKADIKO_PRIVATE_KEY);
  await utils.deployContractBatch(contracts2, process.env.ARKADIKO_ADDRESS, process.env.ARKADIKO_PRIVATE_KEY);

  console.log("Deployed all")
}

deployAll();
