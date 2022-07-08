import { RPCClient } from '@stacks/rpc-client';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

export const contractAddress = process.env.APP_CONTRACT_ADDRESS || '';

export const microToReadable = (amount: number | string, decimals = 6) => {
  return parseFloat(`${amount}`) / Math.pow(10, decimals);
};

const env = process.env.REACT_APP_NETWORK_ENV || 'testnet';

let coreApiUrl = 'https://stacks-node-api.mainnet.stacks.co';
if (env.includes('mocknet')) {
  coreApiUrl = `http://localhost:${process.env.LOCAL_STACKS_API_PORT}`;
} else if (env.includes('testnet')) {
  coreApiUrl = 'https://stacks-node-api.testnet.stacks.co';
} 

export const getRPCClient = () => {
  return new RPCClient(coreApiUrl);
};

export const stacksNetwork = env === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
stacksNetwork.coreApiUrl = coreApiUrl;

export function getExplorerLink(txId: string) {
  if (env.includes('mocknet')) {
    return `http://localhost:3999/extended/v1/tx/${txId}`;
  } else if (env.includes('testnet')) {
    return `https://explorer.stacks.co/txid/${txId}?chain=testnet`;
  } 
  return `https://explorer.stacks.co/txid/${txId}?chain=mainnet`;
}

export async function getNonce(address: string) {
  const url = `${coreApiUrl}/v2/accounts/${address}?proof=0`;
  const response = await fetch(url, { credentials: 'omit' });
  const data = await response.json();
  return data.nonce;
}

export async function getBlockHeight() {
  const client = getRPCClient();
  const response = await fetch(`${client.url}/v2/info`, { credentials: 'omit' });
  const data = await response.json();
  const currentBlock = data['stacks_tip_height'];
  return currentBlock;
}

export const blocksToTime = (blocks:number) => {

  const minutesPerBlock = 10;
  const minutesLeft = blocks * minutesPerBlock;
  const hoursLeft = Math.floor(minutesLeft / 60);

  const days = Math.floor(hoursLeft / 24);
  const hours = Math.round(hoursLeft % 24);
  const minutes = Math.round(minutesLeft % 60);

  if (days == 0 && hours == 0) {
    return minutes + "m";
  } else if (days == 0 && minutes == 0) {
    return hours + "h";
  } else if (hours == 0 && minutes == 0) {
    return days + "d";

  } else if (days == 0) {
    return hours + "h, " + minutes + "m";
  } else if (hours == 0) {
    return days + "d, " + minutes + "m";
  } else if (minutes == 0) {
    return days + "d, " + hours + "h";;
  }
  return days + "d, " + hours + "h, " + minutes + "m";
};
