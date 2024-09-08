import React, {useState, useCallback, useEffect} from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Image, Modal, TextInput, Alert, ActivityIndicator, BackHandler } from "react-native";
import { MaterialCommunityIcons, AntDesign, FontAwesome, Entypo, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import axios from 'axios';
import { Share } from 'react-native';

export default function ScheduleCreation8({ route }) {
    const navigation = useNavigation();
    const [cmtList, setCmtList] = useState(null); // 로딩 상태 추가
    const userInfo = route.params.userInfo;

    const localhost = "54.180.146.203";

    const scheduleInfo = route.params.scheduleInfo; // 일정 생성 정보
    const plan_seq = route.params.plan_seq;
    console.log(plan_seq)

    const [notiState, setNotiState] = useState(false);


    useEffect(() => {
        const backAction = () => {
            // 뒤로 가기 버튼을 막습니다.
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);


    const getNotiState = async () => {
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/checkNoti`,{
                user_id: userInfo.user_id
            });
            if(response.data > 0){
                setNotiState(true);
            }else {
                setNotiState(false);
            }
        }catch (e) {
            console.error(e);
        }

    }

    useFocusEffect(
        useCallback(() => {
            if(userInfo){
                getNotiState();
            }else {
                setNotiState(false);
            }
            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [userInfo])
    );

    // 상단바 알림 아이콘
    const handleNoticeIconPress = async () => {
        if (userInfo) {
            try{
                const response = await axios.post(`http://${localhost}:8090/nuvida/setNoti`,{user_id:userInfo.user_id});
                navigation.navigate("NoticeList", {noticeList:response.data});
            }catch (e) {
                console.error(e)
            }

        } else {
            navigation.navigate("Signin");
        }
    }

    // 상단 바
    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={[{ width: '30%', height: '100%' }]}>
                </View>
                <View style={[styles.center, { width: '40%', height: '100%' }]}>
                    <Text style={styles.headerText}>NUVIDA</Text>
                </View>
                <View style={[styles.headerIconContainer, { width: '30%', height: '100%' }]}>
                    <TouchableOpacity style={styles.headerIcon} onPress={handleNoticeIconPress}>
                        {notiState?(
                            <MaterialCommunityIcons name="bell-plus" size={24} color="red" />
                        ):(
                            <MaterialCommunityIcons name="bell-plus" size={24} color="black" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const sendMsg = async () => {
        // scheduleInfo에서 필요한 데이터 추출
        const { dateRange, plan_name, selectedPlaces } = scheduleInfo;

        // 날짜 범위를 포맷
        const formattedDateRange = `${dateRange[0].split('T')[0]} ~ ${dateRange[1].split('T')[0]}`;

        // 방문할 장소 목록 작성
        const placeNames = selectedPlaces.map(place => place.name).join('\n');

        // 장소 개수 계산
        const placeCount = selectedPlaces.length;

        // 메시지 구성
        const msg = `${formattedDateRange}\n` +
            `${plan_name} 일정\n` +
            `====================\n` +
            `${placeNames}\n` +
            `================\n` +
            `총 ${placeCount}장소 방문 예정`;

        try {
            const result = await Share.share({
                message: msg,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type: ', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing message: ', error);
        } finally {

        }
    }

    // 일정 정보 표시
    const renderScheduleInfo = () => {
        return (
            <View style={styles.infoContainer}>
                <View style={styles.textContainer}>
                <Text style={styles.text}>일정이 생성되었습니다.</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{scheduleInfo.plan_name}</Text>
                    <Text style={styles.cardText}>기간: {scheduleInfo.dateRange[0].split('T')[0]} - {scheduleInfo.dateRange[1].split('T')[0]}</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("TripSchedule", { userInfo, plan_seq })}>
                        <Text style={styles.actionButtonText}>교통편 등록하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={()=>sendMsg()}>
                        <Text style={styles.actionButtonText}>일정 공유하기</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.mainButton} onPress={()=>navigation.navigate("Main")}>
                    <Text style={styles.actionButtonText}>메인으로 이동하기</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // 하단바 일정관리 아이콘
    const handlePlanCalendarIconPress = () => {
        if (userInfo) {
            navigation.navigate("TripCalendar",{userInfo:userInfo});
        } else {
            navigation.navigate("Signin");
        }
    };

    const goChat = () =>{
        if(userInfo){
            navigation.navigate('ChatRoomList', {userInfo:userInfo})
        }else{
            navigation.navigate("Signin");
        }
    }

    // 하단 바
    const renderTabBar = () => {
        return (
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
                    <Entypo name="home" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={handlePlanCalendarIconPress}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={goChat}>
                    <MaterialCommunityIcons name="chat" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('CommunityList', {userInfo:userInfo})}>
                    <Ionicons name="chatbubbles-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => goMypage()}>
                    <Feather name="user" size={24} color="black" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            <ScrollView style={styles.contentContainer}>
                {renderScheduleInfo()}
            </ScrollView>

            {renderTabBar()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    infoContainer: {
        marginBottom: 20,
    },
    card: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    placeCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
    },
    placeImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    placeInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    placeAddr: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    placeTime: {
        fontSize: 12,
        color: '#999',
    },
    mainButton:{
        flex: 1,
        padding: 10,
        backgroundColor: '#f35353',
        borderRadius: 10,
        alignItems: 'center',
        marginTop:10,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f35353',
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    /* 상단바 */
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: '10%',
        paddingBottom: '2%',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red'
    },
    headerIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    headerIcon: {
        width: 26,
        height: 26,
        marginRight: '12%',
    },
    /* 하단바 */
    tabBar: {
        height: 70,
        flexDirection: 'row',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer:{
        paddingVertical:20,
    },
    text:{
        fontSize:20,
        fontWeight:"bold",
        color:"#9e9d9d"
    }
});
