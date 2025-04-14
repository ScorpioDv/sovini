import React from 'react';
import { View, Text, StyleSheet, I18nManager } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Enable RTL for Arabic language
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function App() {

  return (
    <AppNavigator />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
