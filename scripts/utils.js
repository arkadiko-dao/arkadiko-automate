const network = require('@stacks/network');
require('dotenv').config();
const env = process.env.NETWORK_ENV;
const request = require('request-promise');
const tx = require('@stacks/transactions');
const fs = require('fs');
const BN = require('bn.js');

// ----------------------------------------------------
// Stacks API
// ----------------------------------------------------

async function getNonce(address) {
  const url = `${resolveUrl()}/v2/accounts/${address}?proof=0`;
  const result = await request(url, { json: true });
  return result.nonce;
}

async function getBlockHeight() {
  const url = `${resolveUrl()}/v2/info`;
  const result = await request(url, { json: true });
  const currentBlock = result['stacks_tip_height'];
  return currentBlock;
}

function resolveUrl() {
  if (env === 'mocknet') {
    return `http://localhost:${process.env.LOCAL_STACKS_API_PORT}`;
  } else if (env === 'testnet') {
    return 'https://stacks-node-api.testnet.stacks.co';
  } else if (env === 'regtest') {
    return 'https://stacks-node-api.regtest.stacks.co';
  } else {
    return 'https://stacks-node-api.mainnet.stacks.co';
  }
}

function resolveNetwork() {
  if (env === 'mainnet') {
    const stacksNetwork = new network.StacksMainnet();
    stacksNetwork.coreApiUrl = resolveUrl();

    return stacksNetwork;
  } else {
    const stacksNetwork = new network.StacksTestnet();
    stacksNetwork.coreApiUrl = resolveUrl();

    return stacksNetwork;
  }
}

// ----------------------------------------------------
// Transaction monitor
// ----------------------------------------------------

async function waitForTransactionCompletion(transactionId) {

  const url = `${resolveUrl()}/extended/v1/tx/${transactionId}`;
  console.log('\x1b[1m', "\nWaiting on transaction: ", "\x1b[0m");
  console.log(" - " + url);
  process.stdout.write(" - Pending ")

  return new Promise((resolve, reject) => {
    const poll = async function() {
      var result = await fetch(url);
      var value = await result.json();
      
      if (value.tx_status === "success") {
        console.log('\x1b[32m', '\n - Success', "\x1b[0m");
        resolve(true);
      } else if (value.tx_status === "pending") {
        process.stdout.write(".")
        setTimeout(poll, 10000);
      } else {
        console.log('\x1b[31m\x1b[1m', "\n - Failed with error: " + value.error + " - status: " + value.tx_status, "\x1b[0m");
        resolve(false);
      }
    }
    setTimeout(poll, 5000);
  })
}

// ----------------------------------------------------
// Deploy contracts
// ----------------------------------------------------

async function deployContract(contractName, contractFile, sender, senderKey) {
  var nonce = await getNonce(sender);

  const txId = await deployContractHelper(contractName, contractFile, nonce, senderKey);
  await waitForTransactionCompletion(txId);
}

async function deployContractBatch(contracts, sender, senderKey) {
  var nonce = await getNonce(sender);

  var txId;
  for (const contract of contracts) {
    txId = await deployContractHelper(contract.name, contract.file, nonce, senderKey);
    nonce += 1;
  }

  let transactionResult = await waitForTransactionCompletion(txId);
  return transactionResult;
}

async function deployContractHelper(contractName, contractFile, nonce, senderKey) {

  const source = fs.readFileSync("../clarity/contracts/" + contractFile).toString();

  const txOptions = {
    contractName: contractName,
    codeBody: source.toString('utf8'),
    senderKey: senderKey,
    nonce: new BN(nonce),
    network: resolveNetwork(),
    fee: new BN(100000, 1)
  };

  const transaction = await tx.makeContractDeploy(txOptions);
  const result = await tx.broadcastTransaction(transaction, resolveNetwork());
  console.log("TX ID: ", result);
  return transaction.txid();
}

exports.resolveUrl = resolveUrl;
exports.resolveNetwork = resolveNetwork;
exports.getNonce = getNonce;
exports.getBlockHeight = getBlockHeight;

exports.waitForTransactionCompletion = waitForTransactionCompletion;
exports.deployContract = deployContract;
exports.deployContractBatch = deployContractBatch;
