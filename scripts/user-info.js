require('dotenv').config();
const APP_ADDRESS = process.env.APP_ADDRESS;
const USER_ADDRESS = process.env.USER_ADDRESS;
const tx = require('@stacks/transactions');
const utils = require('./utils');
const network = utils.resolveNetwork();

async function getAccountInfo() {
  const result = await tx.callReadOnlyFunction({
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "get-account-by-owner",
    functionArgs: [
      tx.standardPrincipalCV(USER_ADDRESS)
    ],
    senderAddress: APP_ADDRESS,
    network
  });
  return tx.cvToJSON(result).value;
}

async function getJobInfo(jobId) {
  const result = await tx.callReadOnlyFunction({
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "get-job-by-id",
    functionArgs: [
      tx.uintCV(jobId),
    ],
    senderAddress: APP_ADDRESS,
    network
  });
  return tx.cvToJSON(result).value;
}

async function shouldRun(jobId, contract) {
  const result = await tx.callReadOnlyFunction({
    contractAddress: APP_ADDRESS,
    contractName: "arkadiko-job-registry-v1-1",
    functionName: "should-run",
    functionArgs: [
      tx.uintCV(jobId),
      tx.contractPrincipalCV(contract.split(".")[0], contract.split(".")[1]),
    ],
    senderAddress: APP_ADDRESS,
    network
  });
  return tx.cvToJSON(result).value.value;
}

const execute = async () => {

  const accountInfo = await getAccountInfo();

  console.log("\nSTX address: ", USER_ADDRESS);
  console.log(" - Jobs: ", accountInfo.jobs.value.length);
  console.log(" - STX: ", accountInfo.stx.value / 1000000);
  console.log(" - DIKO: ", accountInfo.diko.value / 1000000);

  for (const jobId of accountInfo.jobs.value) {
    try {
      const jobInfo = await getJobInfo(jobId.value);
      const jobContract = jobInfo["contract"].value;
      const shouldExecute = await shouldRun(jobId.value, jobContract);

      console.log("\nJob #", jobId.value);
      console.log(" - Contract: ", jobInfo.contract.value);
      console.log(" - Enabled: ", jobInfo.enabled.value);
      console.log(" - Cost: ", jobInfo.cost.value / 1000000, "DIKO");
      console.log(" - Fee: ", jobInfo.fee.value / 1000000, "STX");
      console.log(" - Executions: ", jobInfo.executions.value);
      console.log(" - Last executed: ", jobInfo['last-executed'].value);
      console.log(" - Should run: ", shouldExecute);

    } catch (e) {
      console.log(" - Error:", e);
    }
  }
};

execute();
