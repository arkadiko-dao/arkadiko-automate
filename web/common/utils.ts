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
