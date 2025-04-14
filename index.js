import { registerRootComponent } from 'expo';
import { Platform, LogBox } from 'react-native';

import App from './App';

// Ignore specific warnings that might appear during development
LogBox.ignoreLogs([
  'Require cycle:',
  'Remote debugger',
  'Possible Unhandled Promise Rejection',
]);

// Register the main component
registerRootComponent(App);
