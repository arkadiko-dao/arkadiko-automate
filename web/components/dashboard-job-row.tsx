import React, { useContext } from 'react';
import { AppContext } from '@common/context';
import { Tooltip } from '@blockstack/ui';
import { Switch } from '@headlessui/react';
import { StyledIcon } from './ui/styled-icon';
import { stacksNetwork as network } from '@common/utils';
import { useSTXAddress } from '@common/use-stx-address';
import { useConnect } from '@stacks/connect-react';
import { blocksToTime } from '@common/utils';
import { classNames } from '@common/class-names';

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
  shouldRun: boolean;
  error: string;
  currentBlock: number;
}

export const DashboardJobRow: React.FC<DashboardJobRowProps> = ({
  jobId,
  contract,
  cost,
  fee,
  executions,
  lastExecuted,
  enabled,
  shouldRun,
  error,
  currentBlock
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
      postConditions: [],
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
    <tr className="bg-white dark:bg-zinc-800">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {error ? (
            <Tooltip
              hasArrow
              label={error}
            >
              <p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                  <StyledIcon as="CheckCircleIcon" size={4} className="mr-2" />
                  Error
                </span>
              </p>
            </Tooltip>
          ) : enabled && shouldRun ? (
            <p className="flex items-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                <StyledIcon as="CheckCircleIcon" size={4} className="mr-2" />
                Enabled
              </span>
              <Tooltip
                hasArrow
                className="cursor-help"
                label="Should run"
              >
                <span>
                  <StyledIcon as="CheckIcon" size={5} className="mx-2 text-green-600" />
                </span>
              </Tooltip>
            </p>
          ) : enabled ? (
            <p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                <StyledIcon as="CheckCircleIcon" size={4} className="mr-2" />
                Enabled
              </span>
            </p>
          ) : (
            <p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                <StyledIcon as="XCircleIcon" size={4} className="mr-2" />
                Disabled
              </span>
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap">
        <a href={"https://explorer.stacks.co/txid/" + contract + "?chain=mainnet"} className="inline-flex items-center">
          {contract.split(".")[1]}
          <StyledIcon as="ExternalLinkIcon" size={4} className="block ml-2" />
        </a>
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap">
        {cost / 1000000}{' '}
        <span className="text-xs font-normal">DIKO</span>
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap">
        {fee / 1000000}{' '}
        <span className="text-xs font-normal">STX</span>
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap">
        {executions}{' '}
      </td>
      <td className="px-6 py-4 text-sm whitespace-nowrap">
        {lastExecuted == 0 ? (
          <>
            Not executed yet
          </>
        ):(
          <>
            Block {lastExecuted}{' '}
            (≈{blocksToTime(currentBlock - lastExecuted)} ago)
          </>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Tooltip
            hasArrow
            label={enabled ? `Enabled. Click to disable.` : `Disabled. Click to enable.`}
          >
            <Switch
              checked={enabled}
              onChange={() => toggleJobEnabled()}
              className={classNames(
                enabled ? 'bg-indigo-500' : 'bg-gray-300',
                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500/50'
              )}
            >
              <span className="sr-only">{enabled ? `Disable job` : `Enable job`}</span>
              <span
                aria-hidden="false"
                className={classNames(
                  enabled ? 'translate-x-5' : 'translate-x-0',
                  'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                )}
              />
            </Switch>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
};
