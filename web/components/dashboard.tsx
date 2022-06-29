import React, { Fragment, useContext, useEffect, useState } from 'react';
import { AppContext } from '@common/context';
import { Tooltip } from '@blockstack/ui';
import { InformationCircleIcon, MinusCircleIcon, PlusCircleIcon } from '@heroicons/react/solid';
import { Placeholder } from "./ui/placeholder";
import { microToReadable } from '@common/utils';
import { Tab } from '@headlessui/react';
import { InputAmount } from './ui/input-amount';
import { classNames } from '@common/class-names';
import { Helmet } from 'react-helmet';
import { Container } from './home';
import { DashboardJobRow } from './dashboard-job-row';

export const Dashboard = () => {

  const [state, setState] = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  const [depositAmountDiko, setDepositAmountDiko] = useState(0);
  const [depositAmountStx, setDepositAmountStx] = useState(0);
  const [withdrawAmountDiko, setWithdrawAmountDiko] = useState(0);
  const [withdrawAmountStx, setWithdrawAmountStx] = useState(0);

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

  const depositMaxAmountDiko = () => {
    // setStakeAmount((state.balance['usda'] / 1000000).toString());
  };

  const depositMaxAmountStx = () => {
    // setStakeAmount((state.balance['usda'] / 1000000).toString());
  };

  const withdrawMaxAmountDiko = () => {
    // setUnstakeAmount((userPooled / 1000000).toString());
  };

  const withdrawMaxAmountStx = () => {
    // setUnstakeAmount((userPooled / 1000000).toString());
  };

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

          <section>
            <header className="pt-10 pb-5 border-b border-gray-200 dark:border-zinc-600 sm:flex sm:justify-between sm:items-end">
              <div>
                <h3 className="text-lg leading-6 text-gray-900 font-headings dark:text-zinc-50">
                  Balances
                </h3>
                <p className="max-w-3xl mt-2 text-sm text-gray-500 dark:text-zinc-400 dark:text-zinc-300">
                  Your STX and DIKO balances.
                </p>
              </div>
            </header>
            <div className="mt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="w-full p-4 border border-teal-200 rounded-lg shadow-sm bg-teal-50 dark:bg-teal-200">
                  <h4 className="text-xs text-teal-700 uppercase font-headings">Your wallet</h4>
                  <dl className="mt-2 space-y-1">
                    
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-teal-500 dark:text-teal-700">
                        xxx DIKO
                      </dt>
                    </div>

                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-teal-500 dark:text-teal-700">
                        xxx STX
                      </dt>
                    </div>

                  </dl>

                  <h4 className="text-xs text-teal-700 uppercase font-headings mt-6">Your balance</h4>
                  <dl className="mt-2 space-y-1">
                    
                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-teal-500 dark:text-teal-700">
                        {microToReadable(state.balance['diko']).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                        xxx DIKO
                        <div className="ml-2">
                          <Tooltip
                            className="z-10"
                            shouldWrapChildren={true}
                            label={`DIKO is used as a reward for keepers who execute a job.`}
                          >
                            <InformationCircleIcon
                              className="block w-4 h-4 text-teal-400 dark:text-teal-500"
                              aria-hidden="true"
                            />
                          </Tooltip>
                        </div>
                      </dt>
                    </div>

                    <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                      <dt className="inline-flex items-center text-sm font-medium text-teal-500 dark:text-teal-700">
                        xxx STX
                        <div className="ml-2">
                          <Tooltip
                            className="z-10"
                            shouldWrapChildren={true}
                            label={`STX is used to cover the fees when executing a job.`}
                          >
                            <InformationCircleIcon
                              className="block w-4 h-4 text-teal-400 dark:text-teal-500"
                              aria-hidden="true"
                            />
                          </Tooltip>
                        </div>
                      </dt>
                    </div>

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
                                    `p-1.5 lg:pl-2.5 lg:pr-3.5 rounded-md flex items-center justify-center flex-1 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus:outline-none focus-visible:ring-offset-gray-100 ${tabIdx === 1 ? 'ml-0.5': ''}`,
                                    selected
                                    ? 'text-sm text-gray-600 font-medium bg-white ring-1 ring-black ring-opacity-5'
                                    : ''
                                  )}
                                >
                                  <span className="inline-flex items-center text-sm font-medium rounded-md">
                                    <span className={
                                        selected
                                          ? 'text-teal-500'
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
                              <Placeholder className="py-2" width={Placeholder.width.FULL} />
                            ) : (
                              <>
                                <InputAmount
                                  balance={microToReadable(123).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6,
                                  })}
                                  token='DIKO'
                                  inputValue={depositAmountDiko}
                                  onInputChange={onInputDepositDikoChange}
                                  onClickMax={depositMaxAmountDiko}
                                />
                                <InputAmount
                                  balance={microToReadable(123).toLocaleString(undefined, {
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
                                  className="inline-flex justify-center px-4 py-2 mb-4 text-base font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:col-start-2 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                  // disabled={buttonStakeDisabled}
                                  // onClick={stake}
                                >
                                  Credit account
                                </button>
                              </>
                            )}
                          </Tab.Panel>

                          <Tab.Panel>
                            {isLoading ? (
                              <Placeholder className="py-2" width={Placeholder.width.FULL} />
                            ) : (
                              <>
                                <InputAmount
                                  balance={microToReadable(555).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 6,
                                  })}
                                  token='DIKO'
                                  inputValue={withdrawAmountDiko}
                                  onInputChange={onInputWithdrawDikoChange}
                                  onClickMax={withdrawMaxAmountDiko}
                                />
                                <InputAmount
                                  balance={microToReadable(555).toLocaleString(undefined, {
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
                                  className="inline-flex justify-center px-4 py-2 mb-4 text-base font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:col-start-2 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                  // disabled={buttonUnstakeDisabled}
                                  // onClick={unstake}
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

                      <DashboardJobRow
                          contract={'contract-name'}
                          cost={10000000}
                          fee={1000}
                          executions={10}
                          lastExecuted={64392}
                          enabled={true}
                      />

                    </table>
                  </div>
                </div>
              </div>
            </div>

          </section>

        </main>
      </Container>
    </>
  );
};
