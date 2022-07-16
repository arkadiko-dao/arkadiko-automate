import React, { Fragment, useContext, useEffect, useState } from 'react';
import { AppContext } from '@common/context';
import { Tooltip } from '@blockstack/ui';
import { InformationCircleIcon, MinusCircleIcon, PlusCircleIcon, CollectionIcon } from '@heroicons/react/solid';
import { Placeholder } from "./ui/placeholder";
import { microToReadable, getRPCClient, getBlockHeight } from '@common/utils';
import { stacksNetwork as network } from '@common/utils';
import { Tab } from '@headlessui/react';
import { InputAmount } from './ui/input-amount';
import { StyledIcon } from './ui/styled-icon';
import { classNames } from '@common/class-names';
import { Helmet } from 'react-helmet';
import { Container } from './home';
import { DashboardJobRow } from './dashboard-job-row';
import { useSTXAddress } from '@common/use-stx-address';
import { useConnect } from '@stacks/connect-react';
import { EmptyState } from './ui/empty-state';
import {
  AnchorMode,
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  contractPrincipalCV,
  standardPrincipalCV,
  makeStandardFungiblePostCondition,
  makeStandardSTXPostCondition,
  makeContractFungiblePostCondition,
  makeContractSTXPostCondition,
  FungibleConditionCode,
  createAssetInfo
} from '@stacks/transactions';

