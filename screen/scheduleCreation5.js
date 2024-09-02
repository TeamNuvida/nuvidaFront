import React, { useState } from 'react';
import {
    Modal,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import {
    Entypo,
    FontAwesome,
    Ionicons,
    Feather,
    MaterialIcons,
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ScheduleCreation5({ route }) {
    const navigation = useNavigation();

    const [userInfo] = useState(route.params.userInfo);
    const [reservations, setReservations] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState();
    const [selectedPlaceName, setSelectedPlaceName] = useState('');
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const scheduleInfo = route.params.scheduleInfo;

    const handleScheduleInfoPress = async () => {
        const updatedPlaces = scheduleInfo.selectedPlaces.map((place) => {
            const reservation = reservations.find((res) => res.id === place.id);

            if (reservation) {
                const formattedDateTime = `${reservation.date}T${reservation.time}:00`;
                return {
                    ...place,
                    reservation: formattedDateTime,
                };
            }

            return place;
        });

        scheduleInfo.selectedPlaces = updatedPlaces;
        console.log(updatedPlaces)

        if (scheduleInfo.route === '1') {
            navigation.navigate('ScheduleCreation6', {
                scheduleInfo: scheduleInfo,
                userInfo: userInfo,
            });
        } else {
            navigation.navigate('ScheduleCreation7', {
                scheduleInfo: scheduleInfo,
                userInfo: userInfo,
            });
        }
    };

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
        <TouchableOpacity
            onPress={() => {
                setSelectedPlaceName(item.name);
                setSelectedPlaceId(item.id);
                setDropdownVisible(false);
            }}
        >
            <Text style={styles.placeItem}>{item.name}</Text>
        </TouchableOpacity>
    );

    const availablePlaces = scheduleInfo.selectedPlaces.filter(
        (place) =>
            !reservations.some((reservation) => reservation.id === place.id) &&
            place.reservation === null
    );

    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Entypo name="chevron-thin-left" size={20} color="black" />
                    <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={() => handleScheduleInfoPress()}
                >
                    <Text style={styles.nextButtonText}>다음</Text>
                    <Entypo name="chevron-thin-right" size={20} color="black" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderTabBar = () => (
        <View style={styles.tabBar}>
            <TouchableOpacity
                style={styles.tabItem}
                onPress={() => navigation.navigate('Main')}
            >
                <Entypo name="home" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
                <FontAwesome name="calendar-check-o" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
                <Ionicons name="chatbubbles-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.tabItem}
                onPress={() => navigation.navigate('mypage')}
            >
                <Feather name="user" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );

    const reservation = () => (
        <SafeAreaView style={styles.reservationContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>예약 등록</Text>
                <Text style={styles.subtitle}>(선택)</Text>
            </View>

            <FlatList
                data={reservations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <TouchableOpacity
                                onPress={() => handleDelete(item.id)}
                                style={styles.deleteButton}
                            >
                                <MaterialIcons name="close" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.cardDetail}>
                            예약날짜: {item.date}
                        </Text>
                        <Text style={styles.cardDetail}>
                            예약시간: {item.time}
                        </Text>
                    </View>
                )}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddReservation}
            >
                <MaterialIcons name="add" size={40} color="#333" />
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
                        onPress={() => setDropdownVisible(!dropdownVisible)}
                    >
                        <Text style={styles.dropdownText}>
                            {selectedPlaceName || '예약장소를 선택해주세요'}
                        </Text>
                    </TouchableOpacity>

                    {dropdownVisible && (
                        <FlatList
                            data={availablePlaces}
                            renderItem={renderPlaceItem}
                            keyExtractor={(item) => item.id.toString()}
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

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSaveReservation}
                    >
                        <Text style={styles.saveButtonText}>등록</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setModalVisible(false)}
                    >
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
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginTop:30
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        marginLeft: 5,
        fontSize: 16,
        color: '#333',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nextButtonText: {
        marginRight: 5,
        fontSize: 16,
        color: '#333',
    },
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
    reservationContainer: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginLeft:20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        marginLeft: 10,
        fontSize: 16,
        color: '#888',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    deleteButton: {
        padding: 5,
    },
    cardDetail: {
        marginTop: 8,
        fontSize: 16,
        color: '#555',
    },
    addButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        marginTop:80
    },
    dropdown: {
        width: '100%',
        padding: 10,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownList: {
        width: '100%',
        maxHeight: 200,
        marginBottom: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    placeItem: {
        padding: 10,
        fontSize: 16,
        color: '#555',
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    saveButton: {
        width: '100%',
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    saveButtonText: {
        fontSize: 16,
        color: '#fff',
    },
    cancelButton: {
        width: '100%',
        padding: 10,
        backgroundColor: '#ccc',
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#333',
    },
});

