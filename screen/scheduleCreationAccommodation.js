import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, SafeAreaView, ScrollView, Alert, Keyboard  } from 'react-native';
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
    const [currentDayRange, setCurrentDayRange] = useState(null);

    const scheduleInfo = route.params.scheduleInfo;

    const fetchPlace = async () => {
        Keyboard.dismiss();

        if (searchQuery.trim() === '') return;


        try {
            const totalResponso = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=10&listYN=N&arrange=A&keyword=${searchQuery}&areaCode=5&contentTypeId=32&_type=JSON`);
            const totalCount = totalResponso.data.response.body.items.item[0].totalCnt;

            const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=${totalCount}&listYN=Y&arrange=A&keyword=${searchQuery}&areaCode=5&contentTypeId=32&_type=JSON`);
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
        const timeFormat = /^\d{2}:\d{2}$/;  // 시간만 입력받도록 변경
        if (!timeFormat.test(checkInTime) || !timeFormat.test(checkOutTime)) {
            Alert.alert("시간 형식 오류", "올바른 시간 형식을 입력하세요. (예: 10:00)");
            return;
        }

        if (currentPlace && currentDayRange !== null) {
            const formattedCheckInTime = `${formatDateSet(currentDayRange.start)} ${checkInTime}`;
            const formattedCheckOutTime = `${formatDateSet(currentDayRange.end)} ${checkOutTime}`;
            setSelectedPlaces([...selectedPlaces, { ...currentPlace, checkInTime: formattedCheckInTime, checkOutTime: formattedCheckOutTime, dayRange: currentDayRange }]);
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

    const renderPlaceContent = (dayRange) => {
        const selectedPlace = selectedPlaces.find(
            (place) => place.dayRange.start.getTime() === dayRange.start.getTime()
        );

        if (selectedPlace) {
            return (
                <View style={styles.placeItemHeader}>
                    <View style={styles.render}>
                        <Text style={styles.placeTitle}>{selectedPlace.title}</Text>
                        <Text style={styles.placeDetail}>입실: {selectedPlace.checkInTime}</Text>
                        <Text style={styles.placeDetail}>퇴실: {selectedPlace.checkOutTime}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemovePlace(selectedPlaces.indexOf(selectedPlace))}>
                        <Entypo name="cross" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <TouchableOpacity style={styles.addButton} onPress={() => { setCurrentDayRange(dayRange); setSearchModalVisible(true); }}>
                    <Entypo name="plus" size={24} color="black" />
                </TouchableOpacity>
            );
        }
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
            contentid: place.contentid,
            dayRange: place.dayRange,
        }));

        const updateScheduleInfo = { ...scheduleInfo, accommodation: accommodation };


        navigation.navigate('ScheduleCreation4', { scheduleInfo: updateScheduleInfo, userInfo: userInfo });
    };

    const getDaysArray = (start, end) => {
        const arr = [];
        let currentDate = new Date(start);
        while (currentDate < new Date(end)) {
            let nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);
            arr.push({ start: new Date(currentDate), end: new Date(nextDate) });
            currentDate = nextDate;
        }
        return arr;
    };

    const daysArray = getDaysArray(scheduleInfo.dateRange[0], scheduleInfo.dateRange[1]);

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

    const renderTitle = () => {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', paddingVertical: 20 }}>
                <View style={[styles.name, { width: '80%', height: '10%', alignItems: 'center', justifyContent: 'center', paddingBottom: 5 }]}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>{scheduleInfo.plan_name}</Text>
                    <Text style={{ fontSize: 14, color: '#888' }}>{formatDate(scheduleInfo.dateRange[0])} - {formatDate(scheduleInfo.dateRange[1])}</Text>
                </View>
                {renderContent()}
            </View>
        );
    };

    const renderContent = () => {
        return (
            <View style={{ width: '100%', flex: 1, alignItems: 'center', backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 }}>
                <View style={{ width: '90%', flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>예약된 숙소</Text>
                    <ScrollView style={{ width: '100%' }}>
                        {daysArray.map((dayRange, index) => (
                            <View key={index} style={styles.placeItem}>
                                <View>
                                    <Text style={styles.placeTitle2}>{formatDate(dayRange.start)} ~ {formatDate(dayRange.end)}</Text>
                                    <View style={styles.placeContentContainer}>
                                        {renderPlaceContent(dayRange)}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
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
        return new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'short',
        });
    };

    const formatDateSet = (date) => {
        return new Date(date).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).replace(/\.\s/g, '.'); // ". "을 "."로 대체
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderTitle()}

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
                                <View style={styles.noResultsContainer}>
                                    <Text style={styles.noResultsText}>"검색 결과 없음"</Text>
                                </View>
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
                            placeholder="입실 시간 (예: 10:00)"
                            value={checkInTime}
                            onChangeText={(text) => setCheckInTime(text)}
                        />
                        <TextInput
                            style={styles.timeInput}
                            placeholder="퇴실 시간 (예: 10:00)"
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
        width: '85%',
        maxHeight: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    searchButton: {
        backgroundColor: '#000000',
        borderRadius: 10,
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
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        marginBottom: 10,
    },
    timeInput: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginTop: 10,
        backgroundColor: '#f8f8f8',
    },
    selectButton: {
        backgroundColor: '#000000',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginTop: 20,
        width: 270,
    },
    selectButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#000000',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginTop: 20,
        paddingHorizontal: 110,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    placeItem: {
        padding: 15,
        marginBottom: 15,
        backgroundColor: '#faf6f6',
        borderRadius: 10,

        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    placeItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    placeTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',

    },
    placeTitle2: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginLeft:20

    },
    placeDetail: {
        fontSize: 14,
        color: '#666',
    },
    removeButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    removeButtonText: {
        fontSize: 16,
        color: '#f44336',
        fontWeight: 'bold',
    },
    noPlaceText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20,
    },
    addButton: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginLeft:20,
        width:'120%'
    },
    addButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noResultsText: {
        margin: 10,
        textAlign: 'center',
        fontSize: 16,
        color: 'gray',
    },
    placeContentContainer: {
        marginTop: 10, // 날짜와 content 사이에 공간을 추가
    },
    render:{
        marginLeft:20
    }

});
