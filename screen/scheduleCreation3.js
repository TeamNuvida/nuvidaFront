import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Button,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ScrollView,
    Alert,
    SafeAreaView, ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Entypo, Ionicons, FontAwesome,  Feather} from '@expo/vector-icons';
import axios from 'axios';

const ScheduleCreation3 = ({ route, navigation }) => {
    const [isFriendsModalVisible, setFriendsModalVisible] = useState(false);
    const [isDateModalVisible, setDateModalVisible] = useState(false);
    const [isTimeSelectionModalVisible, setTimeSelectionModalVisible] = useState(false);
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 1))
    });
    const [selectedDateIndex, setSelectedDateIndex] = useState(null);
    const [selectedTimeType, setSelectedTimeType] = useState(null); // 'start' or 'end'
    const [times, setTimes] = useState({
        startTimes: [],
        endTimes: []
    });
    const [markedDates, setMarkedDates] = useState({});

    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
    // const [userInfo, setUserInfo] = useState(null);  // 로그인 정보
    const scheduleInfo = route.params.scheduleInfo; // 일정 생성 정보

    const [loading, setLoading] = useState(true);

    console.log(scheduleInfo);

    const localhost = "192.168.55.35";

    const userInfo = {user_id:'test', user_nick:'test', user_point:200};

    const [friendsList,setFriendsList] = useState(null);

    // const friendsList = [
    //     { user_id: "user1", user_nick: "이건학" },
    //     { user_id: "user2", user_nick: "박지뉴" },
    //     { user_id: "user3", user_nick: "이태희" },
    //     { user_id: "user4", user_nick: "지수빈" }
    // ];

    useEffect(() => {
        const getFriends = async () => {

            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/getFriend`,{user_id:userInfo.user_id});
                setFriendsList(response.data)
            } catch (error) {
                console.error('Error fetching plan data:', error);
            }finally {
                setLoading(false); // 데이터 로드 완료 후 로딩 상태 false로 변경
            }
        };

        getFriends();
    }, []);

    // 로컬 시간 포맷 함수
    const formatLocalDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    // 루트 정보 추가
    const handleScheduleInfoPress = () => {
        const friendData = selectedFriends.map(item => item.user_id);
        const start_date = times.startTimes.map(time => formatLocalDateTime(time));
        const end_date = times.endTimes.map(time => formatLocalDateTime(time));
        const date_range = [formatLocalDateTime(dateRange.startDate), formatLocalDateTime(dateRange.endDate)];

        const updateScheduleInfo = { ...scheduleInfo, friends_id: friendData, start_date: start_date, end_date: end_date, dateRange: date_range};

        console.log(updateScheduleInfo)

        if (start_date.length == 0 || end_date.length == 0) {
            Alert.alert('', '여행 날짜를 선택해주세요.');
            return;
        }

        navigation.navigate('ScheduleCreationAccommodation', { scheduleInfo: updateScheduleInfo });
    }

    const toggleFriendsModal = () => {
        setFriendsModalVisible(!isFriendsModalVisible);
    };

    const toggleDateModal = () => {
        setDateModalVisible(!isDateModalVisible);
    };

    const toggleTimeSelectionModal = () => {
        setTimeSelectionModalVisible(!isTimeSelectionModalVisible);
    };

    const toggleTimePicker = (index, type) => {
        setSelectedDateIndex(index);
        setSelectedTimeType(type);
        setTimePickerVisible(true);
    };

    const selectFriend = (friend) => {
        setSelectedFriends([...selectedFriends, friend]);
    };

    const renderFriendItem = ({ item }) => (
        <View style={styles.friendItem}>
            <Text>{item.user_nick}</Text>
            {selectedFriends.find(friend => friend.user_id === item.user_id) ? null : (
                <Button title="초대" onPress={() => selectFriend(item)} />
            )}
            <Button title="X" onPress={() => setSelectedFriends(selectedFriends.filter(friend => friend.user_id !== item.user_id))} />
        </View>
    );


    const handleDateChange = (event, value) => {
        if (value) {
            const selectedTime = new Date(value);

            const updatedTimes = { ...times };

            if (selectedTimeType === 'start') {
                // 기존의 시작 날짜와 새로 선택된 시간을 결합하여 새로운 Date 객체 생성
                const currentStartDate = new Date(dateRange.startDate.getTime() + selectedDateIndex * 24 * 60 * 60 * 1000);
                updatedTimes.startTimes[selectedDateIndex] = new Date(
                    currentStartDate.getFullYear(),
                    currentStartDate.getMonth(),
                    currentStartDate.getDate(),
                    selectedTime.getHours(),
                    selectedTime.getMinutes()
                );
            } else if (selectedTimeType === 'end') {
                // 기존의 종료 날짜와 새로 선택된 시간을 결합하여 새로운 Date 객체 생성
                const currentEndDate = new Date(dateRange.startDate.getTime() + selectedDateIndex * 24 * 60 * 60 * 1000);
                updatedTimes.endTimes[selectedDateIndex] = new Date(
                    currentEndDate.getFullYear(),
                    currentEndDate.getMonth(),
                    currentEndDate.getDate(),
                    selectedTime.getHours(),
                    selectedTime.getMinutes()
                );
            }

            setTimes(updatedTimes);
            setTimePickerVisible(false);
        }
    };



    const onDayPress = (day) => {
        const selectedDate = new Date(day.timestamp);
        const today = new Date();
        if (selectedDate < today.setHours(0, 0, 0, 0)) {
            return; // Do not allow past dates
        }

        let startDate = dateRange.startDate;
        let endDate = dateRange.endDate;

        if (!startDate || (startDate && endDate)) {
            startDate = selectedDate;
            endDate = null;
        } else if (!endDate) {
            endDate = selectedDate;
            if (startDate > endDate) {
                [startDate, endDate] = [endDate, startDate];
            }
        }

        setDateRange({ startDate, endDate });
        markSelectedDates(startDate, endDate);
    };

    const markSelectedDates = (start, end) => {
        let dates = {};
        let current = new Date(start);

        if (!end) {
            dates[start.toISOString().split('T')[0]] = { selected: true, color: 'blue', textColor: 'white' };
        } else {
            while (current <= end) {
                const dateString = current.toISOString().split('T')[0];
                dates[dateString] = { selected: true, color: 'blue', textColor: 'white' };
                current.setDate(current.getDate() + 1);
            }
        }

        setMarkedDates(dates);
    };

    // 하단바 일정 아이콘
    const handlePlanCalendarIconPress = () => {
        if (isLoggedIn) {
            navigation.navigate("planCalendarPage");
        } else {
            navigation.navigate("loginPage");
        }
    };

    const renderDateModal = () => (
        <Modal isVisible={isDateModalVisible}>
            <View style={styles.modalContent}>
                <Calendar
                    minDate={new Date().toISOString().split('T')[0]}
                    onDayPress={onDayPress}
                    markedDates={markedDates}
                    markingType={'period'}
                />
                <Button title="취소" onPress={toggleDateModal} />
                <Button title="다음" onPress={() => {
                    if (!dateRange.startDate || !dateRange.endDate || dateRange.startDate >= dateRange.endDate) {
                        alert("올바른 날짜 범위를 선택하세요.");
                        return;
                    }
                    toggleDateModal();
                    setTimes({
                        startTimes: Array.from({ length: Math.floor((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1 }, () => new Date(new Date().setHours(9, 0))),
                        endTimes: Array.from({ length: Math.floor((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1 }, () => new Date(new Date().setHours(18, 0)))
                    });
                    toggleTimeSelectionModal();
                }} />
            </View>
        </Modal>
    );

    // 상단 바
    const renderHeader = () => {
        return (
            <View style={[styles.center_row, styles.headerContainer]}>
                <View style={[{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-start'}]}>
                    <TouchableOpacity style={[styles.center_row, {marginLeft: '12%'}]} onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={14} color="black" />
                        <Text style={{fontSize: 14, marginLeft: '5%'}}>이전</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width: '40%', height: '100%'}}>
                </View>
                <View style={[{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end',}]}>
                    <TouchableOpacity style={[styles.center_row, {marginRight: '12%'}]} onPress={() => handleScheduleInfoPress()}>
                        <Text style={{fontSize: 14, marginRight: '5%'}}>다음</Text>
                        <Entypo name="chevron-thin-right" size={14} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderTimeSelectionModal = () => (
        <Modal isVisible={isTimeSelectionModalVisible}>
            <View style={styles.modalContent}>
                <View style={styles.timeHeader}>
                    <Text>여행 시작 시간</Text>
                    <Text>여행 종료 시간</Text>
                </View>
                {Array.from({ length: Math.floor((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1 }, (_, i) => (
                    <View key={i} style={styles.timeRow}>
                        <Text>{new Date(dateRange.startDate.getTime() + i * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
                        <Button title={formatTime(times.startTimes[i])} onPress={() => toggleTimePicker(i, 'start')} />
                        <Button title={formatTime(times.endTimes[i])} onPress={() => toggleTimePicker(i, 'end')} />
                    </View>
                ))}
                <View style={styles.buttonRow}>
                    <Button title="이전" onPress={() => {
                        toggleTimeSelectionModal();
                        toggleDateModal();
                    }} />
                    <Button title="완료" onPress={toggleTimeSelectionModal} />
                </View>
            </View>
        </Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </SafeAreaView>
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

    const formatTime = (date) => {
        if (!date) return "시간 선택";
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };



    return (
        <View style={styles.container}>
            {renderHeader()}
            <Text style={styles.title}>{scheduleInfo.plan_name}</Text>
            <TouchableOpacity onPress={toggleDateModal}>
                <Text>
                    {`${dateRange.startDate ? dateRange.startDate.toLocaleDateString() : ''} - ${dateRange.endDate ? dateRange.endDate.toLocaleDateString() : ''}`}
                </Text>
            </TouchableOpacity>
            <Button title="일행 초대" onPress={toggleFriendsModal} />
            <FlatList
                data={selectedFriends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.user_id} // 고유한 user_id를 키로 사용
            />

            <Modal isVisible={isFriendsModalVisible}>
                <View style={styles.modalContent}>
                    {friendsList.map(friend => (
                        <View key={friend.user_id} style={styles.friendItem}>
                            <Text>{friend.user_nick}</Text>
                            {selectedFriends.find(selectedFriend => selectedFriend.user_id === friend.user_id) ? (
                                <Text>초대됨</Text>
                            ) : (
                                <Button title="초대" onPress={() => selectFriend(friend)} />
                            )}
                        </View>
                    ))}
                    <Button title="닫기" onPress={toggleFriendsModal} />
                </View>
            </Modal>

            {renderDateModal()}
            {renderTimeSelectionModal()}
            {isTimePickerVisible && (
                <DateTimePicker
                    value={times[selectedTimeType === 'start' ? 'startTimes' : 'endTimes'][selectedDateIndex] || new Date()}
                    mode="time"
                    display="spinner"
                    onChange={handleDateChange}
                />
            )}
            {renderTabBar()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    timeHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'center',
        marginTop: 10
    },

    /* 상단바 */
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
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
});

export default ScheduleCreation3;
