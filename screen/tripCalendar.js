import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
    Modal,
    SafeAreaView, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import moment from 'moment';
import axios from 'axios';
import {useNavigation} from "@react-navigation/native";

const { width } = Dimensions.get('window');

const generateCalendar = (year, month) => {
    const firstDay = moment(`${year}-${month}-01`).startOf('month').day();
    const daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();

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

    const localhost = "192.168.55.35";

    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    // API KEY
    const API_KEY = "q9%2BtR1kSmDAYUNoOjKOB3vkl1rLYVTSEVfg4sMDG2UYDAL4KiJo5GaFq9nfn%2FdUnUFjK%2FrOY3UfgJvHtOBAEmQ%3D%3D";




    useEffect(() => {
        const getPlanList = async () => {
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/getPlanList`, {user_id:userInfo.user_id});
                setPlanList(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching plan data:', error);
            }
        };

        getPlanList();
    }, []);

    useEffect(() => {
        const fetchWeatherData = async () => {
            const date = new Date();
            const base_date = formatWeatherDate(date);
            const base_time = formatWeatherTime(date);
            try {
                const response = await axios.get(`http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${API_KEY}&numOfRows=60&pageNo=1&base_date=${base_date}&base_time=${base_time}&nx=59&ny=74&dataType=JSON`);
                const data = response.data.response.body.items.item;
                processWeatherData(data);
                const responseMid = await axios.get(`http://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&regId=11F20000&tmFc=${base_date}0600&dataType=JSON`);
                const midData = responseMid.data.response.body.items.item[0];
                processMidWeatherData(midData);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }finally {
                setLoading(false); // 데이터 로드 완료 후 로딩 상태 false로 변경
            }
        };

        fetchWeatherData();
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

    const getCurrentTimeSlot = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1); // 현재 시간에서 1시간 추가
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = '00'; // 시간대의 시작 시간을 "00"으로 설정
        return `${hours}${minutes}`;
    };

    const filterWeatherData = (data, currentDate) => {
        const currentTimeSlot = getCurrentTimeSlot(); // 현재 시간대 가져오기
        const targetTimes = [currentTimeSlot]; // 동적으로 생성된 시간대
        const targetDates = [
            currentDate.format('YYYYMMDD'), // 오늘
            currentDate.clone().add(1, 'day').format('YYYYMMDD'), // 내일
            currentDate.clone().add(2, 'day').format('YYYYMMDD') // 모레
        ];

        // 데이터 필터링
        const filteredData = data.filter(item =>
            targetDates.includes(item.fcstDate) && targetTimes.includes(item.fcstTime)
        );

        // 날짜별로 데이터를 그룹화하여 카테고리별 값으로 정리
        const groupedData = targetDates.map(date => {
            const itemsForDate = filteredData.filter(item => item.fcstDate === date);

            // 시간대별로 데이터를 묶음
            return targetTimes.map(fcstTime => {
                const filteredItems = itemsForDate.filter(item => item.fcstTime === fcstTime)
                    .reduce((acc, item) => {
                        acc[item.category] = item.fcstValue;
                        return acc;
                    }, {});

                return { date, fcstTime, ...filteredItems };
            });
        }).flat();

        return groupedData.filter(group => group !== null);
    };

    // 날씨 아이콘 중기
    const processMidWeatherData = (data) =>{
        const currentDate = moment();

        const targetDates = [
            currentDate.clone().add(3, 'day').format('YYYY-MM-DD'),
            currentDate.clone().add(4, 'day').format('YYYY-MM-DD'),
            currentDate.clone().add(5, 'day').format('YYYY-MM-DD'),
            currentDate.clone().add(6, 'day').format('YYYY-MM-DD'),
            currentDate.clone().add(7, 'day').format('YYYY-MM-DD'),
            currentDate.clone().add(8, 'day').format('YYYY-MM-DD'),
            currentDate.clone().add(9, 'day').format('YYYY-MM-DD'),
            currentDate.clone().add(10, 'day').format('YYYY-MM-DD'),
        ];

        const targetWeather = {
            [targetDates[0]]: getIcon(data.wf3Am),
            [targetDates[1]]: getIcon(data.wf4Am),
            [targetDates[2]]: getIcon(data.wf5Am),
            [targetDates[3]]: getIcon(data.wf6Am),
            [targetDates[4]]: getIcon(data.wf7Am),
            [targetDates[5]]: getIcon(data.wf8),
            [targetDates[6]]: getIcon(data.wf9),
            [targetDates[7]]: getIcon(data.wf10),
        };
        console.log(targetWeather)
        setMidWeatherData(targetWeather)
    }

    const getIcon = (data) =>{
        let weatherName = '';
        let iconName = '';
        let IconComponent = null;

        switch (data){
            case '맑음':
                weatherName = '맑음';
                iconName = 'sun';
                IconComponent = Feather;
                break;
            case '구름많음':
                weatherName = '구름많음';
                iconName = 'day-cloudy';
                IconComponent = Fontisto;
                break;
            case '흐림':
                weatherName = '흐림';
                iconName = 'cloudy';
                IconComponent = Fontisto;
                break;
            case '비/눈':
            case '구름많고 비/눈':
            case '흐리고 비/눈':
                weatherName = '비 / 눈';
                iconName = 'weather-snowy-rainy';
                IconComponent = MaterialCommunityIcons;
                break;
            case '비':
            case  '구름많고 비':
            case '구름많고 소나기':
            case '흐리고 비':
            case '흐리고 소나기':
                weatherName = '비';
                iconName = 'weather-pouring';
                IconComponent = MaterialCommunityIcons;
                break;
            case '눈':
            case '구름많고 눈':
            case '흐리고 눈':
                weatherName = '눈';
                iconName = 'weather-snowy';
                IconComponent = MaterialCommunityIcons;
                break;
            default :
                weatherName = '흐림';
                iconName = 'cloudy';
                IconComponent = Fontisto;
                break;
        }

        return { weatherName:weatherName, iconName:iconName, IconComponent: IconComponent}
    }

    // 날씨 아이콘 단기
    const processWeatherData = (data) => {
        const weatherMap = {};
        const currentDate = moment();
        const filteredData = filterWeatherData(data, currentDate);

        filteredData.forEach(dayWeather => {
            const date = moment(dayWeather.date).format('YYYY-MM-DD');
            const sky = dayWeather.sky;
            const pty = dayWeather.pty;

            let weatherName = '';
            let iconName = '';
            let IconComponent = null;

            switch (true) {
                case pty === 1:
                    weatherName = '비';
                    iconName = 'weather-pouring';
                    IconComponent = MaterialCommunityIcons;
                    break;
                case pty === 2 || pty === 6:
                    weatherName = '비 / 눈';
                    iconName = 'weather-snowy-rainy';
                    IconComponent = MaterialCommunityIcons;
                    break;
                case pty === 3:
                    weatherName = '눈';
                    iconName = 'weather-snowy';
                    IconComponent = MaterialCommunityIcons;
                    break;
                case pty === 5:
                    weatherName = '빗방울';
                    iconName = 'weather-rainy';
                    IconComponent = MaterialCommunityIcons;
                    break;
                case pty === 7:
                    weatherName = '눈날림';
                    iconName = 'weather-snowy-heavy';
                    IconComponent = MaterialCommunityIcons;
                    break;
                case sky === 1:
                    weatherName = '맑음';
                    iconName = 'sun';
                    IconComponent = Feather;
                    break;
                case sky === 3:
                    weatherName = '구름많음';
                    iconName = 'day-cloudy';
                    IconComponent = Fontisto;
                    break;
                default:
                    weatherName = '흐림';
                    iconName = 'cloudy';
                    IconComponent = Fontisto;
                    break;
            }

            weatherMap[date] = { weatherName, iconName, IconComponent };
        });
        setWeatherData(weatherMap);
    };


    useEffect(() => {
        const today = moment().format('YYYY-MM-DD');
        setMarkedDates({
            [today]: { selected: true, color: 'red' }
        });
    }, []);

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={[{ width: '30%', height: '100%' }]} />
                <View style={[styles.center, { width: '40%', height: '100%' }]}>
                    <Text style={styles.headerText}>NUVIDA</Text>
                </View>
                <View style={[styles.headerIconContainer, { width: '30%', height: '100%' }]}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('BaseballSchedule')}>
                        <AntDesign name="calendar" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => alert('알림')}>
                        <MaterialCommunityIcons name="bell-plus" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderCalendarHeader = () => {
        return (
            <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}>
                    <AntDesign name="left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.calendarHeaderText}>
                    {currentDate.format('YYYY년 M월')}
                </Text>
                <TouchableOpacity onPress={() => setCurrentDate(currentDate.clone().add(1, 'month'))}>
                    <AntDesign name="right" size={24} color="black" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderCalendar = () => {
        const year = currentDate.year();
        const month = currentDate.month() + 1;
        const calendar = generateCalendar(year, month);
        return (
            <View style={styles.calendar}>
                <View style={styles.weekdays}>
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <Text key={day} style={styles.weekdayText}>{day}</Text>
                    ))}
                </View>
                {calendar.map((week, index) => (
                    <View key={index} style={styles.week}>
                        {week.map((day, idx) => {
                            const dateString = moment(`${year}-${month}-${day}`).format('YYYY-MM-DD');
                            const isMarked = markedDates[dateString]?.selected;

                            // WeatherData에서 해당 날짜의 날씨 정보를 가져옴
                            const weatherInfo = weatherData[dateString];
                            const midWeatherInfo = midWeatherData[dateString];
                            return (
                                <View key={idx} style={styles.dayContainer}>
                                    {day ? (
                                        <TouchableOpacity
                                            style={[
                                                styles.day,
                                                isMarked && {
                                                    backgroundColor: markedDates[dateString].color
                                                }
                                            ]}
                                            onPress={() => setSelectedDate(dateString)}
                                        >
                                            <Text
                                                style={[
                                                    styles.dayText,
                                                    isMarked && { color: 'white' }
                                                ]}
                                            >
                                                {day}
                                            </Text>
                                            {weatherInfo && (
                                                <weatherInfo.IconComponent
                                                    name={weatherInfo.iconName}
                                                    size={20}
                                                    color="black"
                                                />
                                            )}
                                            {midWeatherInfo && (
                                                <midWeatherInfo.IconComponent
                                                    name={midWeatherInfo.iconName}
                                                    size={20}
                                                    color="black"
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.emptyDay} />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
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

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderCalendarHeader()}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {renderCalendar()}
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("ScheduleCreation1", {userInfo:userInfo})}>
                    <Text style={styles.addButtonText}>일정 추가</Text>
                </TouchableOpacity>
            </ScrollView>
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
                <TouchableOpacity style={styles.tabItem} onPress={() => goMypage()}>
                    <Feather name="user" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        fontWeight: 'bold',
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
        borderColor: '#ccc',
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
    },
    dayContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: (width - 20) / 7,
        height: 60, // Increased height for better spacing
    },
    day: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    dayText: {
        fontSize: 16,
        color: '#000',
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
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        marginBottom:20
    },
    tabItem: {
        alignItems: 'center',
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
});

export default TripCalendar;
