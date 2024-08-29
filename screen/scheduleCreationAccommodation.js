import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Entypo, Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

export default function ScheduleCreationAccommodation({ route }) {
    const API_KEY = "q9%2BtR1kSmDAYUNoOjKOB3vkl1rLYVTSEVfg4sMDG2UYDAL4KiJo5GaFq9nfn%2FdUnUFjK%2FrOY3UfgJvHtOBAEmQ%3D%3D";
    const navigation = useNavigation();
    const userInfo = route.params.userInfo;

    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [placeList, setPlaceList] = useState([]);
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [currentPlace, setCurrentPlace] = useState(null);
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');

    const scheduleInfo = route.params.scheduleInfo;

    const fetchPlace = async () => {
        if (searchQuery.trim() === '') return;

        try {
            const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=10&listYN=Y&arrange=A&keyword=${searchQuery}&areaCode=5&contentTypeId=32&_type=JSON`);
            const items = response.data?.response?.body?.items?.item;
            console.log(response);

            if (items && items.length > 0) {
                setPlaceList(items);
            } else {
                setPlaceList([]);
            }
        } catch (error) {
            console.log('tour API error', error);
            setPlaceList([]);
        }
    };

    const handlePlaceSelect = (place) => {
        setCurrentPlace(place);
        setSearchModalVisible(false);
        setTimeModalVisible(true);
    };

    const formatAddr = (addr1, addr2) => {
        return addr1.concat(' ', addr2);
    }

    const handleTimeSubmit = () => {
        const timeFormat = /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}$/;
        if (!timeFormat.test(checkInTime) || !timeFormat.test(checkOutTime)) {
            Alert.alert("시간 형식 오류", "올바른 시간 형식을 입력하세요. (예: 2024.11.13 10:00)");
            return;
        }

        if (currentPlace) {
            setSelectedPlaces([...selectedPlaces, { ...currentPlace, checkInTime, checkOutTime }]);
        }
        setCurrentPlace(null);
        setCheckInTime('');
        setCheckOutTime('');
        setTimeModalVisible(false);
    };

    const handleRemovePlace = (index) => {
        const updatedPlaces = selectedPlaces.filter((_, i) => i !== index);
        setSelectedPlaces(updatedPlaces);
    };

    const handleSearch = () => {
        fetchPlace();
    };

    // 루트 정보 추가
    const handleScheduleInfoPress = () => {
        const accommodation = selectedPlaces.map(place => ({
            acc_name: place.title,
            addr: formatAddr(place.addr1, place.addr2),
            check_in: place.checkInTime,
            check_out: place.checkOutTime,
            lat: place.mapy,
            lng: place.mapx,
            contentid:place.contentid
        }));
        console.log(accommodation);

        const updateScheduleInfo = { ...scheduleInfo, accommodation: accommodation};
        navigation.navigate('ScheduleCreation4', { scheduleInfo: updateScheduleInfo, userInfo:userInfo });
    }

    const renderHeader = () => {
        return (
            <View style={[styles.center_row, styles.headerContainer]}>
                <View style={[{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-start' }]}>
                    <TouchableOpacity style={[styles.center_row, { marginLeft: '12%' }]} onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={14} color="black" />
                        <Text style={{ fontSize: 14, marginLeft: '5%' }}>이전</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: '40%', height: '100%' }}>
                </View>
                <View style={[{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' }]}>
                    <TouchableOpacity style={[styles.center_row, { marginRight: '12%' }]} onPress={() => handleScheduleInfoPress()}>
                        <Text style={{ fontSize: 14, marginRight: '5%' }}>다음</Text>
                        <Entypo name="chevron-thin-right" size={14} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderTabBar = () => (
        <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
                <Entypo name="home" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Calendar')}>
                <FontAwesome name="calendar-check-o" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Game')}>
                <FontAwesome name="gamepad" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Community')}>
                <Ionicons name="chatbubbles-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyPage')}>
                <Feather name="user" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );

    const renderTitle = () => {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center' }}>
                <View style={{ width: '85%', height: 80 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{scheduleInfo.plan_name}</Text>
                    <Text style={{ fontSize: 16 }}>{formatDate(scheduleInfo.dateRange[0])}-{formatDate(scheduleInfo.dateRange[1])}</Text>
                </View>
                {renderContent()}
            </View>
        );
    };

    const renderContent = () => {
        return (
            <View style={{ width: '100%', flex: 1, alignItems: 'center' }}>
                <View style={{ width: '85%', flex: 1 }}>
                    <Text style={{ fontSize: 18 }}>숙소 등록</Text>
                    <ScrollView style={{ width: '100%' }}>
                        {selectedPlaces.length > 0 ? (
                            selectedPlaces.map((place, index) => (
                                <View key={index} style={styles.placeItem}>
                                    <Text style={styles.placeTitle}>{place.title}</Text>
                                    <Text style={styles.placeDetail}>입실시간: {place.checkInTime}</Text>
                                    <Text style={styles.placeDetail}>퇴실시간: {place.checkOutTime}</Text>
                                    <TouchableOpacity onPress={() => handleRemovePlace(index)} style={styles.removeButton}>
                                        <Text style={styles.removeButtonText}>제거</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.noPlaceText}>등록된 숙소가 없습니다.</Text>
                        )}
                    </ScrollView>
                    <TouchableOpacity style={styles.addButton} onPress={() => setSearchModalVisible(true)}>
                        <Text style={styles.addButtonText}>숙소 추가하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderPlaceList = () => {
        return placeList.map((place, index) => (
            <TouchableOpacity key={index} style={styles.placeListItem} onPress={() => handlePlaceSelect(place)}>
                <Text>{place.title}</Text>
            </TouchableOpacity>
        ));
    };

    const formatDate = (date) => {
        // 날짜를 포맷하는 유틸리티 함수
        return new Date(date).toLocaleDateString();
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderTitle()}
            {renderTabBar()}

            {/* 장소 검색 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={searchModalVisible}
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>숙소 검색</Text>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="숙소를 검색하세요..."
                                value={searchQuery}
                                onChangeText={(text) => setSearchQuery(text)}
                            />
                            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                <Text style={styles.searchButtonText}>검색</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.placeListContainer}>
                            {placeList.length > 0 ? (
                                renderPlaceList()
                            ) : (
                                <Text style={{ marginTop: 20 }}>검색 결과 없음</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSearchModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* 시간 입력 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={timeModalVisible}
                onRequestClose={() => setTimeModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>시간 입력</Text>
                        <TextInput
                            style={styles.timeInput}
                            placeholder="입실 시간을 입력하세요. (예: 2024.11.13 10:00)"
                            value={checkInTime}
                            onChangeText={(text) => setCheckInTime(text)}
                        />
                        <TextInput
                            style={styles.timeInput}
                            placeholder="퇴실 시간을 입력하세요. (예: 2024.11.14 10:00)"
                            value={checkOutTime}
                            onChangeText={(text) => setCheckOutTime(text)}
                        />
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={handleTimeSubmit}
                        >
                            <Text style={styles.selectButtonText}>선택 완료</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        maxHeight: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    searchButton: {
        backgroundColor: 'blue',
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    searchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    placeListContainer: {
        width: '100%',
        maxHeight: 300,
    },
    placeListItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    timeInput: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginTop: 10,
    },
    selectButton: {
        backgroundColor: 'green',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    selectButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: 'red',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    placeItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 10,
    },
    placeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    placeDetail: {
        fontSize: 14,
    },
    removeButton: {
        backgroundColor: 'red',
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    removeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noPlaceText: {
        fontSize: 16,
        color: 'gray',
    },
    addButton: {
        backgroundColor: 'blue',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
