import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
    Modal,
    SafeAreaView, ActivityIndicator, Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import moment from 'moment';
import axios from 'axios';
import {useFocusEffect, useNavigation} from "@react-navigation/native";

const { width } = Dimensions.get('window');

const generateCalendar = (year, month) => {
    // const firstDay = moment(`${year}-${month}-01`).startOf('month').day();
    // const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

    const formattedMonth = month.toString().padStart(2, '0');
    const firstDay = moment(`${year}-${formattedMonth}-01`).startOf('month').day();
    const daysInMonth = moment(`${year}-${formattedMonth}`, "YYYY-MM").daysInMonth();

    const calendar = [];
    let week = [];

    // Add blank days for the first week
    for (let i = 0; i < firstDay; i++) {
        week.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        week.push(day);
        if (week.length === 7) {
            calendar.push(week);
            week = [];
        }
    }

    // Add remaining days of the last week
    if (week.length > 0) {
        while (week.length < 7) {
            week.push(null);
        }
        calendar.push(week);
    }

    return calendar;
};

const TripCalendar = ({ route }) => {
    const navigation = useNavigation();

    const [currentDate, setCurrentDate] = useState(moment());
    const [markedDates, setMarkedDates] = useState({});
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [planList, setPlanList] = useState(null);
    const [weatherData, setWeatherData] = useState({});
    const [midWeatherData, setMidWeatherData] = useState({})
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    const [notiState, setNotiState] = useState(false);

    const localhost = "54.180.146.203";

    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    // API KEY
    const API_KEY = "q9%2BtR1kSmDAYUNoOjKOB3vkl1rLYVTSEVfg4sMDG2UYDAL4KiJo5GaFq9nfn%2FdUnUFjK%2FrOY3UfgJvHtOBAEmQ%3D%3D";

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
        }, [userInfo]) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
    );

    useFocusEffect(
        useCallback(() => {
            const getPlanList = async () => {
                try {
                    const response = await axios.post(`http://${localhost}:8090/nuvida/getPlanList`, {user_id:userInfo.user_id});
                    setPlanList(response.data);
                    markPlanDates(response.data); // 일정 데이터를 마킹
                } catch (error) {
                    console.error('Error fetching plan data:', error);
                }
            };

            getPlanList();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, []) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
    );

    useFocusEffect(
        useCallback(() => {
            const fetchWeatherData = async () => {

                try {
                    const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=35.1682414234&lon=126.8890596255&appid=d2a5f95e3472b4ebac1cd08e6268c4f6&lang=kr&units=metric`);
                    const midData = response.data;


                    processMidWeatherData(midData);
                } catch (error) {
                    console.error('Error fetching weather data:', error);
                }finally {
                    setLoading(false); // 데이터 로드 완료 후 로딩 상태 false로 변경
                }

            };

            fetchWeatherData();
            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [userInfo]) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
    );




    // 날씨 아이콘 중기
    const processMidWeatherData = (data) =>{
        const currentDate = moment();

        const targetDates = [
            currentDate.format('YYYY-MM-DD'), // 오늘
            currentDate.clone().add(1, 'day').format('YYYY-MM-DD'), // 내일
            currentDate.clone().add(2, 'day').format('YYYY-MM-DD'), // 모레
            currentDate.clone().add(3, 'day').format('YYYY-MM-DD'),
            currentDate.clone().add(4, 'day').format('YYYY-MM-DD'),
        ];

        const weatherIcon = data.list;


        const targetWeather = {
            [targetDates[0]]: weatherIcon[0].weather[0].icon,
            [targetDates[1]]: weatherIcon[0].weather[0].icon,
            [targetDates[2]]: weatherIcon[0].weather[0].icon,
            [targetDates[3]]: weatherIcon[0].weather[0].icon,
            [targetDates[4]]: weatherIcon[0].weather[0].icon,
        };
        console.log(targetWeather)
        setMidWeatherData(targetWeather)
    }






    useEffect(() => {
        const today = moment().format('YYYY-MM-DD');
        setMarkedDates((prev) => ({
            ...prev,
            [today]: { selected: true, color: 'red' }
        }));
    }, []);

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

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={[{ width: '30%', height: '100%' }]} />
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

    const renderCalendarHeader = () => {
        return (
            <View style={[styles.calendarHeader, {marginTop: '2%'}]}>

                <View style={{width: '72%', height: '100%', marginLeft: '2%'}}>
                    <Text style={styles.calendarHeaderText}>
                        {currentDate.format('YYYY. MM')}
                    </Text>
                </View>
                <View style={{width: '26%', height: '100%', flexDirection: 'row'}}>
                    <View style={{width: '45%', height: '100%', alignItems: 'center'}}>
                        <TouchableOpacity onPress={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}>
                            <Entypo name="chevron-with-circle-left" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '10%', height: '100%'}}></View>
                    <View style={{width: '45%', height: '100%', alignItems: 'center', }}>
                        <TouchableOpacity onPress={() => setCurrentDate(currentDate.clone().add(1, 'month'))}>
                            <Entypo name="chevron-with-circle-right" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const markPlanDates = (plans) => {
        const newMarkedDates = {};
        plans.forEach(plan => {
            let start = moment(plan.start_date);
            let end = moment(plan.end_date);

            while (start <= end) {
                const formattedDate = start.format('YYYY-MM-DD');
                if (!newMarkedDates[formattedDate]) {
                    newMarkedDates[formattedDate] = { marked: true, plans: [] };
                }
                newMarkedDates[formattedDate].plans.push({
                    name: plan.plan_name,
                    seq: plan.plan_seq,
                });
                start.add(1, 'day');
            }
        });
        setMarkedDates(newMarkedDates);
    };


    const renderCalendar = () => {
        const year = currentDate.year();
        const month = currentDate.month() + 1;
        const calendar = generateCalendar(year, month);
        const today = moment().format('YYYY-MM-DD'); // 오늘 날짜

        return (
            <View style={[styles.calendar,]}>
                <View style={{width: '100%', height: '5%', flexDirection: 'row'}}>
                    <View style={[styles.center, {width: '30%', height: '100%', marginLeft: '70%'}]}>
                        <TouchableOpacity style={[{borderColor: '#A5A5A5', borderWidth: 1, borderRadius: 10, width: '70%', height: '82%'}, styles.center]} onPress={() => navigation.navigate("ScheduleCreation1", {userInfo:userInfo})}>
                            <Text style={{}}>일정 추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{width : '100%', height: '95%'}}>
                    <View style={[styles.weekdays, {flexDirection: 'row', justifyContent: 'space-around'}]}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <Text key={day} style={{fontSize: 11, textAlign: 'center', width: '14.28%'}}>{day}</Text>
                        ))}
                    </View>
                    {calendar.map((week, index) => (
                        <View key={index} style={[styles.week, {flexDirection: 'row', justifyContent: 'space-around'}]}>
                            {week.map((day, idx) => {
                                if (day === null) {
                                    return <View key={idx} style={[styles.emptyDay, {width: '14.28%'}]} />;
                                }
                                const dateString = moment(`${year}-${month}-${day}`).format('YYYY-MM-DD');
                                const isMarked = markedDates[dateString]?.marked;
                                const isToday = dateString === today;
                                const plans = markedDates[dateString]?.plans || [];
                                const midWeatherInfo = midWeatherData[dateString];

                                let isStart = false;
                                let isEnd = false;

                                plans.forEach(plan => {
                                    const planStart = moment(plan.start_date).format('YYYY-MM-DD');
                                    const planEnd = moment(plan.end_date).format('YYYY-MM-DD');
                                    if (dateString === planStart) isStart = true;
                                    if (dateString === planEnd) isEnd = true;
                                });

                                return (
                                    <View
                                        key={idx}
                                        style={[
                                            styles.dayContainer,
                                            {width: '14.28%'},
                                            isStart && styles.planStart,
                                            isEnd && styles.planEnd,
                                            isStart && isEnd && styles.planSingleDay
                                        ]}
                                    >
                                        {day ? (
                                            <>
                                                <View style={styles.day}>
                                                    <View style={styles.dateAndIcon}>
                                                        {isToday ? (
                                                            <Text style={[styles.todayText]}>
                                                                {day}
                                                            </Text>
                                                        ) : (
                                                            <Text style={[styles.dayText, isMarked && { color: 'black' }]}>
                                                                {day}
                                                            </Text>
                                                        )}
                                                        {midWeatherInfo && (
                                                            <Image style={styles.weatherIcon} source={{uri:`http://openweathermap.org/img/wn/${midWeatherInfo}@2x.png`}}/>
                                                        )}
                                                    </View>
                                                </View>
                                                <View style={styles.plansContainer}>
                                                    {plans.map((plan, i) => (
                                                        <TouchableOpacity key={i} style={styles.planMarker} onPress={() => navigation.navigate("TripSchedule", { userInfo: userInfo, plan_seq: plan.seq })}>
                                                            <Text style={styles.planMarkerText}>{plan.name}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </>
                                        ) : (
                                            <View style={styles.emptyDay} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ))}
                </View>

            </View>
        );
    };


    const renderDatePicker = () => {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const days = Array.from({ length: 31 }, (_, i) => i + 1);

        return (
            <View style={styles.datePicker}>
                <Picker
                    selectedValue={selectedDate ? moment(selectedDate).month() + 1 : new Date().getMonth() + 1}
                    onValueChange={(itemValue) => {
                        const newDate = selectedDate ? moment(selectedDate).set('month', itemValue - 1) : moment().set('month', itemValue - 1);
                        setSelectedDate(newDate.format('YYYY-MM-DD'));
                    }}
                    style={styles.picker}
                >
                    {months.map(month => (
                        <Picker.Item key={month} label={`${month}월`} value={month} />
                    ))}
                </Picker>
                <Picker
                    selectedValue={selectedDate ? moment(selectedDate).date() : new Date().getDate()}
                    onValueChange={(itemValue) => {
                        const newDate = selectedDate ? moment(selectedDate).set('date', itemValue) : moment().set('date', itemValue);
                        setSelectedDate(newDate.format('YYYY-MM-DD'));
                    }}
                    style={styles.picker}
                >
                    {days.map(day => (
                        <Picker.Item key={day} label={`${day}일`} value={day} />
                    ))}
                </Picker>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    // 하단바 일정관리 아이콘
    const handlePlanCalendarIconPress = () => {
        if (userInfo) {
            navigation.navigate("TripCalendar",{userInfo:userInfo});
        } else {
            navigation.navigate("Signin");
        }
    };

    const goMypage = () =>{
        if(userInfo){
            navigation.navigate('Mypage', {userInfo:userInfo})
        }else{
            navigation.navigate('Signin')
        }
    }

    const goChat = () =>{
        if(userInfo){
            navigation.navigate('ChatRoomList', {userInfo:userInfo})
        }else{
            navigation.navigate("Signin");
        }
    }

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderCalendarHeader()}
            {/*<ScrollView contentContainerStyle={styles.scrollContainer}>*/}
            {renderCalendar()}
            {/*</ScrollView>*/}
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
        </View>
    );
};

const styles = StyleSheet.create({

    dayContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start', // 날짜 부분을 위쪽에 배치
        width: (width - 20) / 7,
        height: 80, // 날짜와 일정이 모두 들어갈 수 있는 충분한 높이로 설정
    },
    plansContainer: {
        marginTop: '5%', // 날짜와 일정 사이의 간격
        alignItems: 'center',
        justifyContent: 'center', // 일정 텍스트를 가운데 정렬
        width: '100%', // 일정 표시 영역을 전체 너비로 확장
        height: '40%', // 일정 표시 영역의 고정 높이 설정
    },
    planMarker: {
        backgroundColor: 'lightblue',
        borderRadius: 4,
        paddingHorizontal: 2,
        width: '90%', // 일정 텍스트의 너비를 고정
        textAlign: 'center', // 텍스트 중앙 정렬
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2, // 일정 사이의 간격 설정 (필요에 따라 조정 가능)
    },
    planMarkerText: {
        fontSize: 10,
        color: 'black',
        textAlign: 'center', // 텍스트를 중앙에 위치
    },


    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'white',
    },
    calendarHeaderText: {
        fontSize: 18,
        fontWeight: 'medium',
    },
    scrollContainer: {
        paddingBottom: 100,
    },
    calendar: {
        width: width - 20,
        alignSelf: 'center',
        marginBottom: 20,
    },
    weekdays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
    },
    weekdayText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        width: (width - 20) / 7,
    },
    week: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height:100
    },

    day: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    dayText: {
        fontSize: 15,
        color: '#000',
    },
    todayText: {
        fontSize: 15,
        color: '#ff0000',
        borderColor:"#ff0000",
        borderWidth: 1,
        borderRadius: 20, // 고정된 값으로 원형 보더를 만드는 경우
        textAlign: 'center', // 텍스트를 중앙에 위치
        width: 30, // 동그라미의 너비와 높이를 동일하게 설정
        height: 30, // 동그라미의 너비와 높이를 동일하게 설정
    },
    emptyDay: {
        width: 40,
        height: 40,
    },
    markBar: {
        marginTop: 2,
        width: '60%',
        height: 4,
        backgroundColor: 'blue',
        borderRadius: 2,
    },
    addButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20,
        borderWidth:1
    },
    addButtonText: {
        color: 'black',
        fontSize: 16,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        // paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 60,

    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 15,
    },
    datePicker: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    picker: {
        width: 100,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        width: 100,
    },
    buttonClose: {
        backgroundColor: '#f35353',
    },
    buttonAdd: {
        backgroundColor: '#000000',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateAndIcon: {
        flexDirection: 'row', // 날짜와 아이콘을 가로로 배치
        alignItems: 'center', // 아이콘과 텍스트의 수직 정렬을 맞춤
    },
    weatherIcon: {
        marginLeft: 4, // 날짜와 아이콘 사이의 간격을 추가,
        width:30,
        height:30,
    },

});

export default TripCalendar;