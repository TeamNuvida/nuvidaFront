import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import axios from "axios";

const ReservationInfo = ({ route }) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    // 일정 식별자
    const plan_seq = route.params.plan_seq;

    console.log(plan_seq)


    const [ticketModalVisible, setTicketModalVisible] = useState(false);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
    const [newTicketTitle, setNewTicketTitle] = useState('');
    const [newTicketDate, setNewTicketDate] = useState(new Date());
    const [newTicketTime, setNewTicketTime] = useState(new Date());
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemDate, setNewItemDate] = useState(new Date());
    const [newItemStartTime, setNewItemStartTime] = useState(new Date());
    const [newItemEndTime, setNewItemEndTime] = useState(new Date());
    const [showTicketDatePicker, setShowTicketDatePicker] = useState(false);
    const [showTicketTimePicker, setShowTicketTimePicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [items, setItems] = useState([
        { title: '국립광주박물관', date: '2024.05.21', time: '10:00 - 12:00 p.m.' }
    ]);
    const [tickets, setTickets] = useState([]);
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);

    const handleAddItem = () => {
        if (newItemTitle && newItemDate && newItemStartTime && newItemEndTime) {
            setItems([...items, {
                title: newItemTitle,
                date: newItemDate.toLocaleDateString(),
                time: `${newItemStartTime.toLocaleTimeString()} - ${newItemEndTime.toLocaleTimeString()}`
            }]);
            resetScheduleModal();
        } else {
            alert("위치, 날짜, 시작 시간, 끝 시간을 입력하세요.");
        }
    };

    const handleAddTicket = () => {
        if (newTicketTitle && newTicketDate && newTicketTime) {
            setTickets([...tickets, {
                title: newTicketTitle,
                date: newTicketDate.toLocaleDateString(),
                time: newTicketTime.toLocaleTimeString()
            }]);
            resetTicketModal();
        } else {
            alert("티켓 정보(위치, 날짜, 시간)를 입력하세요.");
        }
    };

    const resetScheduleModal = () => {
        setNewItemTitle('');
        setNewItemDate(new Date());
        setNewItemStartTime(new Date());
        setNewItemEndTime(new Date());
        setScheduleModalVisible(false);
    };

    const resetTicketModal = () => {
        setNewTicketTitle('');
        setNewTicketDate(new Date());
        setNewTicketTime(new Date());
        setTicketModalVisible(false);
    };

    const handleDeleteItem = (index) => {
        Alert.alert(
            "삭제 확인",
            "삭제하시겠습니까?",
            [
                { text: "아니요", style: "cancel" },
                { text: "예", onPress: () => {
                        const newItems = items.filter((_, i) => i !== index);
                        setItems(newItems);
                    }}
            ]
        );
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || newItemDate;
        setShowDatePicker(Platform.OS === 'ios');
        setNewItemDate(currentDate);
    };

    const handleStartTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || newItemStartTime;
        setShowStartTimePicker(Platform.OS === 'ios');
        setNewItemStartTime(currentTime);
    };

    const handleEndTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || newItemEndTime;
        setShowEndTimePicker(Platform.OS === 'ios');
        setNewItemEndTime(currentTime);
    };

    const handleTicketDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || newTicketDate;
        setShowTicketDatePicker(Platform.OS === 'ios');
        setNewTicketDate(currentDate);
    };

    const handleTicketTimeChange = (event, selectedTime) => {
        const currentTime = selectedTime || newTicketTime;
        setShowTicketTimePicker(Platform.OS === 'ios');
        setNewTicketTime(currentTime);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => { /* Back button action */ }}>
                    <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteIcons(!showDeleteIcons)}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.location}>광 주</Text>
                    <Text style={styles.date}>2024. 05. 21 (토) - 2024. 05. 23 (월)</Text>
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("TripSchedule", {userInfo:userInfo, plan_seq:plan_seq})}>
                        <Text style={styles.tabTextActive}>여행일정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButtonActive} onPress={()=>navigation.navigate("ReservationInfo", {userInfo:userInfo, plan_seq:plan_seq})}>
                        <Text style={styles.tabText}>예약정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("MemberList", {userInfo:userInfo, plan_seq:plan_seq})}>
                        <Text style={styles.tabText}>멤버목록</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("Calculate", {userInfo:userInfo, plan_seq:plan_seq})}>
                        <Text style={styles.tabText}>정산하기</Text>
                    </TouchableOpacity>
                </View>
                {tickets.length === 0 ? (
                    <TouchableOpacity style={styles.addTicketButton} onPress={() => setTicketModalVisible(true)}>
                        <Text style={styles.addTicketText}>티켓 정보 추가</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.reservationInfoContainer}>
                        {tickets.map((ticket, index) => (
                            <View key={index} style={styles.reservationInfo}>
                                <MaterialCommunityIcons name="airplane" size={40} color="grey" style={styles.icon} />
                                <View style={styles.reservationDetails}>
                                    <Text style={styles.detailTitle}>{ticket.title}</Text>
                                    <Text style={styles.detailText}>{ticket.date} {ticket.time}</Text>
                                    <View style={styles.reservationSeats}>
                                        <View style={styles.seatInfo}>
                                            <Text style={styles.seatText}>승차점</Text>
                                            <Text style={styles.seatNumber}>11</Text>
                                        </View>
                                        <View style={styles.seatInfo}>
                                            <Text style={styles.seatText}>좌석번호</Text>
                                            <Text style={styles.seatNumber}>06</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
                <View style={styles.line} />
                <View style={styles.boxContainer}>
                    <Text style={styles.subHeader}>예약 목록</Text>
                    <View style={styles.contentContainer}>
                        <View style={styles.itemList}>
                            {items.map((item, index) => (
                                <View key={index} style={styles.itemBox}>
                                    {showDeleteIcons && (
                                        <TouchableOpacity
                                            style={styles.deleteIcon}
                                            onPress={() => handleDeleteItem(index)}
                                        >
                                            <Entypo name="cross" size={24} color="red" />
                                        </TouchableOpacity>
                                    )}
                                    <Text style={styles.itemName}>{item.title}</Text>
                                    <Text style={styles.itemDate}>{item.date}</Text>
                                    <Text style={styles.itemTime}>{item.time}</Text>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.addItemButton} onPress={() => setScheduleModalVisible(true)}>
                            <Text style={styles.addItemText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* 티켓 추가 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={ticketModalVisible}
                onRequestClose={() => {
                    setTicketModalVisible(!ticketModalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>티켓 추가</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="티켓 위치를 입력하세요"
                            value={newTicketTitle}
                            onChangeText={setNewTicketTitle}
                        />
                        <TouchableOpacity onPress={() => setShowTicketDatePicker(true)} style={styles.input}>
                            <Text>{newTicketDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showTicketDatePicker && (
                            <DateTimePicker
                                value={newTicketDate}
                                mode="date"
                                display="default"
                                onChange={handleTicketDateChange}
                            />
                        )}
                        <TouchableOpacity onPress={() => setShowTicketTimePicker(true)} style={styles.input}>
                            <Text>{newTicketTime.toLocaleTimeString()}</Text>
                        </TouchableOpacity>
                        {showTicketTimePicker && (
                            <DateTimePicker
                                value={newTicketTime}
                                mode="time"
                                display="default"
                                onChange={handleTicketTimeChange}
                            />
                        )}
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setTicketModalVisible(!ticketModalVisible)}
                            >
                                <Text style={styles.textStyle}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonAdd]}
                                onPress={handleAddTicket}
                            >
                                <Text style={styles.textStyle}>추가</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 일정 추가 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={scheduleModalVisible}
                onRequestClose={() => {
                    setScheduleModalVisible(!scheduleModalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>일정 추가</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="위치를 입력하세요"
                            value={newItemTitle}
                            onChangeText={setNewItemTitle}
                        />
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                            <Text>{newItemDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={newItemDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                        <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.input}>
                            <Text>{newItemStartTime.toLocaleTimeString()}</Text>
                        </TouchableOpacity>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={newItemStartTime}
                                mode="time"
                                display="default"
                                onChange={handleStartTimeChange}
                            />
                        )}
                        <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.input}>
                            <Text>{newItemEndTime.toLocaleTimeString()}</Text>
                        </TouchableOpacity>
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={newItemEndTime}
                                mode="time"
                                display="default"
                                onChange={handleEndTimeChange}
                            />
                        )}
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setScheduleModalVisible(!scheduleModalVisible)}
                            >
                                <Text style={styles.textStyle}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonAdd]}
                                onPress={handleAddItem}
                            >
                                <Text style={styles.textStyle}>추가</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    backButton: {
        paddingVertical: 10,
    },
    backButtonText: {
        color: '#000',
        fontSize: 16,
    },
    deleteButton: {
        paddingVertical: 10,
    },
    deleteButtonText: {
        color: 'red',
        fontSize: 16,
    },
    scrollContainer: {
        paddingBottom: 80, // Ensure there's space for the tabBar
    },
    header: {
        alignItems: 'center',
        marginVertical: 20,
    },
    location: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingBottom: 10,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    tabButtonActive: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderColor: '#000',
    },
    tabText: {
        fontSize: 16,
        color: '#999',
    },
    tabTextActive: {
        fontSize: 16,
        color: '#000',
    },
    reservationInfoContainer: {
        padding: 20,
    },
    reservationInfo: {
        padding: 20,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
    },
    icon: {
        marginBottom: 20,
        alignSelf: 'center',
    },
    reservationDetails: {
        alignItems: 'center',
    },
    detailTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    reservationSeats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    seatInfo: {
        alignItems: 'center',
    },
    seatText: {
        fontSize: 14,
        color: '#666',
    },
    seatNumber: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    boxContainer: {
        backgroundColor: 'white',
        padding: 15,
        margin: 20,
        borderRadius: 10,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    contentContainer: {
        padding: 20,
    },
    itemList: {
        marginBottom: 20,
    },
    itemBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    deleteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    itemDate: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    itemTime: {
        fontSize: 16,
        color: '#666',
    },
    addItemButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 1,
        borderColor: '#838383',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    addItemText: {
        fontSize: 24,
        color: '#000',
    },
    addTicketButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderWidth: 1,
        borderColor: '#838383',
        borderRadius: 5,
        backgroundColor: '#fff',
        margin: 20,
    },
    addTicketText: {
        fontSize: 18,
        color: '#000',
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
        marginBottom: 20,
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
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#959595',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
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
    line: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 0.7,
        marginVertical: 10,
        marginHorizontal: 20,
    },
});

export default ReservationInfo;
