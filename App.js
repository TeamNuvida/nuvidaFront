import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Signin from './screen/signin';
import SignUp from './screen/signUp';
import Calculate from './screen/calculate';
import ReservationInfo from './screen/reservationInfo';
import MemberList from './screen/memberList';
import TripSchedule from "./screen/tripSchedule";
import TripCalendar from "./screen/tripCalendar";
import FavoriteList from "./screen/favoritePage"
import FriendList from "./screen/friend_management"
import Mypage from "./screen/mypage"
import MypostList from "./screen/mypostList";
import TravelLog from "./screen/travelLog";
import Userprofile from "./screen/userprofile";
import PinBall from "./screen/PinBall";
import Main from "./screen/main";
import BaseballSchedule from "./screen/baseballSchedule"
import ScheduleCreation1 from "./screen/scheduleCreation1"
import ScheduleCreation2 from "./screen/scheduleCreation2"
import ScheduleCreation3 from "./screen/scheduleCreation3"
import ScheduleCreation4 from "./screen/scheduleCreation4"
import ScheduleCreation5 from "./screen/scheduleCreation5"
import ScheduleCreation6 from "./screen/scheduleCreation6"
import ScheduleCreationAccommodation from "./screen/scheduleCreationAccommodation"
import CommunityList from "./screen/communityList"
import CommunityInfo from "./screen/communityInfo"
import WritingPost from "./screen/writingPost"
import Betting from "./screen/betting"
import ScheduleCreation7 from "./screen/scheduleCreation7"
import ScheduleCreation8 from "./screen/scheduleCreation8"
import NoticeList from "./screen/noticeList";
import axios from "axios";

const Stack = createStackNavigator();

