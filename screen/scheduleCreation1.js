import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, AntDesign, FontAwesome, Entypo, Ionicons, Feather} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ScheduleCreation1({route}) {
    const navigation = useNavigation();

    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
    const [userInfo, setUserInfo] = useState(route.params.userInfo);  // 로그인 정보
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    // localhost 주소값
    const localhost = "192.168.219.101";

    // 유저 정보 (테스트용)
    useEffect(() => {
        const user = async () => {
            try {
                setUserInfo(route.params.userInfo);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false); // 데이터 로드 완료 후 로딩 상태 false로 변경
            }
        };
        user();
    }, []);

    // 로딩 중일 때 표시할 컴포넌트
    if (loading) {
        console.log("로딩 중")
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    // 루트 정보 추가
    const handleScheduleInfoPress = (routeNumber) => {
        const scheduleInfo = { route: routeNumber };
        navigation.navigate('ScheduleCreation2', { scheduleInfo, userInfo });
    }


    // 하단바 일정 아이콘
    const handlePlanCalendarIconPress = () => {
        if (isLoggedIn) {
            navigation.navigate("TripCalendar",{userInfo:userInfo});
        } else {
            navigation.navigate("Signin");
        }
    };

    // 상단 바
    const renderHeader = () => {
        return (
            <View style={[styles.center_row, styles.headerContainer]}>

                <View style={[styles.center, {width: '40%', height: '100%'}]}>
                    <Text style={styles.headerText}>NUVIDA</Text>
                </View>
            </View>
        );
    };

    // 여행 루트 생성 방법
    const renderTravelRoute = () => {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={[styles.center, styles.fullSize]} onPress={() => handleScheduleInfoPress("1")} >
                    <Image source={require('../assets/routeTicket.png')} style={styles.ticketImage}/>
                    <View style={styles.content}>
                        <View style={styles.rowContainer}>
                            <View style={[styles.center_row, {width: '60%', height: '100%'}]}>
                                <Ionicons name="airplane" size={24} color="white"/>
                                <Text style={[styles.boldText,{marginHorizontal: '3%'}]}>NUVIDA AIR</Text>
                            </View>
                            <View style={[styles.center, {width: '40%', height: '100%',}]}>
                                <Text style={styles.boldText}>{userInfo.user_nick}</Text>
                            </View>
                        </View>
                        <View style={[styles.center, styles.contentSize]}>
                            <View style={[{width: '85%', height: '25%', justifyContent: 'center'}]}>
                                <Text style={{fontWeight: 'bold', fontSize: 23,}}>루트 생성</Text>
                            </View>
                            <View style={[{width: '85%', height: '50%', marginTop: '2%'}]}>
                                <Text style={styles.contentText}>방문할 장소를 등록하면{"\n"}
                                    AI가 자동으로 일정별 이동 루트 생성</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.center, styles.fullSize]} onPress={() => handleScheduleInfoPress("2")} >
                    <Image source={require('../assets/customTicket.png')} style={styles.ticketImage} />
                    <View style={styles.content}>
                        <View style={styles.rowContainer}>
                            <View style={[styles.center_row, {width: '60%', height: '100%'}]}>
                                <Ionicons name="airplane" size={24} color="white"/>
                                <Text style={[styles.boldText,{marginHorizontal: '3%'}]}>NUVIDA AIR</Text>
                            </View>
                            <View style={[styles.center, {width: '40%', height: '100%',}]}>
                                <Text style={styles.boldText}>{userInfo.user_nick}</Text>
                            </View>
                        </View>
                        <View style={[styles.center, styles.contentSize]}>
                            <View style={[{width: '85%', height: '25%',justifyContent: 'center'}]}>
                                <Text style={{fontWeight: 'bold', fontSize: 23,}}>커스텀 생성</Text>
                            </View>
                            <View style={[{width: '85%', height: '50%', marginTop: '2%'}]}>
                                <Text style={styles.contentText}>본인이 직접 방문할 장소를 등록하고{"\n"}
                                    일정별 이동 루트 생성</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    // 하단 바
    const renderTabBar = () => (
        <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
                <Entypo name="home" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={handlePlanCalendarIconPress}>
                <FontAwesome name="calendar-check-o" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('PinBall')}>
                <FontAwesome name="calendar-check-o" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('CommunityList', {userInfo:userInfo})}>
                <Ionicons name="chatbubbles-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Mypage',{userInfo:userInfo})}>
                <Feather name="user" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderTravelRoute()}
            {renderTabBar()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    center_row: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    /* */
    fullSize: {
        width: '100%',
        height: '40%',
    },
    ticketImage: {
        width: '86%',
        height: '80%'
    },
    content: {
        position: 'absolute',
        width: '86%',
        height: '80%',
    },
    rowContainer: {
        width: '76%',
        height: '19%',
        flexDirection: 'row'
    },
    boldText: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#fff',
    },
    contentSize: {
        width: '76%',
        height: '81%'
    },
    contentText: {
        fontSize: 13,
        color: '#969696'
    },

    /* 상단바 */
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        paddingTop: '10%',
        paddingBottom: '2%',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
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

    /* 하단 바 */
    tabBar: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    tabItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})
