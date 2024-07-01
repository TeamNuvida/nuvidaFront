import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Signin from './screen/signin';

const Stack = createStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Signin">
          <Stack.Screen name="Signin" component={Signin} options={{ headerShown: false }}/>
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
  );
}