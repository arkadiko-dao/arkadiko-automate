import React, { useContext, useEffect } from 'react';
import { stacksNetwork as network } from '@common/utils';
import { getNonce, getExplorerLink } from '@common/utils';
import { useSTXAddress } from '@common/use-stx-address';
import { useConnect } from '@stacks/connect-react';
import { AppContext } from '@common/context';
import {
  AnchorMode,
  broadcastTransaction,
  createStacksPrivateKey,
  standardPrincipalCV,
  noneCV,
  makeSTXTokenTransfer,
  privateKeyToString,
  uintCV,
  makeContractCall,
  contractPrincipalCV
} from '@stacks/transactions'
import BN from 'bn.js';

export const Test: React.FC = () => {
  const [state, setState] = useContext(AppContext);

  const { doOpenAuth } = useConnect();

  const address = useSTXAddress();
  const arkadikoPrivateKey = process.env.ARKADIKO_PRIVATE_KEY || '';
  const arkadikoAddress = process.env.ARKADIKO_CONTRACT_ADDRESS || '';

  // Request STX
  const requestMocknetStx = async (nonce: string) => {
    const senderKey = createStacksPrivateKey(arkadikoPrivateKey);
    console.log('Adding STX from mocknet address to', address, 'on network', network);

    const transaction = await makeSTXTokenTransfer({
      recipient: standardPrincipalCV(address || ''),
      amount: new BN(5000000000),
      senderKey: privateKeyToString(senderKey),
      network: network,
      nonce: new BN(nonce),
      fee: new BN(1000000, 10)
    });
    const result = await broadcastTransaction(transaction, network);
    const explorerLink = getExplorerLink(result);
    console.log("explorerLink: ", explorerLink);
    return explorerLink;
  };

  // Request DIKO
  const requestMocknetDiko = async (nonce: string) => {

    const senderKey = createStacksPrivateKey(arkadikoPrivateKey);
    console.log('Adding DIKO from mocknet address to', address, 'on network', network);

    const txOptions = {
      contractAddress: arkadikoAddress,
      contractName: "arkadiko-token",
      functionName: "transfer",
      functionArgs: [
        uintCV(5000000000),
        standardPrincipalCV(arkadikoAddress),
        standardPrincipalCV(arkadikoAddress),
        noneCV()
      ],
      senderKey: privateKeyToString(senderKey),
      nonce: new BN(nonce),
      fee: new BN(1000000, 10),
      postConditionMode: 1,
      network: network,
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, network);
    const explorerLink = getExplorerLink(result);
    console.log("explorerLink: ", explorerLink);
    return explorerLink;
  };

  // Get STX
  const getMocknetStx = async () => {
    let nonce = await getNonce(process.env.ARKADIKO_CONTRACT_ADDRESS as string);
    let result = await requestMocknetStx(nonce);
    return result;
  };

  // Get USDA
  const getMocknetDiko = async () => {
    let nonce = await getNonce(process.env.ARKADIKO_CONTRACT_ADDRESS as string);
    let result = await requestMocknetDiko(nonce);
    return result;
  };

  useEffect(() => {

  }, []);

  return (
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-bold font-headings mt-6">
        Get tokens on mocknet
      </h1>

      {state.userData ? (
        <div className="mt-6">

          <button type="button" onClick={() => getMocknetStx()} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-sm bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Get 5000 STX
          </button>
          <button type="button" onClick={() => getMocknetDiko()} className="inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-white border border-transparent rounded-sm bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Get 5000 DIKO
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => doOpenAuth()} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-sm bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Connect Wallet
        </button>
      )}
    </div>
  );
};
