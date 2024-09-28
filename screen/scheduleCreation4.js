import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    TextInput,
    Modal,
    Alert,
    Image,
    ScrollView, Keyboard
} from 'react-native';
import {FontAwesome, Entypo, Ionicons, Feather, AntDesign} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const categories = [
    { id: null, name: '전체' },
    { id: 12, name: '관광지' },
    { id: 14, name: '문화시설' },
    { id: 15, name: '축제공연행사' },
    { id: 28, name: '레포츠' },
    { id: 38, name: '쇼핑' },
    { id: 39, name: '음식점' }
];

// 장소 추가 모달 컴포넌트
const AddPlaceModal = ({ visible, onClose, onAdd }) => {
    const [placeName, setPlaceName] = useState('');
    const [placeAddress, setPlaceAddress] = useState('');

    const apiKey = '9d8d1da9d46b7a0f17fa3c65c7654597';

    const handleAddPlace = async () => {
        const url = `https://dapi.kakao.com/v2/local/search/address.json?query==${placeAddress}`;

        if (!placeName.trim() || !placeAddress.trim()) {
            Alert.alert('오류', '장소 이름과 주소를 입력해주세요.');
            return;
        }

        try{
            const response = await axios.get(url, {
                headers: {
                    Authorization: `KakaoAK ${apiKey}`,
                },
            });

            if(response.data.documents.length==0){
                Alert.alert('오류', '존재하지 않는 주소입니다.');
                return;
            }

            const data = response.data.documents[0];
            console.log(data);

            const newPlace = {
                id: Date.now(),
                name: placeName,
                addr: placeAddress,
                firstimage: null,
                contentid: `0`, // 고유 ID 생성
                contenttypeid: "12",
                cat3: "A01",
                open_time: "09:00",
                close_time: "18:00",
                reservation: null,
                visit_duration: 2,
                lat: data.y, // 수동 추가이므로 좌표는 null로 설정
                lng: data.x // 수동 추가이므로 좌표는 null로 설정
            };

            onAdd(newPlace);
            onClose();
            setPlaceName('');
            setPlaceAddress('');

        }catch (e) {
            console.error(e);
        }


    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.addModal}>
                    <TouchableOpacity onPress={onClose} style={styles.detailModalCloseButton}>
                        <Entypo name="cross" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.addModalTitle}>직접 장소 추가</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="장소 이름"
                        value={placeName}
                        onChangeText={setPlaceName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="장소 주소"
                        value={placeAddress}
                        onChangeText={setPlaceAddress}
                    />
                    <TouchableOpacity
                        style={styles.addModalButton}
                        onPress={handleAddPlace}
                    >
                        <Text style={styles.addModalButtonText}>추가</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const DetailModal = ({ visible, onClose, item, onAdd, itemInfo }) => {
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
                    {itemInfo && itemInfo.firstimage && itemInfo.firstimage.length > 0 && (
                        <Image source={{ uri: itemInfo.firstimage }} style={styles.itemImg} />
                    )}
                    <Text style={styles.detailModalTitle}>{itemInfo?.title}</Text>
                    <Text style={styles.detailModalDescription}>{itemInfo?.addr1} {itemInfo?.addr2}</Text>
                    <ScrollView style={styles.overviewContainer}>
                        <Text style={styles.overview}>{itemInfo?.overview}</Text>
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.detailModalButton}
                        onPress={() => onAdd(item)}
                    >
                        <Text style={styles.detailModalButtonText}>계획에 추가하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function ScheduleCreation4({ route }) {
    const API_KEY = "q9%2BtR1kSmDAYUNoOjKOB3vkl1rLYVTSEVfg4sMDG2UYDAL4KiJo5GaFq9nfn%2FdUnUFjK%2FrOY3UfgJvHtOBAEmQ%3D%3D";
    const navigation = useNavigation();

    const [userInfo] = useState(route.params.userInfo);
    const [placeList, setPlaceList] = useState(null);
    const scheduleInfo = route.params.scheduleInfo;

    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [identifier, setIdentifier] = useState(1);

    const [searchQuery, setSearchQuery] = useState('');
    const [queryToSearch, setQueryToSearch] = useState('');

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemInfo, setSelectedItemInfo] = useState(null);

    const [showSelectedPlaces, setShowSelectedPlaces] = useState(true); // 리스트 보이기/숨기기 상태
    const [addModalVisible, setAddModalVisible] = useState(false);
    useEffect(() => {
        const fetchPlace = async () => {
            if (queryToSearch.trim() === '') return;

            try {
                const categoryParam = selectedCategory ? `&contentTypeId=${selectedCategory}` : '';
                const totalResponso = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=10&listYN=N&arrange=A&keyword=${queryToSearch}&areaCode=5${categoryParam}&_type=JSON`);
                const totalCount = totalResponso.data.response.body.items.item[0].totalCnt;

                const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=${totalCount}&listYN=Y&arrange=A&keyword=${queryToSearch}&areaCode=5${categoryParam}&_type=JSON`);
                const items = response.data.response.body.items.item;
                console.log(items, "adsfasdf=============")
                const placeItem = items?items.filter(item =>
                    ['12', '14', '15', '28', '38', '39'].includes(item.contenttypeid)
                ) : null;

                // 필터링된 데이터를 setPlaceList에 설정
                setPlaceList(placeItem);
            } catch (error) {
                console.log('tour API error', error);
            }
        };
        fetchPlace();
    }, [queryToSearch, selectedCategory]);

    const handleScheduleInfoPress = () => {
        if (selectedPlaces.length === 0) {
            Alert.alert('', '장소를 선택해주세요.');
            return;
        }

        console.log(selectedPlaces)

        const updateScheduleInfo = { ...scheduleInfo, selectedPlaces: selectedPlaces };
        navigation.navigate('ScheduleCreation5', { scheduleInfo: updateScheduleInfo, userInfo: userInfo });
    };

    const formatAddr = (addr1, addr2) => addr1.concat(' ', addr2);

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

        if(!timeString){
            return { open_time: "09:00", close_time: "20:00" };
        }

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

            console.log("id확인", identifier)

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
        navigation.navigate(isLoggedIn ? "planCalendarPage" : "loginPage");
    };

    const renderHeader = () => (
        <View style={[styles.center_row, styles.headerContainer]}>
            <View style={{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
                <TouchableOpacity style={[styles.center_row, { marginLeft: '12%' }]} onPress={() => navigation.goBack()}>
                    <Entypo name="chevron-thin-left" size={14} color="black" />
                    <Text style={{ fontSize: 14, marginLeft: '5%' }}>이전</Text>
                </TouchableOpacity>
            </View>
            <View style={{ width: '40%', height: '100%' }}></View>
            <View style={{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' }}>
                <TouchableOpacity style={[styles.center_row, { marginRight: '12%' }]} onPress={handleScheduleInfoPress}>
                    <Text style={{ fontSize: 14, marginRight: '5%' }}>다음</Text>
                    <Entypo name="chevron-thin-right" size={14} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );

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

    const renderTitle = () => (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ alignItems: 'center', width: '100%', height: 80 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{scheduleInfo.plan_name}</Text>
                <Text style={{ fontSize: 16 }}>{formatDate(scheduleInfo.dateRange[0])}-{formatDate(scheduleInfo.dateRange[1])}</Text>
            </View>
            {renderContent()}
        </View>
    );

    const handleSearch = () => {
        Keyboard.dismiss();
        setQueryToSearch(searchQuery);
    };

    const handleSubmitEditing = () => {
        handleSearch();
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory((prevCategory) => prevCategory === category ? null : category);
    };

    const getItemInfo = async (item) => {
        try {
            const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&contentId=${item.contentid}&defaultYN=Y&_type=JSON&firstImageYN=Y&addrinfoYN=Y&overviewYN=Y&mapinfoYN=Y`);
            const data = response.data.response.body.items.item[0];
            setSelectedItemInfo(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDetailButtonPress = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
        getItemInfo(item);
    };

    const handleAddToSchedule = (item) => {
        handleSelect(item);
        setShowDetailModal(false);
        setSelectedItemInfo(null);
    };

    const toggleSelectedPlaces = () => {
        setShowSelectedPlaces(!showSelectedPlaces);
    };

    const handleRemovePlace = (item) => {
        setSelectedPlaces((prevSelected) =>
            prevSelected.filter((place) => place.contentid !== item.contentid)
        );
    };

    const addBtn = () =>{
        setAddModalVisible(true);
    }




    const renderContent = () => (
        <View style={{ flex: 1, padding: 10 }}>
            <View style={{ flexDirection: 'row', width: '100%', height: 80 }}>
                <TextInput
                    style={{
                        flex: 1,
                        height: 40,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 35,
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
                        backgroundColor: 'black',
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderRadius: 7,
                        height: 40,
                    }}
                    onPress={handleSearch}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>검색</Text>
                </TouchableOpacity>
            </View>

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
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={()=>addBtn()}
                >
                    <Text style={[
                        {color: '#2ab7c1', fontWeight: "400"}
                    ]}>
                        + 직접추가
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                style={{ width: '100%', flex: 1 }}
                data={placeList}
                keyExtractor={(item) => item.contentid}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        {item.firstimage ? (<Image source={{ uri: item.firstimage }} style={styles.resultImage} />):(
                            // 나중에 이미지 바꾸기
                            <Image source={require("../assets/logo.png")} style={styles.resultImage} />
                        )}

                        <View style={styles.itemContent}>
                            <Text style={{ fontSize: 18 }}>{item.title}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: 'black',
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        borderRadius: 5,
                                        marginRight: 10,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text style={{ color: '#fff', fontSize: 12 }}>
                                        {selectedPlaces.some(place => place.contentid === item.contentid) ? '삭제' : '추가'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: 'black',
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        borderRadius: 5,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => handleDetailButtonPress(item)}
                                >
                                    <Text style={{ color: '#fff', fontSize: 12 }}>상세보기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />

            <View style={{borderTopRightRadius: 30, borderTopLeftRadius: 30, borderColor: '#808080', borderTopWidth: 1, borderRightWidth: 1, borderLeftWidth: 1, backgroundColor: '#F6F6F6', marginLeft: -10, marginRight: -10, marginBottom: -10, maxHeight: '50%'}}>
                {/* 추가된 장소 목록을 보이거나 숨기는 버튼 */}
                <TouchableOpacity onPress={toggleSelectedPlaces} style={[styles.toggleButton]}>
                    <View style={{alignItems: 'center',}}>
                        <FontAwesome
                            name={showSelectedPlaces ? "caret-down" : "caret-up"} // 상태에 따라 아이콘 변경
                            size={24} // 아이콘 크기
                            color="black" // 아이콘 색상
                        />
                    </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start'}}>
                    {/* FontAwesome 아이콘 추가 */}
                    <Text style={{fontSize: 16, fontWeight: 'bold', marginRight: '2%', marginLeft: '5%'}}>
                        선택한 장소
                    </Text>
                    {/* 개수 표시 원 추가 */}
                    <View style={{backgroundColor: 'black', width: 22, height: 22, borderRadius: 50, alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 12}}>{selectedPlaces.length}</Text>
                    </View>
                </View>

                <View style={{alignItems: 'center'}}>
                    {showSelectedPlaces && (
                        <View style={{
                            padding: 10,
                            backgroundColor: '#f9f9f9',
                            borderRadius: 10,
                            width: '95%',
                        }}>
                            <FlatList
                                style={{ maxHeight: '90%' }} // 최대 높이 설정
                                data={selectedPlaces}
                                keyExtractor={(item) => item.contentid.toString()}
                                renderItem={({ item }) => (
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: '#ffffff', // 하얀 박스 배경색
                                        padding: 15,
                                        marginTop: '1%',
                                        marginBottom: 10, // 아이템 간 간격
                                        borderRadius: 8, // 모서리 둥글게
                                        shadowColor: '#000', // 그림자 색상
                                        shadowOffset: { width: 0, height: 2 }, // 그림자 오프셋
                                        shadowOpacity: 0.1, // 그림자 투명도
                                        shadowRadius: 4, // 그림자 반경
                                        elevation: 2, // 안드로이드 그림자
                                    }}>
                                        <Text style={{
                                            fontSize: 15,
                                            fontWeight: "500",
                                            color: '#333',
                                            flex: 1, // flex를 1로 설정하여 공간 확보
                                            marginRight: 10, // 삭제 버튼과의 간격
                                            overflow: 'hidden', // 텍스트가 넘어갈 경우 숨김
                                            textOverflow: 'ellipsis', // 생략 표시 (...) 적용 (웹에서만 적용, React Native에서는 효과가 없음)
                                            whiteSpace: 'nowrap', // 줄 바꿈 하지 않음 (웹에서만 적용, React Native에서는 효과가 없음)
                                        }}>
                                            {item.name}
                                        </Text>
                                        <TouchableOpacity
                                            style={{
                                                paddingVertical: 6, // 세로 여백
                                                paddingHorizontal: 10, // 가로 여백
                                                borderRadius: 5, // 모서리 둥글게
                                            }}
                                            onPress={() => handleRemovePlace(item)}
                                        >
                                            <AntDesign name="closesquare" size={22} color="black" />
                                            {/*<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>삭제</Text>*/}
                                        </TouchableOpacity>
                                    </View>
                                )}
                                ListEmptyComponent={<Text style={{
                                    textAlign: 'center',
                                    color: '#999',
                                    fontSize: 14,
                                    marginTop: 10,
                                    marginBottom: 10,
                                }}>선택된 장소가 없습니다.</Text>}
                            />
                        </View>
                    )}
                </View>
            </View>
            <DetailModal
                visible={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                item={selectedItem}
                onAdd={handleAddToSchedule}
                itemInfo={selectedItemInfo}
            />

            {/* 직접 추가 모달 */}
            <AddPlaceModal
                visible={addModalVisible}
                onClose={() => setAddModalVisible(false)}
                onAdd={(newPlace) => setSelectedPlaces((prev) => [...prev, newPlace])}
            />
        </View>
    );

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

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderTitle()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dddddd',
    },
    resultImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        marginRight: 20,
    },
    itemContent: {
        flex: 1,
        justifyContent: 'center',
    },
    selectedContainer: {
        marginTop: 10,
        padding: 10,
        borderRadius: 10,
        maxHeight:'100%'
    },
    selectedItemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
    },
    selectedText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
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
        flexDirection    : 'row',
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
        justifyContent: 'center',
        alignItems: 'center'
    },
    categoryButton: {
        backgroundColor: '#eaf6f6',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginRight: 10,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginRight: 10,
        marginBottom: 10,
        borderColor: '#2ab7c1',
        borderWidth: 1,
    },
    selectedCategoryButton: {
        backgroundColor: '#000000',
    },
    categoryText: {
        color: '#2ab7c1',
        fontWeight: "400"
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    detailModal: {
        width: '80%',
        height: 500,
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
        color: '#686868',
    },
    overviewContainer: {
        flex: 1, // 스크롤뷰가 모달의 나머지 공간을 차지하도록 설정
    },
    overview: {
        fontSize: 14,
        color: '#444',
    },
    detailModalButton: {
        backgroundColor: 'black',
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
    itemImg: {
        width: 100,
        height: 100,
    },
    toggleButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    toggleButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    removePlace:{
        backgroundColor:'#ff3b30',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addModal: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    addModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    addModalButton: {
        backgroundColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginTop: 10,
        alignSelf: 'center',
    },
    addModalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

