import React, { useEffect, useState } from 'react';
import { microToReadable } from '@common/utils';
import { Disclosure } from '@headlessui/react';
import { Tooltip } from '@blockstack/ui';
import { Placeholder } from './ui/placeholder';
import { NavLink as RouterLink } from 'react-router-dom';
import { StyledIcon } from './ui/styled-icon';
import { FarmModalStake } from './farm-modal-stake';
import { FarmModalUnstake } from './farm-modal-unstake';
import { stacksNetwork as network } from '@common/utils';
import { useSTXAddress } from '@common/use-stx-address';

import {
  AnchorMode,
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  trueCV,
  standardPrincipalCV,
  contractPrincipalCV,
} from '@stacks/transactions'

interface DashboardJobRowProps {}

export const DashboardJobRow: React.FC<DashboardJobRowProps> = ({
  contract,
  cost,
  fee,
  executions,
  lastExecuted,
  enabled
}) => {

  const address = useSTXAddress();
  const contractAddress = process.env.APP_CONTRACT_ADDRESS || '';

  return (
    <>
    <Disclosure as="tbody" className="bg-white dark:bg-zinc-800">
      {({ open }) => (
        <>
          <tr className="bg-white dark:bg-zinc-800">
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p>
                  {enabled ? (
                    <p className="inline-flex px-2 text-xs font-semibold leading-5 text-teal-800 bg-teal-100 rounded-full">
                      Enabled
                    </p>
                  ): (
                    <p className="inline-flex px-2 text-xs font-semibold leading-5 text-red-800 bg-red-100 rounded-full">
                      Disabled
                    </p>
                  )}
                </p>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p className="inline-flex items-center">
                  {contract}
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
                  {lastExecuted}{' '}
                </p>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap dark:text-white">
              <div className="flex items-center">
                <p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm leading-4 text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={false}
                    // onClick={() => setShowUnstakeModal(true)}
                  >
                    Disable
                  </button>
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
