import React, { useState, useEffect } from 'react';
import {StyleSheet, Text, View, TouchableOpacity, SafeAreaView, FlatList, TextInput, Modal, Alert} from 'react-native';
import { FontAwesome, Entypo, Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const categories = [
    { id: 12, name: '관광지' },
    { id: 14, name: '문화시설' },
    { id: 15, name: '축제공연행사' },
    { id: 28, name: '레포츠' },
    { id: 38, name: '쇼핑' },
    { id: 39, name: '음식점' }
];



const DetailModal = ({ visible, onClose, item, onAdd }) => {

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.detailModal}>
                    <TouchableOpacity onPress={onClose} style={styles.detailModalCloseButton}>
                        <Entypo name="cross" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.detailModalTitle}>{item?.title}</Text>
                    <Text style={styles.detailModalDescription}>{item?.addr1} {item?.addr2}</Text>
                    {/*<Text style={styles.detailModalDescription}>{detail?detail:"설명이 없습니다."}</Text>*/}
                    <TouchableOpacity
                        style={styles.detailModalButton}
                        onPress={() => onAdd(item)}
                    >
                        <Text style={styles.detailModalButtonText}>Add to Schedule</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function ScheduleCreation4({ route }) {
    const API_KEY = "q9%2BtR1kSmDAYUNoOjKOB3vkl1rLYVTSEVfg4sMDG2UYDAL4KiJo5GaFq9nfn%2FdUnUFjK%2FrOY3UfgJvHtOBAEmQ%3D%3D";
    const navigation = useNavigation();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    const [loading, setLoading] = useState(true);
    const [placeList, setPlaceList] = useState(null);
    const scheduleInfo = route.params.scheduleInfo;

    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [identifier, setIdentifier] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [queryToSearch, setQueryToSearch] = useState('');

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);


    useEffect(() => {
        const fetchPlace = async () => {
            if (queryToSearch.trim() === '') return;

            try {
                const categoryParam = selectedCategory ? `&contentTypeId=${selectedCategory}` : '';
                const totalResponso = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=10&listYN=N&arrange=A&keyword=${queryToSearch}&areaCode=5${categoryParam}&_type=JSON`);
                const totalCount = totalResponso.data.response.body.items.item[0].totalCnt;


                const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=${totalCount}&listYN=Y&arrange=A&keyword=${queryToSearch}&areaCode=5${categoryParam}&_type=JSON`);
                const items = response.data.response.body.items.item;
                console.log(items);
                setPlaceList(items);
            } catch (error) {
                console.log('tour API error', error);
            }
        }
        fetchPlace();
    }, [queryToSearch, selectedCategory]);

    const handleScheduleInfoPress = () => {

        if(selectedPlaces.length == 0){
            Alert.alert('','장소를 선택해주세요.');
            return;
        }

        const updateScheduleInfo = { ...scheduleInfo, selectedPlaces: selectedPlaces };
        navigation.navigate('ScheduleCreation5', { scheduleInfo: updateScheduleInfo, userInfo:userInfo });
    }

    const formatAddr = (addr1, addr2) => {
        return addr1.concat(' ', addr2);
    }

    const getTime = (data, item) =>{
        switch (item.contenttypeid) {
            case '39': // 식당
                return data.opentimefood;
            case '15': // 축제
                return data.playtime;
            case '28': // 스포츠
                return data.usetimeleports;
            case '38': // 쇼핑
                return data.opentime;
            case '14': // 문화시설
                return data.usetimeculture;
            default:
                return data.usetime; // 기본 아이콘
        }

    }

    const extractTimes = (timeString) => {
        // 기본 패턴: "HH:MM~HH:MM" 형식의 시간 추출
        const timePattern = /(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})/;

        // 정규식을 이용해 시간 추출
        const match = timeString.match(timePattern);
        if (match) {
            const open_time = match[1];  // 첫 번째 시간 (오픈 시간)
            const close_time = match[2]; // 두 번째 시간 (종료 시간)
            return { open_time, close_time };
        }

        // 패턴이 없을 때 빈 값 반환 (혹은 에러 처리)
        return { open_time: "09:00", close_time: "20:00" };
    }

    const handleSelect = async (item) => {

        try {
            const categoryParam = selectedCategory ? `&contentTypeId=${selectedCategory}` : '';
            const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/detailIntro1?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&contentId=${item.contentid}&contentTypeId=${item.contenttypeid}&_type=JSON`);
            const data = response.data.response.body.items.item[0];

            // 식당이면 opentimefood
            // 관광지면 usetime
            // 문화시설 usetimeculture
            // 축제공연행사 playtime
            // 여행코스
            // 레포츠 usetimeleports
            // 쇼핑 opentime
            const time = getTime(data,item)


            const { open_time, close_time } = extractTimes(time);

            const selectedItem = {
                id: identifier,
                name: item.title,
                addr: formatAddr(item.addr1, item.addr2),
                firstimage: item.firstimage,
                contentid: item.contentid,
                contenttypeid: item.contenttypeid,
                cat3: item.cat3,
                open_time: open_time,
                close_time: close_time,
                reservation: null,
                visit_duration: 2,
                lat: item.mapy,
                lng: item.mapx
            };

            setSelectedPlaces((prevSelected) => {
                if (prevSelected.some(place => place.contentid === selectedItem.contentid)) {
                    return prevSelected.filter((place) => place.contentid !== selectedItem.contentid);
                } else {
                    setIdentifier(prevIdentifier => prevIdentifier + 1);
                    return [...prevSelected, selectedItem];
                }
            });

        } catch (error) {
            console.log('tour API error', error);
        }



    };

    const handlePlanCalendarIconPress = () => {
        if (isLoggedIn) {
            navigation.navigate("planCalendarPage");
        } else {
            navigation.navigate("loginPage");
        }
    };

    const renderHeader = () => {
        return (
            <View style={[styles.center_row, styles.headerContainer]}>
                <View style={{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
                    <TouchableOpacity style={[styles.center_row, { marginLeft: '12%' }]} onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={14} color="black" />
                        <Text style={{ fontSize: 14, marginLeft: '5%' }}>이전</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: '40%', height: '100%' }}>
                </View>
                <View style={{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end', }}>
                    <TouchableOpacity style={[styles.center_row, { marginRight: '12%' }]} onPress={() => handleScheduleInfoPress()}>
                        <Text style={{ fontSize: 14, marginRight: '5%' }}>다음</Text>
                        <Entypo name="chevron-thin-right" size={14} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);

        const padNumber = (num) => (num < 10 ? `0${num}` : num);
        const getDayOfWeek = (date) => {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return days[date.getDay()];
        };
        const year = date.getFullYear();
        const month = padNumber(date.getMonth() + 1);
        const day = padNumber(date.getDate());
        const dayOfWeek = getDayOfWeek(date);
        return `${year}. ${month}. ${day} (${dayOfWeek})`;
    };

    const renderTitle = () => {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', }}>
                <View style={{ alignItems: 'center', width: '100%', height: 80 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{scheduleInfo.plan_name}</Text>
                    <Text style={{ fontSize: 16 }}>{formatDate(scheduleInfo.dateRange[0])}-{formatDate(scheduleInfo.dateRange[1])}</Text>
                </View>
                {renderContent()}
            </View>
        );
    };

    const handleSearch = () => {
        setQueryToSearch(searchQuery);
        console.log('검색어:', searchQuery);
    };

    const handleSubmitEditing = () => {
        handleSearch();
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory((prevCategory) => prevCategory === category ? null : category);
    };

    const handleDetailButtonPress = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
    };

    const handleAddToSchedule = (item) => {
        handleSelect(item);
        setShowDetailModal(false);
    };

    const renderContent = () => {
        return (
            <View style={{ flex: 1, padding: 10 }}>
                <View style={{ flexDirection: 'row', width: '100%', height: 80, marginBottom: 10 }}>
                    <TextInput
                        style={{
                            flex: 1,
                            height: 40,
                            borderColor: '#ccc',
                            borderWidth: 1,
                            borderRadius: 5,
                            paddingHorizontal: 10,
                            marginRight: 10,
                        }}
                        placeholder="검색어를 입력하세요..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSubmitEditing}
                        returnKeyType="search"
                    />
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#007bff',
                            paddingVertical: 10,
                            paddingHorizontal: 15,
                            borderRadius: 5,
                            height: 40,
                        }}
                        onPress={handleSearch}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>검색</Text>
                    </TouchableOpacity>
                </View>

                {/* Render category buttons */}
                <View style={styles.categoryContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.id ? styles.selectedCategoryButton : null
                            ]}
                            onPress={() => handleCategorySelect(category.id)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category.id ? { color: '#fff' } : null
                            ]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <FlatList
                    style={{ width: '100%', flex: 1 }}
                    data={placeList}
                    keyExtractor={(item) => item.contentid}
                    renderItem={({ item }) => (
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: '#ccc',
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 18 }}>{item.title}</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#007bff',
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        borderRadius: 5,
                                        marginRight: 10,
                                    }}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                        {selectedPlaces.some(place => place.contentid === item.contentid) ? 'Remove' : 'Add'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#007bff',
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        borderRadius: 5,
                                    }}
                                    onPress={() => handleDetailButtonPress(item)}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Detail</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
                <View style={styles.selectedContainer}>
                    <FlatList
                        data={selectedPlaces}
                        keyExtractor={(item) => item.contentid.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.selectedItemContainer}>
                                <Text style={styles.selectedText}>{item.name}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.noSelectionText}>선택된 장소가 없습니다.</Text>}
                    />
                </View>

                <DetailModal
                    visible={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    item={selectedItem}
                    onAdd={handleAddToSchedule}
                />
            </View>
        );
    };

    const renderTabBar = () => {
        return (
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
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderTitle()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    item: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    title: {
        fontSize: 18,
    },
    selectedItem: {
        backgroundColor: '#e0e0e0',
    },
    selectedContainer: {
        flex: 1,
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
    },
    selectedItemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectedText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    noSelectionText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
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
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    categoryButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginRight: 10,
        marginBottom: 10,
    },
    selectedCategoryButton: {
        backgroundColor: '#007bff',
    },
    categoryText: {
        color: '#000',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    detailModal: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    detailModalCloseButton: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    detailModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailModalDescription: {
        marginVertical: 10,
    },
    detailModalButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    detailModalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
