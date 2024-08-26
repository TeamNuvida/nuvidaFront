import React, { useState, useEffect } from 'react';
import { Modal, FlatList, StyleSheet, Text, TextInput, View, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { FontAwesome5, AntDesign, FontAwesome, Entypo, Ionicons, Feather, MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function ScheduleCreation5({route}) {
    const navigation = useNavigation();

    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
    const [userInfo, setUserInfo] = useState(null);  // 로그인 정보
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const scheduleInfo = route.params.scheduleInfo; // 일정 생성 정보

    const localhost = "192.168.55.35";

    const [reservations, setReservations] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState();
    const [selectedPlaceName, setSelectedPlaceName] = useState('');
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    console.log("값확인",scheduleInfo);

    // 루트 정보 추가
    const handleScheduleInfoPress = async () => {
        // 예약 정보를 업데이트하기 위해 selectedPlaces를 map으로 순회합니다.
        const updatedPlaces = scheduleInfo.selectedPlaces.map((place) => {
            // 예약 정보에서 해당 장소의 id와 일치하는 예약 항목을 찾습니다.
            const reservation = reservations.find(res => res.id === place.id);

            // 만약 해당하는 예약 정보가 있다면, reservation 필드를 업데이트합니다.
            if (reservation) {
                const formattedDateTime = `${reservation.date}T${reservation.time}:00`;
                return {
                    ...place,
                    reservation: formattedDateTime
                };
            }

            // 예약 정보가 없다면 원래의 place 정보를 그대로 반환합니다.
            return place;
        });

        // 업데이트된 장소 정보를 scheduleInfo에 반영합니다.
        scheduleInfo.selectedPlaces = updatedPlaces;



        if(scheduleInfo.route == '1'){
            navigation.navigate('ScheduleCreation6', { scheduleInfo: scheduleInfo});
        } else{
            navigation.navigate('ScheduleCreation7', { scheduleInfo: scheduleInfo});
        }

        console.log("예약확인", scheduleInfo.selectedPlaces)


    }



    const handleDelete = (id) => {
        setReservations(reservations.filter((item) => item.id !== id));
    };

    const handleAddReservation = () => {
        setModalVisible(true);
    };

    const handleSaveReservation = () => {
        const datePattern = /^\d{4}\.\d{2}\.\d{2}$/;
        const timePattern = /^\d{2}:\d{2}$/;



        if (!datePattern.test(reservationDate)) {
            Alert.alert('', '날짜 형식이 올바르지 않습니다. (예: 2024.11.13)');
            return;
        }

        if (!timePattern.test(reservationTime)) {
            Alert.alert('', '시간 형식이 올바르지 않습니다. (예: 10:00)');
            return;
        }

        if (!selectedPlaceName || !selectedPlaceId) {
            Alert.alert('', '예약장소를 선택해주세요.');
            return;
        }

        if (!selectedPlaceName || !reservationDate || !reservationTime || !selectedPlaceId) {
            Alert.alert('', '모든 필드를 채워주세요.');
            return;
        }



        const newReservation = {
            id: selectedPlaceId,
            name: selectedPlaceName,
            date: reservationDate,
            time: reservationTime,
        };

        setReservations([...reservations, newReservation]);
        setModalVisible(false);
        setDropdownVisible(false);
        setSelectedPlaceName('');
        setSelectedPlaceId();
        setReservationDate('');
        setReservationTime('');
    };

    const renderPlaceItem = ({ item }) => (
        <TouchableOpacity onPress={() => {
            setSelectedPlaceName(item.name);
            setSelectedPlaceId(item.id);
            setDropdownVisible(false); // Hide the dropdown after selection
        }}>
            <Text style={styles.placeItem}>{item.name}</Text>
        </TouchableOpacity>
    );

    const availablePlaces = scheduleInfo.selectedPlaces.filter(
        place => !reservations.some(reservation => reservation.id === place.id) && place.reservation === null
    );

    // 하단바 일정 아이콘
    const handlePlanCalendarIconPress = () => {
        if (isLoggedIn) {
            navigation.navigate("planCalendarPage");
        } else {
            navigation.navigate("loginPage");
        }
    };

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

    const reservation = () => (
        <SafeAreaView style={styles.reserContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>예약 등록</Text>
                <Text style={styles.subtitle}>(선택)</Text>
            </View>

            {reservations.map((reservation) => (
                <View key={reservation.id} style={styles.card}>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{reservation.name}</Text>
                        <TouchableOpacity onPress={() => handleDelete(reservation.id)} style={styles.deleteButton}>
                            <MaterialIcons name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.cardDetail}>예약날짜: {reservation.date}</Text>
                    <Text style={styles.cardDetail}>예약시간: {reservation.time}</Text>
                </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={handleAddReservation}>
                <MaterialIcons name="add" size={40} color="#888" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setDropdownVisible(!dropdownVisible)} // Toggle dropdown visibility
                    >
                        <Text style={styles.dropdownText}>{selectedPlaceName || '예약장소를 선택해주세요'}</Text>
                    </TouchableOpacity>

                    {dropdownVisible && (
                        <FlatList
                            data={availablePlaces}
                            renderItem={renderPlaceItem}
                            keyExtractor={(item) => item.name}
                            style={styles.dropdownList}
                        />
                    )}

                    <TextInput
                        placeholder="예약 날짜(예: 2024.11.13)"
                        value={reservationDate}
                        onChangeText={setReservationDate}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="예약 시간 (예: 10:00)"
                        value={reservationTime}
                        onChangeText={setReservationTime}
                        style={styles.input}
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveReservation}>
                        <Text style={styles.saveButtonText}>등록</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {reservation()}
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
    box: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
    },
    selectedBox: {
        borderColor: 'blue',
        backgroundColor: 'lightblue',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: '#FAFAFA',
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
    reserContainer: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        marginLeft: 10,
        fontSize: 16,
        color: '#888',
    },
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 8,
    },
    cardDetail: {
        marginTop: 8,
        fontSize: 16,
        color: '#555',
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
})