export const Dashboard = () => {
  const stxAddress = useSTXAddress();
  const { doContractCall } = useConnect();

  const contractAddress = process.env.APP_CONTRACT_ADDRESS || '';
  const arkadikoAddress = process.env.ARKADIKO_CONTRACT_ADDRESS || '';

  const [state, setState] = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [balanceWalletDiko, setBalanceWalletDiko] = useState(0);
  const [balanceWalletStx, setBalanceWalletStx] = useState(0);
  const [balanceAccountDiko, setBalanceAccountDiko] = useState(0);
  const [balanceAccountStx, setBalanceAccountStx] = useState(0);

  const [depositAmountDiko, setDepositAmountDiko] = useState(0);
  const [depositAmountStx, setDepositAmountStx] = useState(0);
  const [withdrawAmountDiko, setWithdrawAmountDiko] = useState(0);
  const [withdrawAmountStx, setWithdrawAmountStx] = useState(0);

  const [createContract, setCreateContract] = useState("");
  const [createFee, setCreateFee] = useState(0.001);

  const [jobItems, setJobItems] = useState([]);
  const [contractInfo, setContractInfo] = useState({});

  const onInputDepositDikoChange = (event: any) => {
    const value = event.target.value;
    setDepositAmountDiko(value);
  };

  const onInputDepositStxChange = (event: any) => {
    const value = event.target.value;
    setDepositAmountStx(value);
  };

  const onInputWithdrawDikoChange = (event: any) => {
    const value = event.target.value;
    setWithdrawAmountDiko(value);
  };

  const onInputWithdrawStxChange = (event: any) => {
    const value = event.target.value;
    setWithdrawAmountStx(value);
  };

  const onInputCreateContractChange = (event: any) => {
    const value = event.target.value;
    setCreateContract(value);
  };

  const onInputCreateFeeChange = (event: any) => {
    const value = event.target.value;
    setCreateFee(value);
  };

  const depositMaxAmountDiko = () => {
    setDepositAmountDiko((balanceWalletDiko / 1000000).toString());
  };

  const depositMaxAmountStx = () => {
    setDepositAmountStx((balanceWalletStx / 1000000).toString());
  };

  const withdrawMaxAmountDiko = () => {
    setWithdrawAmountDiko((balanceAccountDiko / 1000000).toString());
  };

  const withdrawMaxAmountStx = () => {
    setWithdrawAmountStx((balanceAccountStx / 1000000).toString());
  };

  const creditAccount = async () => {
    const postConditions = [
      makeStandardFungiblePostCondition(
        stxAddress || '',
        FungibleConditionCode.Equal,
        uintCV(Number((parseFloat(depositAmountDiko) * 1000000).toFixed(0))).value,
        createAssetInfo(arkadikoAddress, 'arkadiko-token', 'diko')
      ),
      makeStandardSTXPostCondition(
        stxAddress || '',
        FungibleConditionCode.Equal,
        uintCV(Number((parseFloat(depositAmountStx) * 1000000).toFixed(0))).value,
      ),
    ];

    await doContractCall({
      network,
      contractAddress,
      stxAddress,
      contractName: 'arkadiko-job-registry-v1-1',
      functionName: 'credit-account',
      functionArgs: [
        standardPrincipalCV(stxAddress),
        uintCV(depositAmountDiko * 1000000),
        uintCV(depositAmountStx * 1000000),
      ],
      postConditions,
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

  const debitAccount = async () => {
    const postConditions = [
      makeContractFungiblePostCondition(
        contractAddress,
        'arkadiko-job-registry-v1-1',
        FungibleConditionCode.Equal,
        uintCV(Number((parseFloat(withdrawAmountDiko) * 1000000).toFixed(0))).value,
        createAssetInfo(arkadikoAddress, 'arkadiko-token', 'diko')
      ),
      makeContractSTXPostCondition(
        contractAddress,
        'arkadiko-job-registry-v1-1',
        FungibleConditionCode.Equal,
        uintCV(Number((parseFloat(withdrawAmountStx) * 1000000).toFixed(0))).value,
      )
    ];

    await doContractCall({
      network,
      contractAddress,
      stxAddress,
      contractName: 'arkadiko-job-registry-v1-1',
      functionName: 'withdraw-account',
      functionArgs: [
        uintCV(withdrawAmountDiko * 1000000),
        uintCV(withdrawAmountStx * 1000000),
      ],
      postConditions,
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

  const registerJob = async () => {
    await doContractCall({
      network,
      contractAddress,
      stxAddress,
      contractName: 'arkadiko-job-registry-v1-1',
      functionName: 'register-job',
      functionArgs: [
        contractPrincipalCV(createContract.split(".")[0], createContract.split(".")[1]),
        uintCV(createFee * 1000000),
        contractPrincipalCV(contractAddress, "arkadiko-job-cost-calculation-v1-1")
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

  useEffect(() => {
    const getUserWalletStx = async () => {
      const client = getRPCClient();
      const url = `${client.url}/extended/v1/address/${stxAddress}/balances`;
      const response = await fetch(url, { credentials: 'omit' });
      const data = await response.json();
      return data.stx.balance;
    };

    const getUserWalletDiko = async () => {
      const call = await callReadOnlyFunction({
        contractAddress: arkadikoAddress,
        contractName: 'arkadiko-token',
        functionName: 'get-balance',
        functionArgs: [
          standardPrincipalCV(stxAddress),
        ],
        senderAddress: stxAddress || '',
        network: network,
      });
      const result = cvToJSON(call).value.value;
      return result;
    };

    const getAccount = async () => {
      const call = await callReadOnlyFunction({
        contractAddress,
        contractName: 'arkadiko-job-registry-v1-1',
        functionName: 'get-account-by-owner',
        functionArgs: [
          standardPrincipalCV(stxAddress),
        ],
        senderAddress: stxAddress || '',
        network: network,
      });
      const result = cvToJSON(call).value;
      return result;
    };

    const getContractInfo = async () => {
      const call = await callReadOnlyFunction({
        contractAddress,
        contractName: 'arkadiko-job-registry-v1-1',
        functionName: 'get-contract-info',
        functionArgs: [],
        senderAddress: stxAddress || contractAddress,
        network: network,
      });
      const result = cvToJSON(call).value;
      return result;
    };

    const getUserJobsInfo = async (jobIds: number[], blockHeight: number) => {
      let rows = [];

      for (const jobId of jobIds) {
        const call = await callReadOnlyFunction({
          contractAddress,
          contractName: 'arkadiko-job-registry-v1-1',
          functionName: 'get-job-by-id',
          functionArgs: [
            uintCV(jobId)
          ],
          senderAddress: stxAddress || '',
          network: network,
        });
        const result = cvToJSON(call).value;

        const jobContract = result.contract.value;
        const callRun = await callReadOnlyFunction({
          contractAddress,
          contractName: 'arkadiko-job-registry-v1-1',
          functionName: 'should-run',
          functionArgs: [
            uintCV(jobId),
            contractPrincipalCV(jobContract.split(".")[0], jobContract.split(".")[1])
          ],
          senderAddress: stxAddress || '',
          network: network,
        });
        const resultRun = cvToJSON(callRun).value.value;

        rows.push(
          <DashboardJobRow
            key={jobId}
            jobId={jobId}
            contract={result.contract.value}
            cost={result.cost.value}
            fee={result.fee.value}
            executions={result.executions.value}
            lastExecuted={result["last-executed"].value}
            enabled={result.enabled.value}
            shouldRun={resultRun}
            currentBlock={blockHeight}
          />
        );
      }

      return rows;
    };

    const fetchInfo = async () => {
      // Fetch info
      const [
        userWalletStx,
        userWalletDiko,
        userAccount,
        contractInfo,
        blockHeight
      ] = await Promise.all([
        getUserWalletStx(),
        getUserWalletDiko(),
        getAccount(),
        getContractInfo(),
        getBlockHeight()
      ]);

      setBalanceWalletStx(userWalletStx);
      setBalanceWalletDiko(userWalletDiko);
      setBalanceAccountDiko(userAccount.diko.value);
      setBalanceAccountStx(userAccount.stx.value);

      setContractInfo(contractInfo);

      var jobIds = [];
      for (const jobInfo of userAccount.jobs.value) {
        jobIds.push(jobInfo.value);
      }

      const jobList = await getUserJobsInfo(jobIds, blockHeight);      
      setJobItems(jobList);

      setIsLoading(false);
    };

    const fetchGeneralInfo = async () => {
      const info = await getContractInfo();
      setContractInfo(info);

      setIsLoading(false);
    };

    if (stxAddress) {
      setIsLoggedIn(true);
      fetchInfo();
    } else {
      setIsLoggedIn(false);
      fetchGeneralInfo();
    }
  }, []);

  const tabs = [
    { name: 'Credit', icon: <PlusCircleIcon className="w-4 h-4 mr-2" aria-hidden="true" /> },
    { name: 'Debit', icon: <MinusCircleIcon className="w-4 h-4 mr-2" aria-hidden="true"/> },
  ]

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <Container>
        <main className="relative flex-1 py-12">
          {isLoggedIn ? (
            <>
            <section>
              <header className="pb-5 border-b border-gray-200 dark:border-zinc-600 sm:flex sm:justify-between sm:items-end">
                <div>
                  <h3 className="text-lg leading-6 text-gray-900 font-headings dark:text-zinc-50">
                    Balances
                  </h3>
                  <p className="max-w-3xl mt-2 text-sm text-gray-500 dark:text-zinc-400 dark:text-zinc-300">
                    Your STX and DIKO balances
                  </p>
                </div>
              </header>
              <div className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="w-full p-4 border border-indigo-200 rounded-lg shadow-sm bg-indigo-50 dark:bg-indigo-200">
                    <h4 className="text-xs text-indigo-700 uppercase font-headings">Your wallet</h4>
                    <dl className="mt-2 space-y-1">
                      
                      <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                        <dt className="inline-flex items-center text-sm font-medium text-indigo-500 dark:text-indigo-700">
                        {isLoading ? (
                          <Placeholder className="py-2" width={Placeholder.width.FULL} />
                        ) : (
                          <>
                            {microToReadable(balanceWalletDiko).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })}{' '}
                            DIKO
                          </>
                        )}
                        </dt>
                      </div>

                      <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                        <dt className="inline-flex items-center text-sm font-medium text-indigo-500 dark:text-indigo-700">
                          {isLoading ? (
                            <Placeholder className="py-2" width={Placeholder.width.FULL} />
                          ) : (
                            <>
                              {microToReadable(balanceWalletStx).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6,
                              })}{' '}
                              STX
                            </>
                          )}
                        </dt>
                      </div>

                    </dl>

                    <h4 className="text-xs text-indigo-700 uppercase font-headings mt-6">Your balance</h4>
                    <dl className="mt-2 space-y-1">
                      
                      <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                        <dt className="inline-flex items-center text-sm font-medium text-indigo-500 dark:text-indigo-700">
                          {isLoading ? (
                            <Placeholder className="py-2" width={Placeholder.width.FULL} />
                          ) : (
                            <>
                              {microToReadable(balanceAccountDiko).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6,
                              })}{' '}
                              DIKO
                              <div className="ml-2">
                                <Tooltip
                                  className="z-10"
                                  shouldWrapChildren={true}
                                  label={`DIKO is used as a reward for keepers who execute a job.`}
                                >
                                  <InformationCircleIcon
                                    className="block w-4 h-4 text-indigo-400 dark:text-indigo-500"
                                    aria-hidden="true"
                                  />
                                </Tooltip>
                              </div>
                            </>
                          )}
                        </dt>
                      </div>

                      <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                        <dt className="inline-flex items-center text-sm font-medium text-indigo-500 dark:text-indigo-700">
                          {isLoading ? (
                            <Placeholder className="py-2" width={Placeholder.width.FULL} />
                          ) : (
                            <>
                              {microToReadable(balanceAccountStx).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6,
                              })}{' '}
                              STX
                              <div className="ml-2">
                                <Tooltip
                                  className="z-10"
                                  shouldWrapChildren={true}
                                  label={`STX is used to cover the fees when executing a job.`}
                                >
                                  <InformationCircleIcon
                                    className="block w-4 h-4 text-indigo-400 dark:text-indigo-500"
                                    aria-hidden="true"
                                  />
                                </Tooltip>
                              </div>
                            </>
                          )}
                        </dt>
                      </div>

                      {jobItems.length > 0 && (balanceAccountDiko < 10000000 || balanceAccountStx < 1000) ? (
                        <h3 className='text-sm font-semibold text-red-700'>
                          Your jobs can not be executed as your account balance is too low.
                        </h3>
                      ): null}

                    </dl>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="relative bg-white rounded-lg shadow dark:bg-zinc-900">
                      <div className="flex flex-col p-4">
                        <Tab.Group>
                          <Tab.List className="group p-0.5 rounded-lg flex w-full bg-gray-50 hover:bg-gray-100 dark:bg-zinc-300 dark:hover:bg-zinc-200">
                            {tabs.map((tab, tabIdx) => (
                              <Tab as={Fragment} key={tabIdx}>
                                {({ selected }) => (
                                  <button className={
                                    classNames(
                                      `p-1.5 lg:pl-2.5 lg:pr-3.5 rounded-md flex items-center justify-center flex-1 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus:outline-none focus-visible:ring-offset-gray-100 ${tabIdx === 1 ? 'ml-0.5': ''}`,
                                      selected
                                      ? 'text-sm text-gray-600 font-medium bg-white ring-1 ring-black ring-opacity-5'
                                      : ''
                                    )}
                                  >
                                    <span className="inline-flex items-center text-sm font-medium rounded-md">
                                      <span className={
                                          selected
                                            ? 'text-indigo-500'
                                            : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-zinc-900'
                                        }
                                      >
                                        {tab.icon}
                                      </span>
                                      <span className="text-gray-900">{tab.name}</span>
                                    </span>
                                  </button>
                                )}
                              </Tab>
                            ))}
                          </Tab.List>
                          <Tab.Panels className="mt-4">
                            <Tab.Panel>
                              {isLoading ? (
                                <>
                                  <Placeholder className="py-2" width={Placeholder.width.FULL} />
                                  <Placeholder className="py-2" width={Placeholder.width.FULL} />
                                </>
                              ) : (
                                <>
                                  <InputAmount
                                    balance={microToReadable(balanceWalletDiko).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    })}
                                    token='DIKO'
                                    inputValue={depositAmountDiko}
                                    onInputChange={onInputDepositDikoChange}
                                    onClickMax={depositMaxAmountDiko}
                                  />
                                  <InputAmount
                                    balance={microToReadable(balanceWalletStx).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    })}
                                    token='STX'
                                    inputValue={depositAmountStx}
                                    onInputChange={onInputDepositStxChange}
                                    onClickMax={depositMaxAmountStx}
                                  />
                                  <button
                                    type="button"
                                    className="inline-flex justify-center px-4 py-2 mb-4 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    // disabled={buttonStakeDisabled}
                                    onClick={creditAccount}
                                  >
                                    Credit account
                                  </button>
                                </>
                              )}
                            </Tab.Panel>

                            <Tab.Panel>
                              {isLoading ? (
                                <>
                                  <Placeholder className="py-2" width={Placeholder.width.FULL} />
                                  <Placeholder className="py-2" width={Placeholder.width.FULL} />
                                </>
                              ) : (
                                <>
                                  <InputAmount
                                    balance={microToReadable(balanceAccountDiko).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    })}
                                    token='DIKO'
                                    inputValue={withdrawAmountDiko}
                                    onInputChange={onInputWithdrawDikoChange}
                                    onClickMax={withdrawMaxAmountDiko}
                                  />
                                  <InputAmount
                                    balance={microToReadable(balanceAccountStx).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 6,
                                    })}
                                    token='STX'
                                    inputValue={withdrawAmountStx}
                                    onInputChange={onInputWithdrawStxChange}
                                    onClickMax={withdrawMaxAmountStx}
                                  />
                                  <button
                                    type="button"
                                    className="inline-flex justify-center px-4 py-2 mb-4 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                    // disabled={buttonUnstakeDisabled}
                                    onClick={debitAccount}
                                  >
                                    Debit account
                                  </button>
                                </>
                              )}
                            </Tab.Panel>
                          </Tab.Panels>
                        </Tab.Group>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative mt-8 overflow-hidden">
              <header className="pb-5 border-b border-gray-200 dark:border-zinc-600">
                <h3 className="text-lg leading-6 text-gray-900 font-headings dark:text-zinc-50">
                  Jobs
                </h3>
                <p className="max-w-3xl mt-2 text-sm text-gray-500 dark:text-zinc-400 dark:text-zinc-300">
                  Your registered jobs
                </p>
              </header>

              <div className="flex flex-col mt-4">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  {isLoading ? (
                    <>
                      <Placeholder className="py-2" width={Placeholder.width.FULL} />
                      <Placeholder className="py-2" width={Placeholder.width.FULL} />
                    </>
                  ) : jobItems.length == 0 ? (
                    <EmptyState
                      Icon={CollectionIcon}
                      title="No registered jobs yet"
                      description="Start by registering your first job below."
                    />
                  ) : (
                    <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-zinc-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-600">
                        <thead className="bg-gray-50 dark:bg-zinc-800 dark:bg-opacity-80">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-zinc-400"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-zinc-400"
                            >
                              Contract
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-zinc-400"
                            >
                              Cost
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-zinc-400"
                            >
                              Fee
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-zinc-400"
                            >
                              Executions
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-zinc-400"
                            >
                              Last executed
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-zinc-400"
                            >
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>

                        {jobItems}

                      </table>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </section>

            <section className="relative mt-8 overflow-hidden">
              <header className="pb-5 border-b border-gray-200 dark:border-zinc-600">
                <h3 className="text-lg leading-6 text-gray-900 font-headings dark:text-zinc-50">
                  New Job
                </h3>
                <p className="max-w-3xl mt-2 text-sm text-gray-500 dark:text-zinc-400 dark:text-zinc-300">
                  Register a new job
                </p>
              </header>

              <div className="mt-4">
                <div className="w-full p-4 border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-200">

                  <p className="mt-2 text-sm">
                    The full address for the job contract, which should implement the trait <i>arkadiko-automation-trait-v1</i>. 
                  </p>

                  <p className="inline-flex items-center text-indigo-700 underline hover:text-indigo-600">
                    <a
                      href="https://docs.arkadiko.finance/keepers/keepers-compatible-contracts"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn how to create a job contract.
                    </a>
                    <StyledIcon as="ExternalLinkIcon" size={4} className="block ml-2" />
                  </p>

                  <div className="inline-flex items-center w-full min-w-0 mt-2 mb-2 border border-gray-300 rounded-md focus-within:ring-indigo-500 focus-within:border-indigo-500 dark:bg-zinc-700 dark:border-zinc-500">
                    <input
                      type="text"
                      // inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      // pattern="^[0-9]*[.,]?[0-9]*$"
                      placeholder=""
                      // name={inputName}
                      // id={inputId}
                      // aria-label={inputLabel}
                      className="flex-1 min-w-0 px-3 mr-2 border-0 rounded-md sm:text-sm focus:outline-none focus:ring-0 dark:bg-zinc-700 dark:text-zinc-200"
                      value={createContract}
                      onChange={onInputCreateContractChange}
                      autoFocus={true}
                    />
                  </div>

                  <p className="mt-2 text-sm">
                    The STX transaction fee you will pay each time the job is executed.
                  </p>

                  <div className="inline-flex items-center w-full min-w-0 mt-2 mb-2 border border-gray-300 rounded-md focus-within:ring-indigo-500 focus-within:border-indigo-500 dark:bg-zinc-700 dark:border-zinc-500">
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      pattern="^[0-9]*[.,]?[0-9]*$"
                      placeholder="0.001"
                      // name={inputName}
                      // id={inputId}
                      // aria-label={inputLabel}
                      className="flex-1 min-w-0 px-3 mr-2 border-0 rounded-md sm:text-sm focus:outline-none focus:ring-0 dark:bg-zinc-700 dark:text-zinc-200"
                      value={createFee}
                      onChange={onInputCreateFeeChange}
                      autoFocus={true}
                    />
                  </div>

                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 mb-2 mt-4 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    // disabled={buttonStakeDisabled}
                    onClick={registerJob}
                  >
                    Register job
                  </button>

                </div>
              </div>
            </section>
            </>
          ) : null}

          <section>
            <header className="pb-5 border-b border-gray-200 dark:border-zinc-600 sm:flex sm:justify-between sm:items-end">
              <div>
                <h3 className="text-lg leading-6 text-gray-900 font-headings dark:text-zinc-50">
                  Registry
                </h3>
                <p className="max-w-3xl mt-2 text-sm text-gray-500 dark:text-zinc-400 dark:text-zinc-300">
                  Basic registry information
                </p>
              </div>
            </header>
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                
                <div className="w-full p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-200">
                  <dl className="mt-2 space-y-1">
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-700">
                        Contract enabled
                        <div className="ml-2">
                          <Tooltip
                            className="z-10"
                            shouldWrapChildren={true}
                            label={`If enabled, jobs can be registered and executed.`}
                          >
                            <InformationCircleIcon
                              className="block w-4 h-4 text-gray-400 dark:text-gray-500"
                              aria-hidden="true"
                            />
                          </Tooltip>
                        </div>
                      </dt>
                      <dt className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:text-right">
                        {isLoading ? (
                          <Placeholder className="py-2" width={Placeholder.width.FULL} />
                        ) : contractInfo["contract-enabled"].value ? (
                          <>yes</>
                        ) : (
                          <>no</>
                        )}
                      </dt>
                    </div>

                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-700">
                        Withdraw enabled
                        <div className="ml-2">
                          <Tooltip
                            className="z-10"
                            shouldWrapChildren={true}
                            label={`If enabled, you are able to debit DIKO and STX which you deposited.`}
                          >
                            <InformationCircleIcon
                              className="block w-4 h-4 text-gray-400 dark:text-gray-500"
                              aria-hidden="true"
                            />
                          </Tooltip>
                        </div>
                      </dt>
                      <dt className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:text-right">
                        {isLoading ? (
                          <Placeholder className="py-2" width={Placeholder.width.FULL} />
                        ) : contractInfo["withdraw-enabled"].value ? (
                          <>yes</>
                        ) : (
                          <>no</>
                        )}
                      </dt>
                    </div>
                  </dl>
                </div>

                <div className="w-full p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-200">
                  <dl className="mt-2 space-y-1">
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-700">
                        Minimum fee
                        <div className="ml-2">
                          <Tooltip
                            className="z-10"
                            shouldWrapChildren={true}
                            label={`The minimum STX fee to run a job.`}
                          >
                            <InformationCircleIcon
                              className="block w-4 h-4 text-gray-400 dark:text-gray-500"
                              aria-hidden="true"
                            />
                          </Tooltip>
                        </div>
                      </dt>
                      <dt className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:text-right">
                        {isLoading ? (
                          <Placeholder className="py-2" width={Placeholder.width.FULL} />
                        ) : (
                          <>
                            {microToReadable(contractInfo["minimum-fee"].value).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })}{' '}
                            STX
                          </>
                        )}
                      </dt>
                    </div>

                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-700">
                        Job cost
                        <div className="ml-2">
                          <Tooltip
                            className="z-10"
                            shouldWrapChildren={true}
                            label={`Cost in DIKO for executing the job.`}
                          >
                            <InformationCircleIcon
                              className="block w-4 h-4 text-gray-400 dark:text-gray-500"
                              aria-hidden="true"
                            />
                          </Tooltip>
                        </div>
                      </dt>
                      <dt className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:text-right">
                        {isLoading ? (
                          <Placeholder className="py-2" width={Placeholder.width.FULL} />
                        ) : (
                          <>
                            10 DIKO
                          </>
                        )}
                      </dt>
                    </div>

                  </dl>
                </div>

                <div className="w-full p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-200">
                  <dl className="mt-2 space-y-1">
                    
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-700">
                        Total jobs
                        <div className="ml-2">
                          <Tooltip
                            className="z-10"
                            shouldWrapChildren={true}
                            label={`Total amount of jobs registered in the system.`}
                          >
                            <InformationCircleIcon
                              className="block w-4 h-4 text-gray-400 dark:text-gray-500"
                              aria-hidden="true"
                            />
                          </Tooltip>
                        </div>
                      </dt>
                      <dt className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:text-right">
                        {isLoading ? (
                          <Placeholder className="py-2" width={Placeholder.width.FULL} />
                        ) : (
                          <>
                            {contractInfo["last-job-id"].value}
                          </>
                        )}
                      </dt>
                    </div>

                  </dl>
                </div>
                
              </div>
            </div>
          </section>

        </main>
      </Container>
    </>
  );
};
