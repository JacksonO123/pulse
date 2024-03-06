import { PulseRouter, Route } from '@jacksonotto/pulse';
import App from './App';
import Test from './Test';

const routes: Route[] = [
  {
    path: '/',
    element: () => <App />
  },
  { path: '/testing', element: () => <Test /> }
];

const Router = () => {
  return <PulseRouter routes={routes} />;
};

export default Router;
