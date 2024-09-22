import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import {
    Entypo,
    FontAwesome,
    Ionicons,
    Feather,
    MaterialIcons,
    MaterialCommunityIcons,
    FontAwesome5
} from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import axios from "axios";
import { WebView } from 'react-native-webview';
import { Linking } from 'react-native';

const TripSchedule = ({ route }) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    const [mapFoldTF, setMapFoldTF] = useState(true);

    // 일정 식별자
    const plan_seq = route.params.plan_seq;
    const [accommodation,setAccommodation] = useState(null);
    const [planInfo, setPlanInfo] = useState(null);
    const [isLeader, setIsLeader] = useState(false);

    const localhost = "54.180.146.203";

    console.log("plan_seq",plan_seq)

    const [selectedDay, setSelectedDay] = useState('전체');
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);

    const [schedule, setSchedule] = useState({});
    const [routeList, setRouteList] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);


    useEffect(() => {
        // 기존 API 호출 코드가 있다고 가정하고, 여기서 데이터를 가져옵니다.
        const fetchAcc = async () => {
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/getAcc`, {
                    plan_seq: plan_seq,
                });
                setAccommodation(response.data);

                const getPlanInfo = await axios.post(`http://${localhost}:8090/nuvida/getPlanInfo`, {
                    plan_seq: plan_seq,
                });
                setPlanInfo(getPlanInfo.data);

                const getLeader = await axios.post(`http://${localhost}:8090/nuvida/getLeader`, {
                    plan_seq: plan_seq,
                    user_id:userInfo.user_id
                });
                setIsLeader(getLeader.data)

            } catch (error) {
                console.error("Error fetching schedule data:", error);
            }
        };

        fetchAcc();
    }, [plan_seq]);

    useFocusEffect(
        useCallback(() => {
            const fetchSchedule = async () => {
                try {
                    const response = await axios.post(`http://${localhost}:8090/nuvida/getRouteList`, {
                        plan_seq: plan_seq,
                    });
                    const rawData = response.data;
                    setRouteList(rawData)

                    const newSchedule = rawData.reduce((acc, item) => {
                        const dayKey = `${new Date(item.travel_date).getMonth() + 1}월 ${new Date(item.travel_date).getDate()}일`;

                        if (!acc[dayKey]) acc[dayKey] = [];

                        acc[dayKey].push({
                            seq:item.route_seq,
                            reservation:item.reser_dt,
                            title: item.title,
                            address: item.addr,
                            lat: item.lat,
                            lng: item.lng,
                            category: getCategory(item.contenttypeid), // 카테고리
                            icon: getIcon(item.contenttypeid), // 카테고리에 맞는 아이콘 선택
                        });

                        return acc;
                    }, {});

                    setSchedule(newSchedule);
                } catch (error) {
                    console.error("Error fetching schedule data:", error);
                }
            };

            fetchSchedule();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, []) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
    );

    const getIcon = (contenttypeid) => {
        switch (contenttypeid) {
            case '0': // 야구
                return 'sports-baseball';
            case '39': // 식당
                return 'storefront';
            case '15': // 축제
                return 'festival';
            case '28': // 스포츠
                return 'sports-baseball';
            case '32': // 숙박
                return 'lodging';
            case '38': // 쇼핑
                return 'shopping-bag';
            default:
                return 'museum'; // 기본 아이콘
        }
    };

    const getCategory = (contenttypeid) =>{
        switch (contenttypeid) {
            case '0': // 야구
                return '야구경기';
            case '39': // 식당
                return '식당/카페';
            case '15': // 축제
                return '축제/행사';
            case '28': // 스포츠
                return '레저';
            case '32': // 숙박
                return '숙박';
            case '38': // 쇼핑
                return '쇼핑';
            default:
                return '관광지'; // 기본 아이콘
        }
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

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Kakao Map</title>
        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=0d1aeb961589309735eb62b6b8eec500"></script>
        <style>
          #map {
            width: 100%;
            height: 120vh;
          }
          .markerLabel {
            color: white;
            border-radius: 50%;
            padding: 3px;
            text-align: center;
            width: 20px;
            height: 20px;
            font-weight: bold;
            font-size: 12px;
            line-height: 20px;
            position: relative;
            top: -30px; /* 마커 위에 라벨을 배치하기 위해 top 속성을 사용 */
            left: -10px; /* 라벨을 중앙에 맞추기 위해 left 속성을 사용 */
            background-color: black;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                var container = document.getElementById('map');
                var options = {
                    center: new kakao.maps.LatLng(35.1595454, 126.8526012), // 임시 초기 중심 좌표
                    level: 7 // 기본 줌 레벨 설정
                };
                var map = new kakao.maps.Map(container, options); // 지도 생성
        
                var bounds = new kakao.maps.LatLngBounds(); // LatLngBounds 객체 생성
        
                var schedule = ${JSON.stringify(schedule)}; // 일정 정보
                var accommodation = ${JSON.stringify(accommodation)}; // 숙소 정보
                var selectedDay = "${selectedDay}"; // 선택된 날짜
                var colors = {
                    '1일차': '#FF0000', // 빨간색
                    '2일차': '#0000FF', // 파란색
                    '3일차': '#008000'  // 초록색
                };
        
                var daysToShow = selectedDay === '전체' ? Object.keys(schedule) : [selectedDay]; // 표시할 일차 결정
                var hasMarkers = false; // 마커가 있는지 여부 확인
        
                // 마커를 지도에 추가하는 함수 (이동 순서 표시 포함)
                function addMarker(position, imageSrc, size, title, address, label, color) {
                    var imageSize = new kakao.maps.Size(size.width, size.height); // 마커 크기 설정
                    var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); // 마커 이미지 생성
                    var markerPosition = new kakao.maps.LatLng(position.lat, position.lng); // 마커 위치 설정
                    var marker = new kakao.maps.Marker({
                        position: markerPosition, // 마커 위치
                        image: markerImage // 마커 이미지 설정
                    });
                    marker.setMap(map); // 지도에 마커 추가
        
                    // 각 마커의 위치를 LatLngBounds에 추가
                    bounds.extend(markerPosition);
                    hasMarkers = true; // 마커가 있음을 표시
        
                    // 이동 순서를 표시하는 라벨 추가
                    var labelContent = '<div style="background-color:black; color:white; border-radius:50%; padding:5px; text-align:center; width:30px; height:30px; line-height:30px; font-size:23px; font-weight:bold;">' + label + '</div>';
                    var labelOverlay = new kakao.maps.CustomOverlay({
                        content: labelContent,
                        position: markerPosition,
                        yAnchor: 1.5, // 라벨이 마커 위에 위치하도록 조정
                        xAnchor: 0.5,
                        zIndex: 3
                    });
                    labelOverlay.setMap(map); // 지도에 라벨 추가
                }
        
                // 폴리라인을 그리는 함수
                function drawPolyline(pathCoordinates, color) {
                    var polyline = new kakao.maps.Polyline({
                        path: pathCoordinates, // 폴리라인 경로 설정
                        strokeWeight: 8, // 선 두께
                        strokeColor: color, // 선 색상
                        strokeOpacity: 0.7, // 선 투명도
                        strokeStyle: 'solid' // 선 스타일
                    });
                    polyline.setMap(map); // 지도에 폴리라인 추가
                    
                    // 클릭 이벤트 추가 (거리 표시)
              kakao.maps.event.addListener(polyline, 'click', function(mouseEvent) {
                var clickPosition = mouseEvent.latLng; // 클릭한 위치 좌표
                displayDistance(polyline, clickPosition); // 클릭 시 거리 표시 함수 호출
              });
                    
                      
                }
                
                // 폴리라인의 거리를 표시하는 함수
            function displayDistance(polyline, position) {
              var length = polyline.getLength(); // 폴리라인의 길이(미터) 계산
              var message = '거리: ' + (length / 1000).toFixed(2) + ' km'; // 길이를 킬로미터로 변환하여 메시지 생성
              
              // 거리 표시를 위한 오버레이 콘텐츠 생성
              var overlayContent = '<div style="padding:5px;background:white;border:1px solid black;">' + message + '</div>';
              
              var overlay = new kakao.maps.CustomOverlay({
                content: overlayContent,
                position: position, // 터치한 위치에 오버레이 표시
                yAnchor: 1
              });
              
              overlay.setMap(map); // 지도에 오버레이 추가
              
              // 3초 후 오버레이 제거
              setTimeout(function() {
                overlay.setMap(null);
              }, 3000);
            }
        
                daysToShow.forEach(function(day) {
                    var positions = schedule[day]; // 각 날짜의 위치 정보
                    var linePath = []; // 폴리라인 경로를 저장할 배열
        
                    positions.forEach(function(position, index) {
                        var markerPosition = new kakao.maps.LatLng(position.lat, position.lng); // 마커 위치 설정
        
                        // 마커 추가 (이동 순서 표시)
                        addMarker(
                            position, 
                            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', 
                            {width: 34, height: 45}, 
                            position.title, 
                            position.address, 
                            index + 1, // 이동 순서 (1부터 시작)
                            colors[day] // 날짜별 색상 적용
                        );
        
                        // 폴리라인 경로에 마커 위치 추가
                        linePath.push(markerPosition);
                        
                    });
        
                    // 폴리라인 그리기
                    if (linePath.length > 1) { // 경로가 두 지점 이상이어야 폴리라인을 그릴 수 있음
                        drawPolyline(linePath, colors[day]); // 날짜별 색상 적용
                    }
                    
                    
                });
        
                // 숙소 추가 부분
                accommodation.forEach(function(hotel, index) {
                    var markerPosition = new kakao.maps.LatLng(hotel.lat, hotel.lng); // 숙소 위치 설정
        
                    // 숙소 마커 추가
                    addMarker(
                        { lat: hotel.lat, lng: hotel.lng },
                        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                        {width: 44, height: 55},
                        hotel.acc_name,
                        hotel.addr,
                        'H', // 숙소는 "H"로 표시
                        '#FFD700' // 금색
                    );
                });
        
                // 모든 마커와 경로를 포함하는 범위에 맞게 지도를 조정
                if (hasMarkers) {
                    map.setBounds(bounds);
                } else {
                    // 마커가 없을 경우 기본 줌 레벨과 위치 설정
                    map.setCenter(new kakao.maps.LatLng(35.1595454, 126.8526012)); // 기본 중심 좌표
                    map.setLevel(7); // 기본 줌 레벨
                }
            });
        </script>
      </body>
    </html>
  `;

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

    const handleNavi = async (item) => {
        const destination = encodeURIComponent(item.title); // 목적지 이름
        const endLat = item.lat; // 목적지 위도
        const endLng = item.lng; // 목적지 경도

        // 카카오맵 길찾기 URL
        const url = `kakaomap://route?ep=${endLat},${endLng}&by=PUBLIC`; // by=FOOT, CAR, PUBLIC 등이 가능합니다.
        const installUrl = 'https://play.google.com/store/apps/details?id=net.daum.android.map';  // 카카오맵 설치 페이지 URL

        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('Error launching KakaoMap:', error);
            Alert.alert(
                '카카오맵을 실행할 수 없습니다.',
                '카카오맵 설치 페이지로 이동하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    { text: '확인', onPress: () => Linking.openURL(installUrl) },
                ]
            );
        }

        // try {
        //     const canOpen = await Linking.canOpenURL(url);
        //     console.log('Can open URL:', canOpen);
        //
        //     if (canOpen) {
        //         await Linking.openURL(url);
        //     } else {
        //         Alert.alert(
        //             '카카오맵 설치되어 있지 않습니다.',
        //             '카카오맵 설치 페이지로 이동하시겠습니까?',
        //             [
        //                 { text: '취소', style: 'cancel' },
        //                 { text: '확인', onPress: () => Linking.openURL(installUrl) },
        //             ]
        //         );
        //     }
        // } catch (error) {
        //     console.error('Error launching KakaoNavi:', error);
        //     Alert.alert('오류 발생', '카카오내비 실행 중 오류가 발생했습니다. 다시 시도해 주세요.');
        // }
    };

    const renderDaySchedule = (day) => {
        if (day === "전체") {
            const allDaysSchedule = Object.keys(schedule).flatMap((day) =>
                schedule[day].map((item) => ({ ...item, day }))
            );

            const groupedByDay = allDaysSchedule.reduce((acc, item) => {
                if (!acc[item.day]) {
                    acc[item.day] = [];
                }
                acc[item.day].push(item);
                return acc;
            }, {});

            return Object.keys(groupedByDay).map((dayKey, index) => (
                <View key={index} style={{width: '100%', flex: 1}}>
                    <View style={{justifyContent: 'center', width: '100%', marginBottom:10}}>
                        <Text style={{fontWeight: 'bold'}}>{dayKey}</Text>
                    </View>
                    {groupedByDay[dayKey].map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.scheduleItem}>
                            <View style={styles.timeLine}>
                                {/* 동그라미 안에 순서를 표시 */}
                                <View style={styles.circle}>
                                    <Text style={styles.numberInsideCircle}>{itemIndex + 1}</Text>
                                </View>
                                {itemIndex !== groupedByDay[dayKey].length - 1 && <View style={styles.line} />}
                            </View>
                            <View style={styles.scheduleItemContent}>
                                <View style={styles.scheduleItemHeader}>
                                    <View style={[styles.iconTitleContainer]}>
                                        {/* 원래 아이콘 복구 */}
                                        <MaterialIcons name={item.icon} size={21} color="black" style={{marginTop: '3%'}} />
                                        <Text style={styles.titleText}>{item.title}</Text>
                                    </View>
                                    {showDeleteIcons && (
                                        <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteItem(dayKey, itemIndex)}>
                                            <Entypo name="cross" size={24} color="red" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={[styles.categoryText, {marginBottom: '1%', color: '#41ABB2'}]}>{item.category}</Text>
                                {item.address && <Text style={styles.addressText}>{item.address}</Text>}
                                {item.reservation && <Text style={styles.detailsText}>{formatReserDt(item.reservation)} {formatTime(item.reservation)}</Text>}
                                <TouchableOpacity style={styles.naviButton} onPress={() => handleNavi(item)}>
                                    <Text style={{fontSize: 12, color: 'white', fontWeight: 'bold'}}>길찾기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            ));
        } else {
            return schedule[day]?.map((item, index) => (
                <View key={index} style={styles.scheduleItem}>
                    <View style={styles.timeLine}>
                        {/* 동그라미 안에 순서를 표시 */}
                        <View style={styles.circle}>
                            <Text style={styles.numberInsideCircle}>{index + 1}</Text>
                        </View>
                        {index !== schedule[day].length - 1 && <View style={styles.line} />}
                    </View>
                    <View style={styles.scheduleItemContent}>
                        <View style={styles.scheduleItemHeader}>
                            <View style={styles.iconTitleContainer}>
                                {/* 원래 아이콘 복구 */}
                                <MaterialIcons name={item.icon} size={24} color="black" style={{marginTop: '2%'}}/>
                                <Text style={styles.titleText}>{item.title}</Text>
                            </View>
                            {showDeleteIcons && (
                                <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteItem(day, index)}>
                                    <Entypo name="cross" size={24} color="red" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={[styles.categoryText, {marginBottom: '1%', color: '#41ABB2'}]}>{item.category}</Text>
                        {item.address && <Text style={styles.addressText}>{item.address}</Text>}
                        {item.reservation && <Text style={styles.detailsText}>{formatReserDt(item.reservation)} {formatTime(item.reservation)}</Text>}
                        <TouchableOpacity style={styles.naviButton} onPress={() => handleNavi(item)}>
                            <Text style={styles.naviText}>길찾기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ));
        }
    };



    const renderDayTabs = () => {
        const days = Object.keys(schedule); // "전체"를 제외한 날들

        return (
            <View style={styles.dayTabsContainer}>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dayTabsScroll}>
                    <TouchableOpacity
                        style={[styles.dayTab, selectedDay === '전체' && styles.dayTabActive]}
                        onPress={() => setSelectedDay('전체')}>
                        <Text style={selectedDay === '전체' ? styles.dayTabTextActive : styles.dayTabText}>전체</Text>
                    </TouchableOpacity>
                    {days.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dayTab, selectedDay === day && styles.dayTabActive]}
                            onPress={() => setSelectedDay(day)}>
                            <Text style={selectedDay === day ? styles.dayTabTextActive : styles.dayTabText}>{day}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const mapFold= () =>{
        setMapFoldTF(!mapFoldTF);
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
        const formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(date);
        return formattedDate.replace(/\./, '.');
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
                navigation.navigate("TripCalendar", {userInfo:userInfo});
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
                navigation.navigate("TripCalendar", {userInfo:userInfo});
            } catch (e) {
                console.error(e)
            }
        }
    }

    // 상단 바
    const renderHeader = () => {
        return (
            <View style={[styles.center_row, styles.headerContainer]}>
                <View style={[{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-start'}]}>
                    <TouchableOpacity style={[styles.center_row, {marginLeft: '12%'}]} onPress={() => navigation.navigate("TripCalendar", {userInfo})}>
                        <Entypo name="chevron-thin-left" size={14} color="black" />
                        <Text style={{fontSize: 14, marginLeft: '5%'}}>이전</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width: '40%', height: '100%'}}>
                </View>
                <View style={[{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end',}]}>
                    <TouchableOpacity style={[styles.center_row, {marginRight: '12%'}]} onPress={() => checkDeletePlan()}>
                        <Text style={{fontSize: 14, marginRight: '5%', color: 'red'}}>삭제</Text>
                        <Entypo name="chevron-thin-right" size={14} color="red" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // 여행 상단바
    const renderTripHeader = () => {
        return (
            <View style={[{width: '100%', height: '10%'}]}>
                <View style={{width: '100%', height: '50%', flexDirection: 'row', alignItems: 'center'}}>
                    <View style={[styles.center, {width: '10%', height: '100%', marginLeft: '5%'}]}>
                        <Ionicons name="paper-plane-outline" size={20} color="black" />
                    </View>
                    <View style={[{width: '80%', height: '100%', marginRight: '5%', justifyContent: 'center'}]}>
                        {planInfo ? (
                            <Text style={{fontSize: 18, letterSpacing: 2}}>{planInfo.plan_name}</Text>
                        ) : (
                            <Text style={{fontSize: 18, letterSpacing: 2}}>광주 여행</Text>
                        )}
                    </View>
                </View>
                <View style={{width: '100%', height: '50%'}}>
                    <View style={{width: '70%', height: '100%', marginLeft: '13%', marginRight: '17%', }}>
                        {planInfo ? (
                            <Text style={{fontSize: 13}}>
                                {formatDate(planInfo.start_date)}{"  -  "}{formatDate(planInfo.end_date)}
                            </Text>
                        ) : (
                            <Text style={{fontSize: 13}}>2024. 05. 21 (토) - 2024. 05. 23 (월)</Text>
                        )}
                    </View>
                </View>
            </View>
        )
    }

    const goMypage = () =>{
        if(userInfo){
            navigation.navigate('Mypage', {userInfo:userInfo})
        }else{
            navigation.navigate('Signin')
        }
    }

    const goChat = () =>{
        if(userInfo){
            navigation.navigate('ChatRoomList', {userInfo:userInfo})
        }else{
            navigation.navigate("Signin");
        }
    }

    // 하단 바
    const renderTabBar = () => {
        return (
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
                    <Entypo name="home" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={handlePlanCalendarIconPress}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={goChat}>
                    <MaterialCommunityIcons name="chat" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('CommunityList', {userInfo:userInfo})}>
                    <Ionicons name="chatbubbles-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => goMypage()}>
                    <Feather name="user" size={24} color="black" />
                </TouchableOpacity>
            </View>
        );
    };

    // 하단바 일정관리 아이콘
    const handlePlanCalendarIconPress = () => {
        if (userInfo) {
            navigation.navigate("TripCalendar",{userInfo:userInfo});
        } else {
            navigation.navigate("Signin");
        }
    };

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderTripHeader()}
            <View style={styles.tabContainer}>
                <TouchableOpacity style={styles.tabButtonActive} onPress={() => navigation.navigate("TripSchedule", { userInfo, plan_seq })}>
                    <Text style={styles.tabTextActive}>여행일정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("ReservationInfo", { userInfo, plan_seq, planInfo, routeList , isLeader})}>
                    <Text style={styles.tabText}>예약정보</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("MemberList", { userInfo, plan_seq, planInfo, routeList, isLeader })}>
                    <Text style={styles.tabText}>멤버목록</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("Calculate", { userInfo, plan_seq, planInfo, routeList, isLeader })}>
                    <Text style={styles.tabText}>정산하기</Text>
                </TouchableOpacity>
            </View>

            {mapFoldTF&&(
                <View style={{ height: 320 }}>
                    <WebView
                        originWhitelist={['*']}
                        source={{ html }}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('WebView error: ', nativeEvent);
                        }}
                        onLoadEnd={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.log('WebView load finished: ', nativeEvent);
                        }}
                    />
                </View>
            )}
            <TouchableOpacity style={styles.mapFold} onPress={()=>mapFold()}>
                {mapFoldTF?
                    (<FontAwesome name="caret-up" size={24} color="black" />) : (<FontAwesome5 name="caret-down" size={24} color="black" />)
                }
            </TouchableOpacity>
            {renderDayTabs()}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.scheduleContainer}>
                    {renderDaySchedule(selectedDay)}
                </View>
            </ScrollView>
            {renderTabBar()}
        </View>
    );
};

