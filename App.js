import { StatusBar } from 'expo-status-bar';
import React, {useEffect} from 'react';
import { StyleSheet, Text, View , AppRegistry} from 'react-native';
import Routes from './navigation/index.js'



export default function App() {

  return (
      <Routes/>
  );
}

AppRegistry.registerComponent('Drinkly', () => App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
