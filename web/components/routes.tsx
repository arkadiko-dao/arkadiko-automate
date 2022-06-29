import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Dashboard } from './dashboard';

export const routerConfig = [
  {
    path: '/',
    component: Dashboard,
  },
];

export function Routes() {
  return (
    <Switch>
      <Route exact path="/" component={Dashboard} />

      <Route exact path="/dashboard" component={Dashboard} />

      <Redirect to="/" />
    </Switch>
  );
}
