import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import moment from 'moment';

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

const TravelCalendar = ({ navigation }) => {
    const [currentDate, setCurrentDate] = useState(moment());
    const [markedDates, setMarkedDates] = useState({});
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const today = moment().format('YYYY-MM-DD');
        setMarkedDates({
            [today]: { selected: true, color: 'red' }
        });
    }, []);

    const handleAddEvent = () => {
        if (selectedDate) {
            const newMarkedDates = {
                ...markedDates,
                [selectedDate]: { selected: true, color: 'blue' }
            };
            setMarkedDates(newMarkedDates);
            setDatePickerVisibility(false);
            Alert.alert('일정 추가', `${selectedDate}에 일정이 추가되었습니다.`);
        } else {
            Alert.alert('오류', '날짜를 선택하세요.');
        }
    };

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
                                            {isMarked && (
                                                <View style={styles.markBar}></View>
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

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderCalendarHeader()}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {renderCalendar()}
                <TouchableOpacity style={styles.addButton} onPress={() => setDatePickerVisibility(true)}>
                    <Text style={styles.addButtonText}>일정 추가</Text>
                </TouchableOpacity>
            </ScrollView>
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Entypo name="home" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="chatbubbles-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Feather name="user" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isDatePickerVisible}
                onRequestClose={() => setDatePickerVisibility(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>날짜 선택</Text>
                        {renderDatePicker()}
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setDatePickerVisibility(false)}
                            >
                                <Text style={styles.textStyle}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonAdd]}
                                onPress={handleAddEvent}
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
});

export default TravelCalendar;
