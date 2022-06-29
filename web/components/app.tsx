import React, { useEffect, useState } from 'react';
import { ThemeProvider, theme } from '@blockstack/ui';
import { Connect } from '@stacks/connect-react';
import { AuthOptions } from '@stacks/connect';
import { UserSession, AppConfig } from '@stacks/auth';
import { defaultState, AppContext, AppState } from '@common/context';
import { Header } from '@components/header';
import { Routes } from '@components/routes';
import { resolveSTXAddress } from '@common/use-stx-address';
import { TxStatus } from '@components/ui/tx-status';
import { useLocation } from 'react-router-dom';
import { initiateConnection } from '@common/websocket-tx-updater';
import { Helmet } from 'react-helmet';


const icon = 'https://arkadiko.finance/favicon.ico';
export const App: React.FC = () => {
  const [state, setState] = React.useState<AppState>(defaultState());
  const location = useLocation();

  const appConfig = new AppConfig(['store_write', 'publish_data'], document.location.href);
  const userSession = new UserSession({ appConfig });

  useEffect(() => {
    setState(prevState => ({ ...prevState, currentTxId: '', currentTxStatus: '' }));
  }, [location.pathname]);

  const signOut = () => {
    userSession.signUserOut();
    setState(defaultState());
  };

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();

      const getData = async () => {
        try {
          const address = resolveSTXAddress(userData);
          initiateConnection(address, setState);
        } catch (error) {
          console.error(error);
        }
      };
      void getData();
    } else {

    }
  }, []);

  const handleRedirectAuth = async () => {
    if (userSession.isSignInPending()) {
      const userData = await userSession.handlePendingSignIn();

      setState(prevState => ({ ...prevState, userData }));
    }
  };

  React.useEffect(() => {
    void handleRedirectAuth();
  }, []);

  const authOptions: AuthOptions = {
    manifestPath: '/static/manifest.json',
    redirectTo: '/',
    userSession,
    onFinish: ({ userSession }) => {
      const userData = userSession.loadUserData();

      setState(prevState => ({ ...prevState, userData }));
    },
    appDetails: {
      name: 'Arkadiko Automation',
      icon,
    },
  };

  return (
    <Connect authOptions={authOptions}>
      <ThemeProvider theme={theme}>
        <AppContext.Provider value={[state, setState]}>
          <Helmet titleTemplate="Arkadiko Automation - %s" defaultTitle="Arkadiko Automatio" />
          <div className="flex flex-col font-sans bg-white dark:bg-zinc-900 min-height-screen">
            <Header signOut={signOut} />
            <TxStatus />
            <Routes />
          </div>
        </AppContext.Provider>
      </ThemeProvider>
    </Connect>
  );
};
