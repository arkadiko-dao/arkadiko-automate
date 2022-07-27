import React, { useContext } from 'react';
import { Disclosure } from '@headlessui/react';
import { AppContext } from '@common/context';
import { NavLink as RouterLink } from 'react-router-dom';
import { useConnect } from '@stacks/connect-react';
import { bnsName } from '@common/use-stx-address';
import { StyledIcon } from './ui/styled-icon';

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

  return (
    <Disclosure as="nav" className="relative sticky top-0 z-50 bg-white shadow dark:bg-zinc-900">
      {({ open }) => (
        <>
          <div className="px-4 px-6 mx-auto max-w-7xl lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex justify-between flex-1">
                <RouterLink className="flex items-center shrink-0" to="/">
                  <svg className="w-auto text-zinc-900 lg:block sm:h-8" viewBox="0 0 60 46" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M19.03 1.54A2.68 2.68 0 0121.46 0h11.48c.95 0 1.82.49 2.3 1.29L59.62 41.6c.5.82.5 1.84.03 2.66a2.69 2.69 0 01-2.33 1.34h-12a2.7 2.7 0 01-1.9-.77 31.32 31.32 0 00-16.15-8.17c-6.8-1.09-14.81.4-22.7 8.17a2.71 2.71 0 01-3.42.3 2.62 2.62 0 01-.9-3.28L19.02 1.54zm7.1 3.75L46.86 40.3h5.74L31.42 5.3h-5.29zm10.89 28.89L21.75 8.37 9.55 34.55a29.17 29.17 0 0118.58-3.1c3.2.5 6.2 1.5 8.89 2.73z" /></svg>
                  <div className="flex flex-col">
                    <div className="ml-4 text-xl font-bold leading-none align-middle text-zinc-900 font-headings">Arkadiko</div>
                    <div className="ml-4 mt-0.5 text-base font-bold leading-none tracking-widest text-indigo-400 uppercase">Keepers</div>
                  </div>
                </RouterLink>

                {state.userData ? (
                  <div className="hidden lg:ml-6 lg:flex lg:space-x-6">

                    <button
                      type="button"
                      className="block px-1 text-sm font-medium text-gray-500 dark:text-white hover:text-gray-700 "
                    >
                      <span className="inline-block w-3 h-3 pt-2 mr-2 bg-green-400 border-2 border-white rounded-full"></span>
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
                <div className="pt-4 pb-3 border-t border-gray-300 dark:border-zinc-600">
                  <div className="space-y-1">
                    <div
                      className="block w-full px-4 py-2 text-base font-medium text-left text-gray-500 dark:text-white hover:text-gray-800 hover:bg-gray-100 sm:px-6 dark:hover:bg-zinc-700"
                    >
                      <span className="inline-block w-3 h-3 pt-2 mr-2 bg-green-400 border-2 border-white rounded-full"></span>
                      {shortAddress(name)}
                    </div>

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
