import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Entypo, FontAwesome, Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import axios from "axios";
import { WebView } from 'react-native-webview';

const TripSchedule = ({ route }) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    const [mapFoldTF, setMapFoldTF] = useState(true);

    // 일정 식별자
    const plan_seq = route.params.plan_seq;

    const accommodation = null;

    console.log(plan_seq)

    const [selectedDay, setSelectedDay] = useState('전체');
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);

    const [schedule, setSchedule] = useState({});

    useEffect(() => {
        // 기존 API 호출 코드가 있다고 가정하고, 여기서 데이터를 가져옵니다.
        const fetchSchedule = async () => {
            try {
                // const response = await axios.get(`http://example.com/your-api/${plan_seq}`);
                // const rawData = response.data; // 예를 들어 위에 주어진 배열

                const rawData =[
                    {route_seq:14, plan_seq:7, seq:1, title:"광주 남구문화원", addr:"광주광역시 남구 봉선로 208 (봉선동)", image:"http://tong.visitkorea.or.kr/cms/resource/11/1888811_image2_1.jpg", contentid:"130392", contenttypeid:"14", lat:"35.1221", lng:"126.917", reser_dt:"2024-08-17 10:00:00", travel_date:"2024-08-17"},

                    {route_seq:15, plan_seq:7, seq:2, title:"광주 3·1 만세운동 기념비", addr:"광주광역시 남구 백서로 13 (양림동)", image:"http://tong.visitkorea.or.kr/cms/resource/11/1888811_image2_1.jpg", contentid:"130392", contenttypeid:"14", lat:"35.1368", lng:"126.91", reser_dt:null, travel_date:"2024-08-17"},

                    {route_seq:16, plan_seq:7, seq:3, title:"광주 경찰충혼탑", addr:"광주광역시 남구 사직길 49 )", image:"http://tong.visitkorea.or.kr/cms/resource/11/1888811_image2_1.jpg", contentid:"130392", contenttypeid:"14", lat:"35.1425", lng:"126.916", reser_dt:null, travel_date:"2024-08-17"},

                    {route_seq:17, plan_seq:7, seq:1, title:"광주 대인시장 (대인예술시장)", addr:"광주광역시 동구 제봉로184번길 9-10 ", image:"http://tong.visitkorea.or.kr/cms/resource/11/1888811_image2_1.jpg", contentid:"130392", contenttypeid:"14", lat:"35.1541", lng:"126.917", reser_dt:null, travel_date:"2024-08-18"}
                ]

                const newSchedule = rawData.reduce((acc, item) => {
                    const dayKey = `${new Date(item.travel_date).getMonth() + 1}월 ${new Date(item.travel_date).getDate()}일`;


                    if (!acc[dayKey]) acc[dayKey] = [];

                    acc[dayKey].push({
                        time: item.reser_dt ? new Date(item.reser_dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
                        title: item.title,
                        details: item.reser_dt ? `${new Date(item.reser_dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - ${new Date(item.reser_dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}` : null,
                        address: item.addr,
                        lat: item.lat,
                        lng: item.lng,
                        category: getCategory(item.contenttypeid), // 카테고리
                        icon: getIcon(item.contenttypeid), // 카테고리에 맞는 아이콘 선택
                    });

                    // if (!acc['전체']) acc['전체'] = [];
                    // acc['전체'].push({
                    //     time: item.reser_dt ? new Date(item.reser_dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
                    //     title: item.title,
                    //     details: item.reser_dt ? `${new Date(item.reser_dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - ${new Date(item.reser_dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}` : null,
                    //     address: item.addr,
                    //     icon: 'place',
                    //     lat: item.lat,
                    //     lng: item.lng,
                    // });

                    return acc;
                }, {});

                setSchedule(newSchedule);
            } catch (error) {
                console.error("Error fetching schedule data:", error);
            }
        };

        fetchSchedule();
    }, [plan_seq]);

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
                addMarker(markerPosition, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', {width: 34, height: 45}, position.title, position.address, index + 1, colors[day]); // 마커 추가
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
              var markerPosition = new kakao.maps.LatLng(hotel.lng, hotel.lat); // 숙소 위치 설정
              addMarker(markerPosition, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', {width: 44, height: 55}, hotel.acc_name, hotel.addr, 'H', '#FFD700'); // 숙소 마커 추가 (금색)
            });
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
                <View key={index} style={styles.dayGroup}>
                    <Text style={styles.dayHeader}>{dayKey}</Text>
                    {groupedByDay[dayKey].map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.scheduleItem}>
                            <View style={styles.timeLine}>
                                <View style={styles.circle} />
                                {itemIndex !== groupedByDay[dayKey].length - 1 && <View style={styles.line} />}
                            </View>
                            <View style={styles.scheduleItemContent}>
                                <View style={styles.scheduleItemHeader}>
                                    <View style={styles.iconTitleContainer}>
                                        <MaterialIcons name={item.icon} size={24} color="black" />
                                        <Text style={styles.titleText}>{item.title}</Text>
                                    </View>
                                    {showDeleteIcons && (
                                        <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteItem(dayKey, itemIndex)}>
                                            <Entypo name="cross" size={24} color="red" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <Text style={styles.timeText}>{item.time}</Text>
                                <Text style={styles.detailsText}>{item.details}</Text>
                                {item.address && <Text style={styles.addressText}>{item.address}</Text>}
                            </View>
                        </View>
                    ))}
                </View>
            ));
        }else {
            return schedule[day]?.map((item, index) => (
                <View key={index} style={styles.scheduleItem}>
                    <View style={styles.timeLine}>
                        <View style={styles.circle}/>
                        {index !== schedule[day].length - 1 && <View style={styles.line}/>}
                    </View>
                    <View style={styles.scheduleItemContent}>
                        <View style={styles.scheduleItemHeader}>
                            <View style={styles.iconTitleContainer}>
                                <MaterialIcons name={item.icon} size={24} color="black"/>
                                <Text style={styles.titleText}>{item.title}</Text>
                            </View>
                            {showDeleteIcons && (
                                <TouchableOpacity style={styles.deleteIcon}
                                                  onPress={() => handleDeleteItem(day, index)}>
                                    <Entypo name="cross" size={24} color="red"/>
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.timeText}>{item.time}</Text>
                        <Text style={styles.detailsText}>{item.details}</Text>
                        {item.address && <Text style={styles.addressText}>{item.address}</Text>}
                    </View>
                </View>
            ));
        }
    };

    const renderDayTabs = () => {
        const days = Object.keys(schedule) // "전체"를 제
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

    const mapFold= () =>{
        setMapFoldTF(!mapFoldTF);
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteIcons(!showDeleteIcons)}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
            </View>
                <View style={styles.header}>
                    <Text style={styles.location}>광 주</Text>
                    <Text style={styles.date}>2024. 05. 21 (토) - 2024. 05. 23 (월)</Text>
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={styles.tabButtonActive} onPress={() => navigation.navigate("TripSchedule", { userInfo, plan_seq })}>
                        <Text style={styles.tabTextActive}>여행일정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("ReservationInfo", { userInfo, plan_seq })}>
                        <Text style={styles.tabText}>예약정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("MemberList", { userInfo, plan_seq })}>
                        <Text style={styles.tabText}>멤버목록</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("Calculate", { userInfo, plan_seq })}>
                        <Text style={styles.tabText}>정산하기</Text>
                    </TouchableOpacity>
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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.scheduleContainer}>
                    {renderDaySchedule(selectedDay)}
                </View>
            </ScrollView>
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
    mapFold:{
        alignItems: 'center',
        paddingVertical:5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
});

export default TripSchedule;
