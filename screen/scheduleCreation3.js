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

    const localhost = "54.180.146.203";

    const userInfo = route.params.userInfo;

    const [friendsList,setFriendsList] = useState(null);


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

        navigation.navigate('ScheduleCreationAccommodation', { scheduleInfo: updateScheduleInfo, userInfo:userInfo });
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
            <View style={styles.friendIconContainer}>
                <Entypo name="user" size={24} color="gray" />
            </View>
            <Text style={styles.friendName}>{item.user_nick}</Text>
            <TouchableOpacity style={styles.removeButton} onPress={() => setSelectedFriends(selectedFriends.filter(friend => friend.user_id !== item.user_id))}>
                <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
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
            dates[start.toISOString().split('T')[0]] = {
                selected: true,
                color: '#FF6347',
                textColor: 'white',
            };
        } else {
            while (current <= end) {
                const dateString = current.toISOString().split('T')[0];
                dates[dateString] = {
                    selected: true,
                    color: '#FF6347',
                    textColor: 'white',
                };
                current.setDate(current.getDate() + 1);
            }
        }

        setMarkedDates(dates);
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
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={toggleDateModal}>
                    <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={() => {
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
                }}>
                    <Text style={styles.buttonText}>다음</Text>
                </TouchableOpacity>
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

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월을 2자리로 맞추기
        const day = String(date.getDate()).padStart(2, '0'); // 일을 2자리로 맞추기
        return `${year}.${month}.${day}.`;
    };


    const renderTimeSelectionModal = () => (
        <Modal isVisible={isTimeSelectionModalVisible}>
            <View style={styles.modalContent}>
                <View style={styles.timeHeader}>
                    <Text style={styles.timeText}>여행 시작 시간</Text>
                    <Text style={styles.timeText}>여행 종료 시간</Text>
                </View>
                { Math.floor((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1  < 7 ? (
                    <ScrollView>
                        {Array.from({ length: Math.floor((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1 }, (_, i) => (
                            <View key={i} style={styles.timeRow}>
                                <Text style={styles.dateText}>{formatDate(new Date(dateRange.startDate.getTime() + i * 24 * 60 * 60 * 1000))}</Text>
                                <View style={styles.fixedButtonContainer}>
                                    <TouchableOpacity style={styles.customButton} onPress={() => toggleTimePicker(i, 'start')}>
                                        <Text style={styles.buttonText2}>{formatTime(times.startTimes[i])}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.fixedButtonContainer}>
                                    <TouchableOpacity style={styles.customButton} onPress={() => toggleTimePicker(i, 'end')}>
                                        <Text style={styles.buttonText2}>{formatTime(times.endTimes[i])}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                ):(
                    <ScrollView style={styles.scrollContain}>
                        {Array.from({ length: Math.floor((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24)) + 1 }, (_, i) => (
                            <View key={i} style={styles.timeRow}>
                                <Text style={styles.dateText}>{formatDate(new Date(dateRange.startDate.getTime() + i * 24 * 60 * 60 * 1000))}</Text>
                                <View style={styles.fixedButtonContainer}>
                                    <TouchableOpacity style={styles.customButton} onPress={() => toggleTimePicker(i, 'start')}>
                                        <Text style={styles.buttonText2}>{formatTime(times.startTimes[i])}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.fixedButtonContainer}>
                                    <TouchableOpacity style={styles.customButton} onPress={() => toggleTimePicker(i, 'end')}>
                                        <Text style={styles.buttonText2}>{formatTime(times.endTimes[i])}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    )}

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.customButton2} onPress={() => {
                        toggleTimeSelectionModal();
                        toggleDateModal();
                    }}>
                        <Text style={styles.buttonText2}>이전</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.customButton2} onPress={toggleTimeSelectionModal}>
                        <Text style={styles.buttonText2}>완료</Text>
                    </TouchableOpacity>
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
            <View style={styles.dateContainer}>
                <TouchableOpacity style={styles.dateButton} onPress={toggleDateModal}>
                    <FontAwesome name="calendar" size={24} color="black" />
                    <Text style={styles.dateText}>
                        {`${dateRange.startDate ? dateRange.startDate.toLocaleDateString() : ''} - ${dateRange.endDate ? dateRange.endDate.toLocaleDateString() : ''}`}
                    </Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.inviteButton} onPress={toggleFriendsModal}>
                <Text style={styles.inviteButtonText}>일행 초대</Text>
            </TouchableOpacity>
            <FlatList
                data={selectedFriends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.user_id} // 고유한 user_id를 키로 사용
            />

            <Modal isVisible={isFriendsModalVisible}>
                <View style={styles.modalContent}>
                    {friendsList.map(friend => (
                        <View key={friend.user_id} style={styles.friendItem2}>
                            <View style={styles.friendIconContainer}>
                                <Entypo name="user" size={24} color="gray" />
                            </View>
                            <Text style={styles.friendName}>{friend.user_nick}</Text>
                            {selectedFriends.find(selectedFriend => selectedFriend.user_id === friend.user_id) ? (
                                <View style={styles.inviteButton3}>
                                    <Text style={styles.invitedText}>초대완료</Text>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.inviteButton2} onPress={() => selectFriend(friend)}>
                                    <Text style={styles.inviteButtonText2}>초대</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                    <TouchableOpacity style={styles.modalButton} onPress={toggleFriendsModal}>
                        <Text style={styles.modalButtonText}>닫기</Text>
                    </TouchableOpacity>
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
        textAlign: 'center',
        marginTop:25
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal:10,
        marginHorizontal: 20,
        marginVertical:5,
        backgroundColor: '#fff', // 그림자가 잘 보이도록 배경색 추가
        borderRadius: 10, // 모서리 둥글게
        // 그림자 효과 추가
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5, // Android에서의 그림자 효과
    },
    friendItem2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal:20,
        marginVertical:5,
        backgroundColor: '#fff', // 그림자가 잘 보이도록 배경색 추가
        borderRadius: 10, // 모서리 둥글게
        // 그림자 효과 추가
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5, // Android에서의 그림자 효과

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
        justifyContent: 'flex-end',
        paddingVertical: 10,
    },
    timeText: {
        marginLeft: 20,  // 텍스트 간의 간격을 조정할 때 사용
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
    dateContainer: {
        alignItems: 'center',
        marginBottom: 10,
        marginTop:15

    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal:70
    },
    dateText:{
        marginLeft:10
    },
    inviteButton: {
        backgroundColor: '#000000',
        borderRadius: 10,
        marginHorizontal:20,
        alignItems: 'center',
        paddingHorizontal:20,
        paddingVertical:15,
        marginBottom:5
    },
    inviteButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    inviteButton2: {
        backgroundColor: '#000000',
        alignItems: 'center',
        paddingHorizontal:20,
        paddingVertical:5,
        borderRadius:5,
        paddingBottom:7
    },
    inviteButtonText2: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    inviteButton3: {
        alignItems: 'center',
        paddingHorizontal:10,
        paddingVertical:5,
        borderRadius:5,
        paddingBottom:7
    },
    friendIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    friendName: {
        flex: 1,
        fontSize: 16,
    },
    invitedText: {
        color: 'green',
        fontWeight: 'bold',
    },
    modalButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#000000',
        borderRadius: 5,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    cancelButton: {
        backgroundColor: 'black',
    },
    nextButton: {
        backgroundColor: 'black',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonText2: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    fixedButtonContainer: {
        marginRight :10
    },
    customButton: {
        backgroundColor: 'black', // 버튼의 배경색 변경 (초록색)
        padding:5,
        borderRadius:3
    },
    customButton2: {
        backgroundColor: 'black', // 버튼의 배경색 변경 (초록색)
        paddingHorizontal:10,
        marginHorizontal:5,
        borderRadius:3,
        paddingVertical:3,
        paddingBottom:5
    },
    scrollContain:{
        height:"38%",
    }
});

export default ScheduleCreation3;