const styles = StyleSheet.create({
    /* 상단바 */
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        paddingTop: '10%',
        marginBottom: '2%',
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

    /* 하단바 */
    tabBar: {
        height: 60,
        flexDirection: 'row',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        marginBottom: 80,
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
        borderBottomWidth: 0.7,
        borderColor: '#EAEAEA',
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
        fontSize: 15,
        fontWeight: 'bold',
        color: '#999',
    },
    tabTextActive: {
        fontSize: 15,
        fontWeight: 'bold',
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
        flex: 1, // 각 탭이 균등한 너비를 차지하도록 설정
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: 'white',
        alignItems: 'center', // 텍스트를 중앙 정렬
    },
    dayTabActive: {
        flex: 1, // 활성화된 탭도 균등한 너비를 유지
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        // backgroundColor: '#477ADE',
        alignItems: 'center',
    },
    scheduleContainer: {
        paddingLeft: 20,  // 왼쪽에만 20px 여백
        paddingRight: 20,  // 오른쪽에만 20px 여백
    },
    scheduleItem: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    timeLine: {
        alignItems: 'center',
        width: 40,
    },
    circle: {
        width: 35, // 동그라미 크기
        height: 35, // 동그라미 크기
        borderRadius: 35, // 반지름을 설정하여 동그라미 모양으로
        backgroundColor: '#F3F4F6', // 동그라미 배경색
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberInsideCircle: {
        color: '#6B7280', // 순서 텍스트 색상 (하얀색)
        fontWeight: 'bold', // 순서 텍스트 굵기
        fontSize: 16, // 순서 텍스트 크기
    },
    line: {
        width: 1,
        flex: 1,
        backgroundColor: '#6B7280',
        marginTop: 5,  // 위쪽 간격 설정
    },
    scheduleItemContent: {
        flex: 1,
        paddingLeft: 10,
        borderRadius: 10,
        height: "auto",
        marginBottom: '8%'
    },
    timeText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailsText: {
        fontSize: 13,
        color: '#666',
    },
    categoryText:{
        fontSize: 14,
        color: '#000000',
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
    mapFold:{
        alignItems: 'center',
        borderBottomWidth: 0.7,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderBottomColor: '#EAEAEA',
    },
    mapFoldText: {
        fontSize: 14, // 지도 접기/열기 텍스트 크기 조정
        color: '#000',
    },

    dayTabText: {
        color: '#000',
        fontSize: 14,
        textAlign: 'center',
    },
    dayTabTextActive: {
        color: '#1e60e8',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },

    dayTabsContainer: {
        height: 50, // 날짜 탭의 높이 설정
        backgroundColor: 'white',
    },
    dayTabsScroll: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },

    scheduleItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative', // naviButton을 절대 위치로 배치할 수 있게 합니다.
    },
    naviText: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#fff',
    },


    iconTitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1, // 텍스트가 공간을 차지할 수 있도록 설정
    },

    titleText: {
        fontSize: 15,
        fontWeight: 'bold',
        marginVertical: 5,
        marginLeft: 10,
        flexShrink: 1, // 텍스트가 공간을 차지할 수 있도록 설정
        flexWrap: 'wrap', // 줄이 넘어갈 때 줄바꿈
        lineHeight: 30,
    },

    naviButton: {
        position: 'absolute', // 절대 위치 설정
        right: 0, // 오른쪽 끝에 배치
        top: 7,
        width: 50, // 버튼 너비 설정
        height: 30, // 버튼 높이 설정
        borderRadius: 5,
        backgroundColor: '#1349b5',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default TripSchedule;
