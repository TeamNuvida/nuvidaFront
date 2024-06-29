import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect} from 'react';
import axios from 'axios';


export default function App() {

  const localhost = "192.168.219.105";

  useEffect(() => {

    const test = async () => {
      try {
        // 예를 들어, 사용자 ID를 서버로 보내 관심 매장 목록을 요청하는 경우
        const response = await axios.post(`http://${localhost}:8090/nuvida/test`);
        console.log(response.data)
      } catch (error) {
        console.error(error );
      }
    };

    test();
  }, []);

  return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
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

