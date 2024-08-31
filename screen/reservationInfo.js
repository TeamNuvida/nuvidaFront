import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign, MaterialIcons, Entypo, FontAwesome, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import axios from "axios";
import { Linking } from 'react-native';

const ReservationInfo = ({ route }) => {
    const navigation = useNavigation();

    const API_KEY = "q9%2BtR1kSmDAYUNoOjKOB3vkl1rLYVTSEVfg4sMDG2UYDAL4KiJo5GaFq9nfn%2FdUnUFjK%2FrOY3UfgJvHtOBAEmQ%3D%3D";


    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    // 일정 식별자
    const plan_seq = route.params.plan_seq;
    const planInfo = route.params.planInfo;
    const routeList = route.params.routeList;
    const isLeader = route.params.isLeader;

    const [accommodation,setAccommodation] = useState(null);
    const [transportaions, setTransportations] = useState(null);
    const [reservations, setReservations] = useState(null);

    const localhost = "54.180.146.203";

    const options = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul'};
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
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [currentPlace, setCurrentPlace] = useState(null);
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [timeModalVisible, setTimeModalVisible] = useState(false);
    const [placeList, setPlaceList] = useState([]);

    // New state for dropdown selection
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);

    const getReser = async () => {
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/getReser`, {
                plan_seq: plan_seq,
            });
            setReservations(response.data)

        }catch (e) {
            console.error(e)
        }
    }

    const getAcc = async () =>{
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/getAcc`, {
                plan_seq: plan_seq,
            });
            setAccommodation(response.data)

        }catch (e) {
            console.error(e)
        }
    }

    const getTrans = async () =>{
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/getTrans`, {
                plan_seq: plan_seq,
            });
            setTransportations(response.data)

        }catch (e) {
            console.error(e)
        }
    }

    useFocusEffect(
        useCallback(() => {
            getReser();
            getAcc();
            getTrans();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, []) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
    );

    const handleAddItem = async () => {
        if (selectedPlace && newItemDate && newItemStartTime) {
            const year = newItemDate.getFullYear();
            const month = String(newItemDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1이 필요
            const day = String(newItemDate.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            const date = `${formattedDate} ${newItemStartTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' })}`;


            try{
                const response = await axios.post(`http://${localhost}:8090/nuvida/setReser`, {
                    route_seq:selectedPlace.route_seq,
                    reser_dt:date
                });
                getReser();
            }catch (e) {
                console.error(e)
            }finally {
                resetScheduleModal();
            }

        } else {
            alert("장소, 날짜, 예약 시간을 입력하세요.");
        }
    };

    const handleAddTicket = async () => {
        if (newTicketTitle && newTicketDate && newTicketTime) {
            const year = newTicketDate.getFullYear();
            const month = String(newTicketDate.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1이 필요
            const day = String(newTicketDate.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            const date = `${formattedDate} ${newTicketTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' })}`;


            try{
                const response = await axios.post(`http://${localhost}:8090/nuvida/setTrans`, {
                    plan_seq: plan_seq,
                    tr_name:newTicketTitle,
                    tr_dt:date
                });
                getTrans();

            }catch (e) {
                console.error(e)
            }finally {
                resetTicketModal();
            }

        } else {
            alert("티켓 정보(교통편, 날짜, 시간)를 입력하세요.");
        }
    };

    const resetScheduleModal = () => {
        setSelectedPlace(null);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
        const formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(date);
        return formattedDate.replace(/\./g, '. ');
    };

    const formatTime = (reserDt) => {
        // 시간 부분만 추출
        const timePart = reserDt.split(' ')[1]; // "10:30:00"

        // 시간과 분을 분리
        const [hour, minute] = timePart.split(':');

        // 결과 생성
        let formattedTime;
        if (minute === '00') {
            formattedTime = `${hour}시`;
        } else {
            formattedTime = `${hour}시 ${minute}분`;
        }
        return formattedTime;
    }

    const formatReserDt = (reserDt) =>{

        // 문자열을 Date 객체로 변환
        const dateObj = new Date(reserDt);

        // 날짜를 원하는 형식으로 변환
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' };
        const formattedDate = dateObj.toLocaleDateString('ko-KR', options);
        return formattedDate;
    }

    const handlePlaceSelect = (place) => {
        setCurrentPlace(place);
        setSearchModalVisible(false);
        setTimeModalVisible(true);
    };

    const fetchPlace = async () => {
        if (searchQuery.trim() === '') return;

        try {

            const totalResponso = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=10&listYN=N&arrange=A&keyword=${searchQuery}&areaCode=5&contentTypeId=32&_type=JSON`);
            const totalCount = totalResponso.data.response.body.items.item[0].totalCnt;


            const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=${totalCount}&listYN=Y&arrange=A&keyword=${searchQuery}&areaCode=5&contentTypeId=32&_type=JSON`);

            // const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}&MobileApp=NUVIDA&MobileOS=AND&pageNo=1&numOfRows=10&listYN=Y&arrange=A&keyword=${searchQuery}&areaCode=5&contentTypeId=32&_type=JSON`);
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

    const formatAddr = (addr1, addr2) => {
        return addr1.concat(' ', addr2);
    }

    const handleTimeSubmit = async () => {
        const timeFormat = /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}$/;
        if (!timeFormat.test(checkInTime) || !timeFormat.test(checkOutTime)) {
            Alert.alert("시간 형식 오류", "올바른 시간 형식을 입력하세요. (예: 2024.11.13 10:00)");
            return;
        }

        if (currentPlace) {
            const acc_name = currentPlace.title;
            const acc_addr = formatAddr(currentPlace.addr1, currentPlace.addr2);
            const check_in = checkInTime;
            const check_out = checkOutTime;
            const lat = currentPlace.mapy;
            const lng = currentPlace.mapx;
            const contentid = currentPlace.contentid;
            const contenttypeid = currentPlace.contenttypeid;

            try{
                const response = await axios.post(`http://${localhost}:8090/nuvida/setAcc`, {
                    plan_seq: plan_seq,
                    acc_name:acc_name,
                    acc_addr:acc_addr,
                    check_in:check_in,
                    check_out:check_out,
                    lat:lat,
                    lng:lng,
                    contentid:contentid,
                    contenttypeid:contenttypeid,

                });
                getAcc();

            }catch (e) {
                console.error(e)
            }
        }

        setCurrentPlace(null);
        setCheckInTime('');
        setCheckOutTime('');
        setTimeModalVisible(false);
    };

    const handleSearch = () => {
        fetchPlace();
    };

    const renderPlaceList = () => {
        return placeList.map((place, index) => (
            <TouchableOpacity key={index} style={styles.placeListItem} onPress={() => handlePlaceSelect(place)}>
                <Text>{place.title}</Text>
            </TouchableOpacity>
        ));
    };

    const handleDropdownSelect = (place) => {
        setSelectedPlace(place);
        setShowDropdown(false);
    };

    const delTrans = async (tr_seq) =>{
        console.log(tr_seq)
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/delTrans`, {
                tr_seq: tr_seq,
            });
            getTrans();
        }catch (e) {
            console.error(e)
        }
    }

    const delReser = async (route_seq) => {
        console.log(route_seq)
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/delReser`, {
                route_seq: route_seq,
            });
            getReser();
        }catch (e) {
            console.error(e)
        }
    }

    const delAcc = async (acc_seq) =>{
        console.log(acc_seq)
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/delAcc`, {
                acc_seq: acc_seq,
            });
            getAcc();
        }catch (e) {
            console.error(e)
        }
    }

    const handleNavi = async (item) => {

        const endLat = item.lat; // 목적지 위도
        const endLng = item.lng; // 목적지 경도

        // 카카오맵 길찾기 URL
        const url = `kakaomap://route?ep=${endLat},${endLng}&by=PUBLIC`; // by=FOOT, CAR, PUBLIC 등이 가능합니다.
        const installUrl = 'https://play.google.com/store/apps/details?id=net.daum.android.map';  // 카카오맵 설치 페이지 URL

        try {
            const canOpen = await Linking.canOpenURL(url);
            console.log('Can open URL:', canOpen);

            if (canOpen) {
                await Linking.openURL(url);
            } else {
                Alert.alert(
                    '카카오맵 설치되어 있지 않습니다.',
                    '카카오맵 설치 페이지로 이동하시겠습니까?',
                    [
                        { text: '취소', style: 'cancel' },
                        { text: '확인', onPress: () => Linking.openURL(installUrl) },
                    ]
                );
            }
        } catch (error) {
            console.error('Error launching KakaoNavi:', error);
            Alert.alert('오류 발생', '카카오내비 실행 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    const checkDeletePlan = () =>{
        Alert.alert(
            "삭제 확인",
            "삭제하시겠습니까?",
            [
                { text: "아니요", style: "cancel" },
                { text: "예", onPress: () => deletePlan()}
            ]
        );
    }

    const deletePlan = async () =>{

        if(isLeader){
            console.log("리더 플랜 삭제")
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/delPlanLeader`, {
                    plan_seq: plan_seq
                });
                navigation.navigate("Mypage", {userInfo:userInfo});
            } catch (e) {
                console.error(e)
            }
        }else{
            console.log("멤버 플랜 삭제")
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/delPlanMem`, {
                    plan_seq: plan_seq,
                    user_id:userInfo.user_id
                });
                navigation.navigate("Mypage", {userInfo:userInfo});
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("TripCalendar", {userInfo})}>
                    <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => checkDeletePlan()}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                {planInfo?(<Text style={styles.location}>{planInfo.plan_name}</Text>):
                    (<Text style={styles.location}>광주 여행</Text>)}

                {planInfo?(<Text style={styles.date}>{formatDate(planInfo.start_date)} - {formatDate(planInfo.end_date)}</Text>):
                    (<Text style={styles.date}>2024. 05. 21 (토) - 2024. 05. 23 (월)</Text>)}
            </View>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("TripSchedule", {userInfo:userInfo, plan_seq:plan_seq})}>
                    <Text style={styles.tabText}>여행일정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButtonActive} onPress={()=>navigation.navigate("ReservationInfo", {userInfo:userInfo, plan_seq:plan_seq, planInfo:planInfo, routeList:routeList, isLeader:isLeader})}>
                    <Text style={styles.tabTextActive}>예약정보</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("MemberList", {userInfo:userInfo, plan_seq:plan_seq, planInfo:planInfo, routeList:routeList, isLeader:isLeader})}>
                    <Text style={styles.tabText}>멤버목록</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("Calculate", {userInfo:userInfo, plan_seq:plan_seq, planInfo:planInfo, routeList:routeList, isLeader:isLeader})}>
                    <Text style={styles.tabText}>정산하기</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.reserContainer}>
                    <View style={styles.reserButtonContainer}>
                        {!transportaions || transportaions.length <1?(
                            <View style={styles.transContainer}>
                                <TouchableOpacity style={styles.transButton} onPress={() => setTicketModalVisible(true)}>
                                    <Text style={styles.plusIcon}>+</Text>
                                    <Text style={styles.reserButtonText}>교통편 등록하기</Text>
                                </TouchableOpacity>
                                <View style={styles.margin}></View>
                                <TouchableOpacity style={styles.transButton} onPress={() => setTicketModalVisible(true)}>
                                    <Text style={styles.plusIcon}>+</Text>
                                    <Text style={styles.reserButtonText}>교통편 등록하기</Text>
                                </TouchableOpacity>
                            </View>
                        ):(
                            transportaions.length <2?(
                                <View style={styles.transContainer}>
                                    <View style={styles.transItemButton }>
                                        <View style={styles.transItem }>
                                            <Fontisto name="bus-ticket" size={24} color="black" />
                                            <View style={{paddingHorizontal:8}}></View>
                                            {transportaions[0]&&<Text style={styles.transText}>{transportaions[0].tr_name}</Text>}
                                            <TouchableOpacity onPress={()=>delTrans(transportaions[0].tr_seq)}>
                                                <Entypo name="cross" size={24} color="red" />
                                            </TouchableOpacity>
                                        </View>
                                        {transportaions[0]&&<Text style={styles.transDtText}>{formatReserDt(transportaions[0].tr_dt)} {formatTime(transportaions[0].tr_dt)}</Text>}

                                    </View>
                                    <View style={styles.margin}></View>
                                    <TouchableOpacity style={styles.transButton} onPress={() => setTicketModalVisible(true)}>
                                        <Text style={styles.plusIcon}>+</Text>
                                        <Text style={styles.reserButtonText}>교통편 등록하기</Text>
                                    </TouchableOpacity>
                                </View>
                            ):(
                                <View style={styles.transContainer}>
                                    <View style={styles.transItemButton }>

                                        <View style={styles.transItem }>
                                            <Fontisto name="bus-ticket" size={24} color="black" />
                                            <View style={{paddingHorizontal:8}}></View>
                                            {transportaions[0]&&<Text style={styles.transText}>{transportaions[0].tr_name}</Text>}
                                            <TouchableOpacity onPress={()=>delTrans(transportaions[0].tr_seq)}>
                                                <Entypo name="cross" size={24} color="red" />
                                            </TouchableOpacity>
                                        </View>
                                        {transportaions[0]&&<Text style={styles.transDtText}>{formatReserDt(transportaions[0].tr_dt)} {formatTime(transportaions[0].tr_dt)}</Text>}
                                    </View>
                                    <View style={styles.margin}></View>
                                    <View style={styles.transItemButton }>
                                        <View style={styles.transItem }>
                                            <Fontisto name="bus-ticket" size={24} color="black" />
                                            <View style={{paddingHorizontal:8}}></View>
                                            {transportaions[1]&&<Text style={styles.transText}>{transportaions[1].tr_name}</Text>}
                                            <TouchableOpacity onPress={()=>delTrans(transportaions[1].tr_seq)}>
                                                <Entypo name="cross" size={24} color="red" />
                                            </TouchableOpacity>
                                        </View>
                                        {transportaions[1]&&<Text style={styles.transDtText}>{formatReserDt(transportaions[1].tr_dt)} {formatTime(transportaions[1].tr_dt)}</Text>}
                                    </View>
                                </View>
                            )


                        )}

                        {!accommodation || accommodation.length <1 ? (
                            <TouchableOpacity style={styles.reserButton} onPress={() => setSearchModalVisible(true)}>
                                <Text style={styles.plusIcon}>+</Text>
                                <Text style={styles.reserButtonText}>숙소 등록하기</Text>
                            </TouchableOpacity>
                        ):(
                            <View style={styles.accContainer}>
                                <TouchableOpacity onPress={()=>delAcc(accommodation[0].acc_seq)}>
                                    <Entypo name="cross" size={24} color="red" />
                                </TouchableOpacity>
                                {accommodation[0]&&<Text style={styles.accNameText}>{accommodation[0].acc_name}</Text>}
                                {accommodation[0]&&<Text style={styles.accAddrText}>{accommodation[0].acc_addr}</Text>}
                                {accommodation[0]&&<Text style={styles.accCheckText}>{formatReserDt(accommodation[0].check_in)} {formatTime(accommodation[0].check_in)}</Text>}
                                {accommodation[0]&&<Text style={styles.accCheckText}>{formatReserDt(accommodation[0].check_out)} {formatTime(accommodation[0].check_out)}</Text>}
                                <TouchableOpacity style={styles.naviButton} onPress={()=>handleNavi(accommodation[0])}>
                                    <Text style={styles.naviText}>길찾기</Text>
                                </TouchableOpacity>
                            </View>
                        ) }

                    </View>
                </View>



                <View style={styles.line} />
                <View style={styles.boxContainer}>
                    <Text style={styles.subHeader}>예약 목록</Text>
                    <View style={styles.contentContainer}>
                        <View style={styles.itemList}>
                            {reservations&&reservations.map((item, index) => (
                                <View key={item.route_seq} style={styles.itemBox}>
                                    <TouchableOpacity onPress={()=>delReser(item.route_seq)}>
                                        <Entypo name="cross" size={24} color="red" />
                                    </TouchableOpacity>
                                    <Text style={styles.itemName}>{item.title}</Text>
                                    <Text style={styles.itemDate}>{item.addr}</Text>
                                    <Text style={styles.itemTime}>{formatReserDt(item.reser_dt)} {formatTime(item.reser_dt)}</Text>
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
                        <Text style={styles.modalText}>교통편 추가</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="교통편을 입력하세요"
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
                            <Text>{newTicketTime.toLocaleTimeString([], options)}</Text>
                        </TouchableOpacity>
                        {showTicketTimePicker && (
                            <DateTimePicker
                                value={newTicketTime}
                                mode="time"
                                display="spinner"
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
                        <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(!showDropdown)}>
                            <Text style={styles.dropdownText}>
                                {selectedPlace ? selectedPlace.title : "예약할 장소를 선택해 주세요"}
                            </Text>
                            <AntDesign name="down" size={16} color="black" />
                        </TouchableOpacity>
                        {showDropdown && (
                            <View style={styles.dropdownMenu}>
                                {routeList
                                    .filter(route => !route.reser_dt)
                                    .map(route => (
                                        <TouchableOpacity
                                            key={route.route_seq}
                                            style={styles.dropdownMenuItem}
                                            onPress={() => handleDropdownSelect(route)}
                                        >
                                            <Text>{route.title}</Text>
                                        </TouchableOpacity>
                                    ))}
                            </View>
                        )}
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
                            <Text>{newItemStartTime.toLocaleTimeString([], options)}</Text>
                        </TouchableOpacity>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={newItemStartTime}
                                mode="time"
                                display="spinner"
                                onChange={handleStartTimeChange}
                            />
                        )}
                        {/*<TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.input}>*/}
                        {/*    <Text>{newItemEndTime.toLocaleTimeString()}</Text>*/}
                        {/*</TouchableOpacity>*/}
                        {/*{showEndTimePicker && (*/}
                        {/*    <DateTimePicker*/}
                        {/*        value={newItemEndTime}*/}
                        {/*        mode="time"*/}
                        {/*        display="spinner"*/}
                        {/*        onChange={handleEndTimeChange}*/}
                        {/*    />*/}
                        {/*)}*/}
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

    reserContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    reserButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    transContainer:{
        width: '48%',
    },
    margin:{
        padding:10
    },
    transButton:{
        height: 90,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transItemButton:{
        height: 90,
        backgroundColor: '#aeccf3',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transItem:{
        flexDirection: 'row', // 자식 요소를 왼쪽에서 오른쪽으로 배치
        alignItems: 'center',
        justifyContent: 'space-between', // 공간을 균등하게 분배하여 배치
        alignSelf:"flex-start",
        paddingLeft:"10%"
    },
    reserButton: {
        width: '48%',
        height: 200,
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

    plusIcon: {
        fontSize: 30,
        color: '#888',
    },
    reserButtonText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    transText:{
        fontSize: 15,
        color: '#333',
        alignSelf:"flex-end",
        fontWeight:"bold",
        paddingRight:"10%"
    },
    transDtText:{
        fontSize: 11,
        color: '#333',
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
    accContainer: {
        width: '48%',
        height: 200,
        backgroundColor: '#fba1a1',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    accNameText:{
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        fontWeight:"bold",
    },
    accAddrText:{
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    accCheckText:{
        marginTop: 10,
        fontSize: 12,
        color: '#333',
    },
    dropdown: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#959595',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
    },
    dropdownMenu: {
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#959595',
        borderRadius: 5,
        marginBottom: 10,
    },
    dropdownMenuItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#959595',
    },
    naviButton:{
        width: "30%",
        height: "15%",
        borderRadius: 5,
        backgroundColor: '#f35353',
        alignItems:"center",
    },
    naviText:{
        fontWeight:"bold"
    },

});

export default ReservationInfo;
