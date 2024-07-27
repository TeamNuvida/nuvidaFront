import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import signin from './screen/signin';
import signUp from './screen/signUp';
import calculate from './screen/calculate';
import reservationInfo from './screen/reservationInfo';

const Stack = createStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="reservationInfo">
          <Stack.Screen name="signin" component={signin} options={{ headerShown: false }}/>
          <Stack.Screen name="signUp" component={signUp} options={{ headerShown: false }}/>
            <Stack.Screen name="calculate" component={calculate} options={{ headerShown: false }}/>
            <Stack.Screen name="reservationInfo" component={reservationInfo} options={{ headerShown: false }}/>
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
  );
}