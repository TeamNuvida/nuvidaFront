import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { AntDesign, FontAwesome, Entypo, Ionicons, Feather } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";

export default function BaseballSchedule() {
    const [markedDates, setMarkedDates] = useState({});
    const { height, width } = Dimensions.get('window');
    const navigation = useNavigation();
    const [matches, setMatches] = useState([]);

    // localhost 주소값
    const localhost = "192.168.55.35";

    const logo = [
        require("../assets/KIA.png"),
        require("../assets/doodan_bears.png"),
        require("../assets/hanwha.png"),
        require("../assets/kiwoom_heroes.png"),
        require("../assets/kt_wiz.png"),
        require("../assets/lgtwins.png") ,
        require("../assets/lotte_giants.png") ,
        require("../assets/nc_dinos.png"),
        require("../assets/samsung_lions.png") ,
        require("../assets/ssg_landers.png"),
    ];

    useEffect(() => {
        const matches = async () => {
            console.log("호출호출")
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/matcheList`);
                setMatches(response.data);
            } catch (error) {
                console.error('Error fetching plan data:', error);
            }
        };

        matches();
    }, []);

    useEffect(() => {
        const dates = matches.reduce((acc, match) => {
            const date = match.match_date.split(' ')[0];
            acc[date] = { marked: true, dotColor: 'red' };
            return acc;
        }, {});
        setMarkedDates(dates);
    }, []);

    const getMatchForDate = (date) => {
        return matches.find(m => m.match_date.split(' ')[0] === date);
    };

    const getMatchStatusText = (match) => {
        const { state, score, op_score, match_date } = match;
        const time = match_date.split(' ')[1].substring(0, 5);

        switch (state) {
            case '0':
                return { text: time, color: 'black' };
            case '1':
                return { text: `승 ${score} : ${op_score}`, color: 'blue' };
            case '2':
                return { text: `패 ${score} : ${op_score}`, color: 'red' };
            case '3':
                return { text: `${score} : ${op_score}`, color: 'black' };
            case '4':
                return { text: '우천취소', color: 'gray' };
            default:
                return { text: '', color: 'black' };
        }
    };

    const handlePlanCalendarIconPress = () => {
        if (isLoggedIn) {
            navigation.navigate("planCalendarPage");
        } else {
            navigation.navigate("loginPage");
        }
    };

    const renderHeader = () => {
        return (
            <View style={[styles.headerContainer, {zIndex: 6}]}>
                <View style={[{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: '3%', }]}>
                    <Image source={require('../assets/logo.png')} style={{ width: 20, height: 20, marginRight: '1%' }} />
                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>경기일정・결과</Text>
                </View>
            </View>
        );
    };

    const renderCalendar = () => {
        return (
            <View style={[styles.calendarContainer, {marginTop: '-8%', zIndex: 5}]}>
                <Calendar
                    current={new Date().toISOString().split('T')[0]}
                    onDayPress={(day) => {
                        console.log('selected day', day);
                    }}
                    theme={{
                        'stylesheet.calendar.header': {
                            monthText: {
                                textAlign: 'left',
                                fontSize: 17,
                                color: 'black',
                                fontWeight: 'bold',
                            },
                            week: {
                                marginTop: height * 0.02,
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                borderBottomWidth: 1,
                                borderBottomColor: 'black', // 요일 아래 검은색 선
                                paddingBottom: 5,
                                marginBottom: 10,
                            },
                            dayTextAtIndex0: {
                                color: 'red',
                                fontSize: width * 0.03,
                            },
                            dayTextAtIndex1: {
                                color: 'black',
                                fontSize: width * 0.03,
                            },
                            dayTextAtIndex2: {
                                color: 'black',
                                fontSize: width * 0.03,
                            },
                            dayTextAtIndex3: {
                                color: 'black',
                                fontSize: width * 0.03,
                            },
                            dayTextAtIndex4: {
                                color: 'black',
                                fontSize: width * 0.03,
                            },
                            dayTextAtIndex5: {
                                color: 'black',
                                fontSize: width * 0.03,
                            },
                            dayTextAtIndex6: {
                                color: 'black',
                                fontSize: width * 0.03,
                            },
                        },
                        'stylesheet.day.basic': {
                            base: {
                                height: height * 0.12,
                            },
                            text: {
                                fontSize: 14,
                            },
                        },
                        'stylesheet.calendar.main': {
                            container: {
                                paddingBottom: 10,
                            },
                        },
                    }}
                    renderArrow={(direction) => (
                        <View style={styles.arrowContainer}>
                            {direction === 'left' ? (
                                <Entypo name="chevron-with-circle-left" size={21} color="gray" />
                            ) : (
                                <Entypo name="chevron-with-circle-right" size={21} color="gray" />
                            )}
                        </View>
                    )}
                    markedDates={markedDates}
                    dayComponent={({ date, state }) => {
                        const match = getMatchForDate(date.dateString);

                        if (!match) {
                            return (
                                <View style={{ height: height * 0.09, alignItems: 'center' }}>
                                    <Text style={{ color: state === 'disabled' ? '#E6E6E6' : 'black' }}>{date.day}</Text>
                                </View>
                            );
                        }

                        const { text, color } = getMatchStatusText(match);

                        return (
                            <View style={{ height: height * 0.09, alignItems: 'center' }}>
                                <Text style={{ color: state === 'disabled' ? '#E6E6E6' : 'black' }}>{date.day}</Text>
                                <Image source={logo[Number(match.logo_img)]} style={{ width: 38, height: 28, marginTop: 5 }} />
                                <Text style={{ color, fontSize: 12, marginTop: 5 }}>{text}</Text>
                            </View>
                        );
                    }}
                />
            </View>
        );
    };

    const renderTabBar = () => {
        return (
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
                    <Entypo name="home" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={handlePlanCalendarIconPress}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('game')}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('community')}>
                    <Ionicons name="chatbubbles-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('mypage')}>
                    <Feather name="user" size={24} color="black" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderCalendar()}
            {renderTabBar()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    calendarContainer: {
        flex: 1,
        padding: 10,
        marginTop: '5%',
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
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        paddingTop: '10%',
        paddingBottom: '2%',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red',
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
        bottom: 10,
    },
    arrowContainer: {
        padding: 10,
    },
});
