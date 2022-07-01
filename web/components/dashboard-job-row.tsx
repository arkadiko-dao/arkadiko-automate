import React, { Fragment, useContext, useEffect, useState } from 'react';
import { AppContext } from '@common/context';
import { Disclosure } from '@headlessui/react';
import { StyledIcon } from './ui/styled-icon';
import { stacksNetwork as network } from '@common/utils';
import { useSTXAddress } from '@common/use-stx-address';
import { useConnect } from '@stacks/connect-react';

import {
  AnchorMode,
  uintCV,
} from '@stacks/transactions'

interface DashboardJobRowProps {
  key: string;
  jobId: number;
  contract: string;
  cost: number;
  fee: number;
  executions: number;
  lastExecuted: number;
  enabled: boolean;
}

export const DashboardJobRow: React.FC<DashboardJobRowProps> = ({
  jobId,
  contract,
  cost,
  fee,
  executions,
  lastExecuted,
  enabled
}) => {

  const stxAddress = useSTXAddress();
  const { doContractCall } = useConnect();

  const contractAddress = process.env.APP_CONTRACT_ADDRESS || '';

  const [state, setState] = useContext(AppContext);

  const toggleJobEnabled = async () => {
    await doContractCall({
      network,
      contractAddress,
      stxAddress,
      contractName: 'arkadiko-job-registry-v1-1',
      functionName: 'toggle-job-enabled',
      functionArgs: [
        uintCV(jobId),
      ],
      postConditionMode: 1,
      onFinish: data => {
        setState(prevState => ({
          ...prevState,
          currentTxId: data.txId,
          currentTxStatus: 'pending',
        }));
      },
      anchorMode: AnchorMode.Any,
    });
  };

  return (
    <>
    <Disclosure as="tbody" className="bg-white dark:bg-zinc-800">
      {({ open }) => (
        <>
          <tr className="bg-white dark:bg-zinc-800">
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                {enabled ? (
                  <p className="inline-flex px-2 text-xs font-semibold leading-5 text-indigo-800 bg-indigo-100 rounded-full">
                    Enabled
                  </p>
                ): (
                  <p className="inline-flex px-2 text-xs font-semibold leading-5 text-red-800 bg-red-100 rounded-full">
                    Disabled
                  </p>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p className="inline-flex items-center">
                  {contract.split(".")[1]}
                  <StyledIcon as="ExternalLinkIcon" size={4} className="block ml-2" />
                </p>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p>
                  {cost / 1000000}{' '}
                  <span className="text-sm font-normal">DIKO</span>
                </p>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p>
                  {fee / 1000000}{' '}
                  <span className="text-sm font-normal">STX</span>
                </p>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p>
                  {executions}{' '}
                </p>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p>
                  { lastExecuted == 0 ? (
                    <>
                      Not executed yet
                    </>
                  ):(
                    <>
                      Block {lastExecuted}{' '} (≈1d, 2h, 20m ago)
                    </>
                  )}
                </p>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p>
                {enabled ? (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm leading-4 text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={false}
                    onClick={() => toggleJobEnabled()}
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm leading-4 text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={false}
                    onClick={() => toggleJobEnabled()}
                  >
                    Enable
                  </button>
                )}
                </p>
              </div>
            </td>
          </tr>
        </>
      )}
    </Disclosure>
    </>
  );
};
