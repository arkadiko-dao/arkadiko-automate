import React, { useContext, useEffect, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { AppContext } from '@common/context';
import { NavLink as RouterLink } from 'react-router-dom';
import { useConnect } from '@stacks/connect-react';
import { bnsName } from '@common/use-stx-address';
import { StyledIcon } from './ui/styled-icon';
import { ExternalLinkIcon } from '@heroicons/react/solid';

interface HeaderProps {
  signOut: () => void;
}

const shortAddress = (address: string | null) => {
  if (address) {
    if (address.includes('.')) {
      return address;
    }
    return `${address.substring(0, 5)}...${address.substring(address.length, address.length - 5)}`;
  }

  return '';
};

export const Header: React.FC<HeaderProps> = ({ signOut }) => {
  const [state, _] = useContext(AppContext);
  const { doOpenAuth } = useConnect();
  const name = bnsName();

  useEffect(() => {
    let mounted = true;

    const getData = async () => {
    
    };


    if (mounted) {
      void getData();
    }

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Disclosure as="nav" className="relative sticky top-0 z-50 bg-white shadow dark:bg-zinc-900">
      {({ open }) => (
        <>
          <div className="px-4 px-6 mx-auto max-w-7xl lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex justify-between flex-1">
                <RouterLink className="flex items-center shrink-0" to="/">
                  <span className="inline-block ml-2 text-lg font-bold align-middle font-headings text-zinc-900 dark:text-zinc-100">
                    🤖 Arkadiko Keepers
                  </span>
                </RouterLink>

                <RouterLink
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent dark:text-zinc-100 hover:border-gray-300 hover:text-gray-700"
                  activeClassName="border-indigo-500 text-gray-900"
                >
                  Dashboard
                </RouterLink>

                {state.userData ? (
                  <div className="hidden lg:ml-6 lg:flex lg:space-x-6">

                    <button
                      type="button"
                      className="block px-1 text-sm font-medium text-gray-500 dark:text-white hover:text-gray-700 "
                    >
                      <span className="inline-block w-3 h-3 pt-2 mr-2 bg-zinc-400 border-2 border-white rounded-full"></span>
                      {shortAddress(name)}
                    </button>

                    <button
                      type="button"
                      className="block px-1 text-sm font-medium text-indigo-500 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                      onClick={() => {
                        signOut();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:ml-6 lg:flex lg:space-x-6 lg:items-center">
                    <div>
                      <button
                        type="button"
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 "
                        onClick={() => doOpenAuth()}
                      >
                        <span>Connect Wallet</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center -mr-2 lg:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-gray-500 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <StyledIcon as="XIcon" size={6} solid={false} className="block" />
                  ) : (
                    <StyledIcon as="MenuIcon" size={6} solid={false} className="block" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            {state.userData ? (
              <div>
                <div className="pt-2 pb-3 space-y-1">
                  
                  <Disclosure.Button
                    as={RouterLink}
                    to="/dashboard"
                    className="block py-2 pl-3 pr-4 text-base font-medium text-gray-500 border-l-4 border-transparent dark:text-zinc-100 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:hover:bg-zinc-700"
                    activeClassName="border-indigo-500 text-gray-900"
                  >
                    Dashboard
                  </Disclosure.Button>
                </div>
                <div className="pt-4 pb-3 border-t border-gray-300 dark:border-zinc-600">
                  <div className="space-y-1">
                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-base font-medium text-left text-gray-500 dark:text-white hover:text-gray-800 hover:bg-gray-100 sm:px-6 dark:hover:bg-zinc-700"
                    >
                      <span className="inline-block w-3 h-3 pt-2 mr-2 bg-zinc-400 border-2 border-white rounded-full"></span>
                      {shortAddress(name)}
                    </button>

                    <button
                      type="button"
                      className="block w-full px-4 py-2 text-base font-medium text-left text-indigo-500 hover:text-indigo-800 hover:bg-indigo-100 sm:px-6"
                      onClick={() => {
                        signOut();
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="p-3 border-t border-gray-200">
                  <button
                    type="button"
                    className="relative inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => doOpenAuth()}
                  >
                    <span>Connect Wallet</span>
                  </button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
