import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Entypo, FontAwesome, Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const TripSchedule = ({ navigation }) => {
    const [selectedDay, setSelectedDay] = useState('전체');
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);
    const [schedule, setSchedule] = useState({
        '전체': [
            { time: '오전 10:00', title: '국립광주박물관', details: '10:00 - 12:00', address: '광주 북구 하서로 110', icon: 'museum' },
            { time: '오전 11:00', title: '버스정류장이름', details: '10:00 - 12:00', icon: 'directions-bus', travelTime: '45분', transportation: '수완03, 문흥39' },
            { time: '오전 12:00', title: '궁전제과 운암점', details: '10:00 - 12:00', icon: 'storefront' },
        ],
        '1일차': [
            { time: '오전 10:00', title: '국립광주박물관', details: '10:00 - 12:00', address: '광주 북구 하서로 110', icon: 'museum' },
        ],
        '2일차': [
            { time: '오전 11:00', title: '버스정류장이름', details: '10:00 - 12:00', icon: 'directions-bus', travelTime: '45분', transportation: '수완03, 문흥39' },
        ],
        '3일차': [
            { time: '오전 12:00', title: '궁전제과 운암점', details: '10:00 - 12:00', icon: 'storefront' },
        ],
    });

    const handleDeleteItem = (day, index) => {
        Alert.alert(
            "삭제 확인",
            "이 일정을 삭제하시겠습니까?",
            [
                { text: "아니요", style: "cancel" },
                { text: "예", onPress: () => {
                        const newSchedule = { ...schedule };
                        newSchedule[day] = newSchedule[day].filter((_, i) => i !== index);
                        setSchedule(newSchedule);
                    }}
            ]
        );
    };

    const renderDaySchedule = (day) => {
        return schedule[day].map((item, index) => (
            <View key={index} style={styles.scheduleItem}>
                <View style={styles.timeLine}>
                    <View style={styles.circle} />
                    {index !== schedule[day].length - 1 && <View style={styles.line} />}
                </View>
                <View style={styles.scheduleItemContent}>
                    <View style={styles.scheduleItemHeader}>
                        <View style={styles.iconTitleContainer}>
                            <MaterialIcons name={item.icon} size={24} color="black" />
                            <Text style={styles.titleText}>{item.title}</Text>
                        </View>
                        {showDeleteIcons && (
                            <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteItem(day, index)}>
                                <Entypo name="cross" size={24} color="red" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <Text style={styles.detailsText}>{item.details}</Text>
                    {item.address && <Text style={styles.addressText}>{item.address}</Text>}
                    {item.travelTime && <Text style={styles.travelTimeText}>{item.travelTime}</Text>}
                    {item.transportation && <Text style={styles.transportationText}>{item.transportation}</Text>}
                </View>
            </View>
        ));
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
                    <TouchableOpacity style={styles.tabButtonActive}>
                        <Text style={styles.tabTextActive}>여행일정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton}>
                        <Text style={styles.tabText}>예약정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton}>
                        <Text style={styles.tabText}>멤버목록</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton}>
                        <Text style={styles.tabText}>정산하기</Text>
                    </TouchableOpacity>
                </View>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 35.1595454,
                        longitude: 126.8526012,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    <Marker
                        coordinate={{ latitude: 35.1595454, longitude: 126.8526012 }}
                        title="국립광주박물관"
                        description="10:00 - 12:00"
                    />
                </MapView>
                <View style={styles.dayTabs}>
                    <TouchableOpacity style={selectedDay === '전체' ? styles.dayTabActive : styles.dayTab} onPress={() => setSelectedDay('전체')}>
                        <Text style={selectedDay === '전체' ? styles.dayTabTextActive : styles.dayTabText}>전체</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={selectedDay === '1일차' ? styles.dayTabActive : styles.dayTab} onPress={() => setSelectedDay('1일차')}>
                        <Text style={selectedDay === '1일차' ? styles.dayTabTextActive : styles.dayTabText}>1일차</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={selectedDay === '2일차' ? styles.dayTabActive : styles.dayTab} onPress={() => setSelectedDay('2일차')}>
                        <Text style={selectedDay === '2일차' ? styles.dayTabTextActive : styles.dayTabText}>2일차</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={selectedDay === '3일차' ? styles.dayTabActive : styles.dayTab} onPress={() => setSelectedDay('3일차')}>
                        <Text style={selectedDay === '3일차' ? styles.dayTabTextActive : styles.dayTabText}>3일차</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.scheduleContainer}>
                    {renderDaySchedule(selectedDay)}
                </View>
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
        paddingBottom: 80,
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
    map: {
        width: '100%',
        height: 200,
    },
    dayTabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: 'white',
    },
    dayTab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: 'white',
    },
    dayTabActive: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#f35353',
    },
    dayTabText: {
        color: '#000',
    },
    dayTabTextActive: {
        color: '#fff',
    },
    scheduleContainer: {
        padding: 20,
    },
    scheduleItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timeLine: {
        alignItems: 'center',
        width: 40,
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#f35353',
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#f35353',
    },
    scheduleItemContent: {
        flex: 1,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,

        elevation: 5,
    },
    scheduleItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 5,
        marginLeft: 10,
    },
    detailsText: {
        fontSize: 14,
        color: '#666',
    },
    addressText: {
        fontSize: 14,
        color: '#666',
    },
    travelTimeText: {
        fontSize: 14,
        color: '#666',
    },
    transportationText: {
        fontSize: 14,
        color: '#666',
    },
    deleteIcon: {
        marginLeft: 10,
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
});

export default TripSchedule;