export default function App() {

    // API KEY
    const API_KEY = "q9%2BtR1kSmDAYUNoOjKOB3vkl1rLYVTSEVfg4sMDG2UYDAL4KiJo5GaFq9nfn%2FdUnUFjK%2FrOY3UfgJvHtOBAEmQ%3D%3D";

    const [isReady, setIsReady] = useState(false);

    const [weatherData, setWeatherData] = useState(null); // 날씨
    const [particulateMatterData, setParticulateMatterData] = useState(null); // 미세먼지
    const [storeList, setStoreList] = useState(null);
    const [locationList, setLocationList] = useState(null);


    useEffect(() => {
        const prepareResources = async () => {
            const date = new Date();
            const base_date = formatWeatherDate(date);
            const base_time = formatWeatherTime(date);

            try {
                const response = await axios.get(`http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${API_KEY}&numOfRows=60&pageNo=1&base_date=${base_date}&base_time=${base_time}&nx=59&ny=74&dataType=JSON`);

                const items = response.data.response.body.items.item;

                const fcstTime = formatFcstTime(base_time);

                const filteredItems = items.filter(item => item.fcstTime === fcstTime)
                    .reduce((acc, item) => {
                        acc[item.category] = item.fcstValue;
                        return acc;
                    }, {});

                setWeatherData(filteredItems);
            }catch (e) {
                console.error(e)
            }finally {

                try {
                    const responseParticulateMatterData = await axios.get(`http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?sidoName=광주&pageNo=1&numOfRows=100&returnType=json&serviceKey=${API_KEY}&ver=1.3`);
                    const itemsParticulateMatterData = responseParticulateMatterData.data.response.body.items;
                    const filteredItemsParticulateMatterData = itemsParticulateMatterData.filter(item => item.stationName === "농성동") // 농성동이 제일 가까운 관측소여서 여기로 설정함
                        .map(item => (
                            { pm10Grade1h: item.pm10Grade1h, pm25Grade1h: item.pm25Grade1h }
                        ));

                    console.log(itemsParticulateMatterData)
                    setParticulateMatterData(filteredItemsParticulateMatterData);


                    const storeListNum = await axios.get(`http://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}&numOfRows=20&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=E&mapX=126.8889925&mapY=35.168339&radius=5000&listYN=N&_type=JSON&contentTypeId=39`)
                    const storeNum = storeListNum.data.response.body.items.item[0].totalCnt;
                    const storeResponse = await axios.get(`http://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}&numOfRows=${storeNum}&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=E&mapX=126.8889925&mapY=35.168339&radius=5000&listYN=Y&_type=JSON&contentTypeId=39`)

                    const storeList = storeResponse.data.response.body.items.item.sort(() => Math.random() - 0.5).slice(0,5);
                    setStoreList(storeList);


                    const locationListNum = await axios.get(`http://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}&numOfRows=20&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=E&mapX=126.8889925&mapY=35.168339&radius=5000&listYN=N&_type=JSON&contentTypeId=12`)
                    const locationNum = locationListNum.data.response.body.items.item[0].totalCnt;
                    const locationResponse = await axios.get(`http://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}&numOfRows=${locationNum}&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=E&mapX=126.8889925&mapY=35.168339&radius=5000&listYN=Y&_type=JSON&contentTypeId=12`)

                    const locationList = locationResponse.data.response.body.items.item.sort(() => Math.random() - 0.5).slice(0,5);
                    setLocationList(locationList);


                } catch (e) {
                    console.warn(e);
                } finally {
                    setIsReady(true);
                }

            }

        };

        prepareResources();
    }, []);


    // 날짜 표시 변경 -> 날씨 api
    const formatWeatherDate = (date) => {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);

        return (year + month + day).toString();
    };

    // 시간 표시 변경 -> 날씨 api
    const formatWeatherTime = (date) => {
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);

        if (minutes >= '45') {
            return (hours + '45').toString();
        } else {
            const getHoursTime = date.getHours() - 1;
            const setHoursTime = ('0' + getHoursTime).slice(-2);

            return (setHoursTime + '00').toString();
        }
    };

    // 기준 시간 -> 예측 시간으로 변경
    const formatFcstTime = (base_time) => {
        const hours = parseInt(base_time.slice(0, 2), 10);
        let nextHour = hours + 1;

        if (nextHour >= 24) {
            return "0000";
        } else {
            return nextHour.toString().padStart(2, '0') + "00";
        }
    };


    if (!isReady) {
        // 로딩 중일 때 GIF 로딩 화면 표시
        return (
            <View style={styles.loadingContainer}>
                <Image
                    source={require('./assets/loading_test.gif')}
                    style={styles.gif}
                    contentFit="cover"
                />
            </View>
        );
    }

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Main">
          <Stack.Screen name="Signin" component={Signin} options={{ headerShown: false }}/>
          <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }}/>
            <Stack.Screen name="Calculate" component={Calculate} options={{ headerShown: false }}/>
            <Stack.Screen name="ReservationInfo" component={ReservationInfo} options={{ headerShown: false }}/>
            <Stack.Screen name="MemberList" component={MemberList} options={{headerShown: false}}/>
            <Stack.Screen name="TripSchedule" component={TripSchedule} options={{headerShown: false}}/>
            <Stack.Screen name="TripCalendar" component={TripCalendar} options={{headerShown: false}}/>
            <Stack.Screen name="FavoriteList" component={FavoriteList} options={{headerShown: false}}/>
            <Stack.Screen name="FriendList" component={FriendList} options={{headerShown: false}}/>
            <Stack.Screen name="Mypage" component={Mypage} options={{headerShown: false}}/>
            <Stack.Screen name="MypostList" component={MypostList} options={{headerShown: false}}/>
            <Stack.Screen name="TravelLog" component={TravelLog} options={{headerShown: false}}/>
            <Stack.Screen name="Userprofile" component={Userprofile} options={{headerShown: false}}/>
            <Stack.Screen name="PinBall" component={PinBall} options={{ headerShown: false }}/>
            <Stack.Screen
                name="Main"
                options={{ headerShown: false }}
            >
                {props => (
                    <Main
                        {...props}
                        weather={weatherData}
                        particulateMatter={particulateMatterData}
                        store={storeList}
                        location={locationList}
                    />
                )}
            </Stack.Screen>
            <Stack.Screen name="BaseballSchedule" component={BaseballSchedule} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreation1" component={ScheduleCreation1} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreation2" component={ScheduleCreation2} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreation3" component={ScheduleCreation3} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreation4" component={ScheduleCreation4} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreation5" component={ScheduleCreation5} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreation6" component={ScheduleCreation6} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreationAccommodation" component={ScheduleCreationAccommodation} options={{ headerShown: false }}/>
            <Stack.Screen name="CommunityList" component={CommunityList} options={{ headerShown: false }}/>
            <Stack.Screen name="CommunityInfo" component={CommunityInfo} options={{ headerShown: false }}/>
            <Stack.Screen name="WritingPost" component={WritingPost} options={{ headerShown: false }}/>
            <Stack.Screen name="Betting" component={Betting} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreation7" component={ScheduleCreation7} options={{ headerShown: false }}/>
            <Stack.Screen name="ScheduleCreation8" component={ScheduleCreation8} options={{ headerShown: false }}/>
            <Stack.Screen name="NoticeList" component={NoticeList} options={{ headerShown: false }}/>
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    gif: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // 또는 'contain'
    },
});