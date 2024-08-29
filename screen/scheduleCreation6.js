import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { FontAwesome5, FontAwesome6, AntDesign, FontAwesome, Entypo, Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import DraggableFlatList from 'react-native-draggable-flatlist'; // 드래그 기능 추가
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ScheduleCreation6({ route }) {
    const navigation = useNavigation();

    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
    // const [userInfo, setUserInfo] = useState(null);  // 로그인 정보
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const [moveRoute, setMoveRoute] = useState(null); // 루트정보
    const scheduleInfo = route.params.scheduleInfo; // 일정 생성 정보
    const [selectedDay, setSelectedDay] = useState('전체');

    const localhost = '192.168.55.35';
    const userInfo = route.params.userInfo;

    const [schedule, setSchedule] = useState([])

    const [mapFoldTF, setMapFoldTF] = useState(true);

    const accommodation = scheduleInfo.accommodation;
    console.log(scheduleInfo)
    console.log(accommodation)

    // 루트 가져오기
    useEffect(() => {
        const getRoute = async () => {
            try {
                const response = await axios.post(`http://${localhost}:8000/route`, {
                    scheduleInfo: scheduleInfo,
                });
                console.log("이동루트", response.data.route)
                setMoveRoute(response.data.route)
            } catch (error) {
                console.error('Error fetching plan data:', error);
            } finally {
                setLoading(false); // 데이터 로드 완료 후 로딩 상태 false로 변경
            }
        };

        getRoute();
    }, []);


    useEffect(() => {
        const generateSchedule = () => {
            const scheduleData = {};

            moveRoute.forEach((dayRoute, dayIndex) => {
                const dayKey = `${dayIndex + 1}일차`;
                scheduleData[dayKey] = dayRoute.map((route) => {
                    const place = scheduleInfo.selectedPlaces.find(p => p.id === route.id);

                    if (place) {
                        return {
                            id: route.id, // 드래그 기능을 위해 ID 필요
                            time: formatTime(route.visit_start), // 방문 시작 시간 포맷
                            name: place.name,
                            details: `${formatTime(route.visit_start)} - ${formatTime(route.visit_end)}`,
                            addr: place.addr,
                            icon: getIcon(place.contenttypeid), // 카테고리에 맞는 아이콘 선택
                            lat: parseFloat(place.lat),
                            lng: parseFloat(place.lng),
                            category: getCategory(place.contenttypeid), // 카테고리
                            transportation: null, // 이동 수단 정보가 있으면 추가
                            firstimage:place.firstimage,
                            contentid:place.contentid,
                            contenttypeid: place.contenttypeid,
                            travel_date: formatDay(route.visit_start),
                            reservation: place.reservation,
                        };
                    }
                    return null;
                }).filter(item => item !== null); // 유효하지 않은 항목을 제거
            });

            setSchedule(scheduleData);
        };

        if (moveRoute && scheduleInfo.selectedPlaces) {
            generateSchedule();
        }
    }, [moveRoute, scheduleInfo]);
    
    
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

    const formatDay = (dateDay) =>{
      const date  = new Date(dateDay);
        const formattedDate = date.toISOString().split('T')[0];

      return formattedDate;
    };


    const formatTime = (datetime) => {
        const date = new Date(datetime);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 || 12; // 12시간제로 변환
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${period} ${formattedHours}:${formattedMinutes}`;
    };

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
            height: 100vh;
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
              center: new kakao.maps.LatLng(35.1595454, 126.8526012), // 초기 중심 좌표 설정
              level: 7 // 지도 레벨 설정 (확대 정도)
            };
            var map = new kakao.maps.Map(container, options); // 지도 생성
    
            var schedule = ${JSON.stringify(schedule)}; // 일정 정보
            var selectedDay = "${selectedDay}"; // 선택된 날짜
            var colors = {
              '1일차': '#FF0000', // 빨간색
              '2일차': '#0000FF', // 파란색
              '3일차': '#008000'  // 초록색
            };
    
            var daysToShow = selectedDay === '전체' ? Object.keys(schedule) : [selectedDay]; // 표시할 일차 결정
    
            // 마커를 지도에 추가하는 함수
            function addMarker(position, imageSrc, size, title, address, label, color) {
              var imageSize = new kakao.maps.Size(size.width, size.height); // 마커 크기 설정
              var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); // 마커 이미지 생성
              var marker = new kakao.maps.Marker({
                position: position, // 마커 위치
                image: markerImage // 마커 이미지 설정
              });
              marker.setMap(map); // 지도에 마커 추가

              // 마커에 순서 번호 라벨 추가
              var labelContent = '<div class="markerLabel" style="background-color:' + color + ';">' + label + '</div>';
              var labelOverlay = new kakao.maps.CustomOverlay({
                content: labelContent,
                position: position,
                yAnchor: 1.5, // 라벨이 마커 위에 위치하도록 yAnchor 조정
                xAnchor: 0.5,
                zIndex: 3
              });
              labelOverlay.setMap(map);

              // 마커 클릭 시 커스텀 오버레이 표시
              kakao.maps.event.addListener(marker, 'click', function() {
                var overlayContent = '<div style="padding:10px;background:white;border:1px solid black;">' +
                                     '<strong>' + title + '</strong><br>' + 
                                     '<span>' + address + '</span>' +
                                     '</div>';

                var overlay = new kakao.maps.CustomOverlay({
                  content: overlayContent,
                  position: position,
                  yAnchor: 1
                });

                overlay.setMap(map);

                // 3초 후 오버레이 제거
                setTimeout(function() {
                  overlay.setMap(null);
                }, 3000);
              });

              return marker;
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

            // 일반 장소 마커와 폴리라인 추가
            daysToShow.forEach(function(day) {
              var positions = schedule[day]; // 각 날짜의 위치 정보
              var linePath = [];
    
              positions.forEach(function(position, index) {
                var markerPosition = new kakao.maps.LatLng(position.lat, position.lng); // 마커 위치 설정
                addMarker(markerPosition, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', {width: 34, height: 45}, position.name, position.addr, index + 1, colors[day]); // 마커 추가
                linePath.push(markerPosition); // 폴리라인 경로에 위치 추가
              });
    
              var polyline = new kakao.maps.Polyline({
                path: linePath, // 폴리라인 경로 설정
                strokeWeight: 8, // 선 두께
                strokeColor: colors[day], // 선 색상
                strokeOpacity: 0.7, // 선 투명도
                strokeStyle: 'solid' // 선 스타일
              });
    
              polyline.setMap(map); // 지도에 폴리라인 추가
              
              // 클릭 이벤트 추가 (거리 표시)
              kakao.maps.event.addListener(polyline, 'click', function(mouseEvent) {
                var clickPosition = mouseEvent.latLng; // 클릭한 위치 좌표
                displayDistance(polyline, clickPosition); // 클릭 시 거리 표시 함수 호출
              });
            });
    
            // 숙소 마커 추가
            var accommodation = ${JSON.stringify(accommodation)};
            accommodation.forEach(function(hotel, index) {
              var markerPosition = new kakao.maps.LatLng(hotel.lat, hotel.lng); // 숙소 위치 설정
              addMarker(markerPosition, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', {width: 44, height: 55}, hotel.acc_name, hotel.addr, 'H', '#FFD700'); // 숙소 마커 추가 (금색)
            });
          });
        </script>
      </body>
    </html>
  `;









    const renderDaySchedule = (day) => {
        return (
            <DraggableFlatList
                data={schedule[day]}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index, drag, isActive }) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.scheduleItem,
                            { backgroundColor: isActive ? '#f0f0f0' : 'white' }
                        ]}
                        onLongPress={drag}
                    >
                        {/* 네모 아이콘과 라인 렌더링 */}
                        <View style={styles.timeLine}>
                            <View style={styles.circle} />
                            {index !== schedule[day].length - 1 && <View style={styles.line} />}
                        </View>

                        {/* 일정 내용 렌더링 */}
                        <View style={styles.scheduleItemContent}>
                            <View style={styles.iconTitleContainer}>
                                <MaterialIcons name={item.icon} size={24} color="black" />
                                <Text style={styles.titleText}>{item.name}</Text>
                            </View>
                            {item.category && <Text style={styles.categoryText}>{item.category}</Text>}
                            {item.addr && <Text style={styles.addressText}>{item.addr}</Text>}
                            {item.reservation && <Text style={styles.addressText}>예약 : {item.reservation}</Text>}
                        </View>
                    </TouchableOpacity>
                )}
                onDragEnd={({ data }) => setSchedule((prev) => ({ ...prev, [day]: data }))}
                contentContainerStyle={{ paddingBottom: 20 }} // 추가적인 공간 확보
            />
        );
    };


    const renderAllDaysSchedule = () => {
        return Object.keys(schedule).map((day, index) => (
            <View key={index}>
                <Text style={styles.dayTitle}>{day}</Text>
                {renderDaySchedule(day)}
            </View>
        ));
    };

    const renderSchedule = () => {
        if (selectedDay === '전체') {
            // 모든 일차의 데이터를 하나로 합침
            const allDaysSchedule = Object.keys(schedule).flatMap((day) =>
                schedule[day].map((item) => ({ ...item, day }))
            );

            return (
                <DraggableFlatList
                    data={allDaysSchedule}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index, drag, isActive }) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.scheduleItem,
                                { backgroundColor: isActive ? '#f0f0f0' : 'white' }
                            ]}
                            onLongPress={drag}
                        >
                            <View style={styles.timeLine}>
                                <View style={styles.circle} />
                                {index !== allDaysSchedule.length - 1 && <View style={styles.line} />}
                            </View>
                            <View style={styles.scheduleItemContent}>
                                <Text style={styles.dayTitle}>{item.day}</Text>
                                <View style={styles.iconTitleContainer}>
                                    <MaterialIcons name={item.icon} size={24} color="black" />
                                    <Text style={styles.titleText}>{item.name}</Text>
                                </View>
                                {item.category && <Text style={styles.categoryText}>{item.category}</Text>}
                                {item.addr && <Text style={styles.addressText}>{item.addr}</Text>}
                                {item.reservation && <Text style={styles.addressText}>예약 : {item.reservation}</Text>}
                            </View>
                        </TouchableOpacity>
                    )}
                    onDragEnd={({ data, from, to }) => {
                        // 데이터 변경 시 각 일차별로 다시 분할해서 저장
                        const newSchedule = data.reduce((acc, item) => {
                            if (!acc[item.day]) acc[item.day] = [];
                            acc[item.day].push(item);
                            return acc;
                        }, {});

                        // 드래그 시작과 종료 위치가 다르고, 날짜도 다를 경우 이동 처리
                        if (from !== to) {
                            const draggedItem = data[to];
                            const originalDay = draggedItem.day;
                            const newDay = data[to - 1] ? data[to - 1].day : data[to + 1].day;

                            if (originalDay !== newDay) {
                                // 원래 일차에서 제거
                                newSchedule[originalDay] = newSchedule[originalDay].filter(item => item.id !== draggedItem.id);

                                // 원래 일차에 최소 한 개의 장소가 남아 있는지 확인
                                if (newSchedule[originalDay].length === 0) {
                                    // 최소 한 개의 장소가 남아 있어야 하므로, 이동을 막고 원래 위치로 되돌림
                                    Alert.alert("이동 불가", "일차에는 최소 한 개의 장소가 있어야 합니다.");
                                    setSchedule(schedule); // 원래 상태로 복구
                                } else {
                                    // 다른 일차로 이동 허용
                                    draggedItem.day = newDay;
                                    newSchedule[newDay].push(draggedItem);
                                    newSchedule[newDay] = newSchedule[newDay].sort((a, b) => a.time.localeCompare(b.time)); // 시간 순으로 정렬

                                    // 키를 정렬하여 일차 순서가 유지되도록 설정
                                    const sortedSchedule = Object.keys(newSchedule)
                                        .sort((a, b) => parseInt(a) - parseInt(b))
                                        .reduce((acc, key) => {
                                            acc[key] = newSchedule[key];
                                            return acc;
                                        }, {});

                                    setSchedule(sortedSchedule);
                                }
                            } else {
                                newSchedule[originalDay] = newSchedule[originalDay].sort((a, b) => a.time.localeCompare(b.time)); // 시간 순으로 정렬
                                setSchedule(newSchedule);
                            }
                        }
                    }}
                    contentContainerStyle={{ paddingBottom: 20 }} // 추가적인 공간 확보
                />
            );
        } else {
            return renderDaySchedule(selectedDay);
        }
    };



    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }


    const renderTabBar = () => (
        <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
                <Entypo name="home" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('planCalendarPage')}>
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

    const renderDayTabs = () => {
        const days = Object.keys(schedule);
        return (
            <View style={styles.dayTabs}>
                <TouchableOpacity
                    style={selectedDay === '전체' ? styles.dayTabActive : styles.dayTab}
                    onPress={() => setSelectedDay('전체')}>
                    <Text style={selectedDay === '전체' ? styles.dayTabTextActive : styles.dayTabText}>전체</Text>
                </TouchableOpacity>
                {days.map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={selectedDay === day ? styles.dayTabActive : styles.dayTab}
                        onPress={() => setSelectedDay(day)}>
                        <Text style={selectedDay === day ? styles.dayTabTextActive : styles.dayTabText}>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // 날짜 포맷 함수
    const formatDateRange = (dateRange) => {
        // date-fns를 사용하여 날짜를 원하는 형식으로 변환
        const startDate = format(new Date(dateRange[0]), 'yyyy. MM. dd (EEE)', { locale: ko });
        const endDate = format(new Date(dateRange[1]), 'yyyy. MM. dd (EEE)', { locale: ko });

        return `${startDate} - ${endDate}`;
    };

    // 생성 완료
    const handleCreate = async () =>{
        console.log("완료 버튼 눌림");

        console.log("일정이름 : ", scheduleInfo.plan_name);
        console.log("시작날짜 : ", scheduleInfo.dateRange[0]);
        console.log("마지막날짜 : ", scheduleInfo.dateRange[1]);
        console.log("이동루트 : ", schedule);
        console.log("멤버 : ", scheduleInfo.friends_id);
        console.log("여행시간 : ", scheduleInfo.start_date, scheduleInfo.end_date);
        console.log("숙소 : ", accommodation);

        const plan_name = scheduleInfo.plan_name;
        const start_date = scheduleInfo.dateRange[0];
        const end_date = scheduleInfo.dateRange[1];
        const route = schedule;
        const members = scheduleInfo.friends_id;
        const traveltime = {start_time :scheduleInfo.start_date, end_time:scheduleInfo.end_date};

        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/insertPlan`,
                {user_id:userInfo.user_id, plan_name:plan_name,start_date:start_date,
                    end_date:end_date, route:route,members:members,traveltime:traveltime,accommodation:accommodation});

            navigation.navigate('ScheduleCreation8', {scheduleInfo:scheduleInfo, plan_seq:response.data, userInfo:userInfo});

        } catch (error) {
            console.error('Error fetching plan data:', error);
        }

    };

    const mapFold= () =>{
        setMapFoldTF(!mapFoldTF);
    }

    const map = () => (
        <View style={styles.container}>
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
                    <TouchableOpacity style={[styles.center_row, {marginRight: '12%'}]} onPress={() => handleCreate()}>
                        <Text style={{fontSize: 14, marginRight: '5%'}}>완료</Text>
                        <Entypo name="chevron-thin-right" size={14} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.header}>
                <Text style={styles.location}>{scheduleInfo.plan_name}</Text>
                <Text style={styles.date}>{formatDateRange(scheduleInfo.dateRange)}</Text>
            </View>

            {mapFoldTF&&(
                <View style={{ height: 300 }}>
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
                    (<Text style={styles.mapFoldText}>지도접기</Text>) : (<Text style={styles.mapFoldText}>지도열기</Text>)
                }
            </TouchableOpacity>
            {renderDayTabs()}
            <View style={styles.scheduleContainer}>
                {renderSchedule()}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {map()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    /* 상단바 */
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        paddingTop: '10%',
        paddingBottom: '2%',

    },
    center_row: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
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
    map: {
        flex: 1,
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
        flex:1,
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
    squareIcon: {
        width: 20,
        height: 20,
        backgroundColor: '#000', // 네모 아이콘 색상
        marginBottom: 10,
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
    categoryText: {
        fontSize: 16,
        color: '#70bec3',
        paddingBottom:5,
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
        marginBottom: 0,
    },
    tabItem: {
        alignItems: 'center',
    },
    mapFold:{
        alignItems: 'center',
        paddingVertical:5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    mapFoldText:{

    }
});
