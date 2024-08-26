import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, FlatList, Modal } from 'react-native';
import {Entypo, Ionicons, Feather, MaterialIcons, FontAwesome} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { format, eachDayOfInterval, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import axios from 'axios';

export default function ScheduleCreation7({ route }) {
    const navigation = useNavigation();
    const scheduleInfo = route.params.scheduleInfo; // 일정 생성 정보
    const [selectedDay, setSelectedDay] = useState(null); // 선택된 일차
    const [schedule, setSchedule] = useState({}); // 일정 데이터
    const [availablePlaces, setAvailablePlaces] = useState([]); // 추가 가능한 장소들
    const [modalVisible, setModalVisible] = useState(false); // 장소 추가 모달
    const [loading, setLoading] = useState(false);
    const [mapFoldTF, setMapFoldTF] = useState(true);


    const localhost = "192.168.55.35";
    const userInfo = {user_id:'test', user_nick:'test', user_point:200};

    const accommodation = scheduleInfo.accommodation;

    useEffect(() => {
        const initialSchedule = {};
        const days = eachDayOfInterval({
            start: new Date(scheduleInfo.dateRange[0]),
            end: new Date(scheduleInfo.dateRange[1])
        });

        days.forEach((day, index) => {
            const dayKey = `${index + 1}일차`;
            initialSchedule[dayKey] = [];
        });

        setSchedule(initialSchedule);
        setAvailablePlaces(scheduleInfo.selectedPlaces);
    }, [scheduleInfo.selectedPlaces]);

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

    const handleAddPlace = (place) => {
        if (selectedDay) {
            setSchedule(prev => ({
                ...prev,
                [selectedDay]: [...prev[selectedDay], place]
            }));
            setAvailablePlaces(prev => prev.filter(p => p.id !== place.id));
            setModalVisible(false);
        }
    };

    const handleRemovePlace = (place) => {
        setSchedule(prev => {
            const newDayPlaces = prev[selectedDay].filter(p => p.id !== place.id);
            return {
                ...prev,
                [selectedDay]: newDayPlaces
            };
        });
        setAvailablePlaces(prev => [...prev, place]);
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

    const renderScheduleItem = ({ item, drag, isActive }) => (
        <TouchableOpacity
            style={[
                styles.scheduleItem,
                { backgroundColor: isActive ? '#f0f0f0' : 'white' }
            ]}
            onLongPress={drag}
        >
            <View style={styles.timeLine}>
                <View style={styles.circle} />
                <View style={styles.line} />
            </View>
            <View style={styles.scheduleItemContent}>
                <View style={styles.iconTitleContainer}>
                    <MaterialIcons name={getIcon(item.contenttypeid)} size={24} color="black" />
                    <Text style={styles.titleText}>{item.name}</Text>
                </View>
                {item.contenttypeid && <Text style={styles.categoryText}>{getCategory(item.contenttypeid)}</Text>}
                <Text style={styles.addressText}>{item.addr}</Text>
                {item.reservation && <Text style={styles.addressText}>예약 : {item.reservation}</Text>}

                <TouchableOpacity onPress={() => handleRemovePlace(item)} style={styles.deleteIcon}>
                    <Entypo name="cross" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const handleDragEnd = (data, day) => {
        setSchedule(prev => ({ ...prev, [day]: data }));
    };

    const renderDaySchedule = (day) => (
        <DraggableFlatList
            data={schedule[day] || []}
            keyExtractor={(item) => item.id}
            renderItem={(props) => renderScheduleItem({ ...props, drag: props.drag })}
            onDragEnd={({ data }) => handleDragEnd(data, day)}
            contentContainerStyle={{ paddingBottom: 20 }}
        />
    );

    const renderDayTabs = () => {
        return (
            <View style={styles.dayTabs}>
                {Object.keys(schedule).map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={selectedDay === day ? styles.dayTabActive : styles.dayTab}
                        onPress={() => setSelectedDay(day)}
                    >
                        <Text style={selectedDay === day ? styles.dayTabTextActive : styles.dayTabText}>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderSchedule = () => {
        return selectedDay ? renderDaySchedule(selectedDay) : null;
    };

    const handleCreate = async () => {
        console.log("일정 생성 완료:");
        console.log("일정이름 : ", scheduleInfo.plan_name);
        console.log("시작날짜 : ", scheduleInfo.dateRange[0]);
        console.log("마지막날짜 : ", scheduleInfo.dateRange[1]);
        console.log("생성된 일정:", schedule);
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

            navigation.navigate('ScheduleCreation8', {scheduleInfo:scheduleInfo});
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }

    };

    // 날짜 포맷 함수
    const formatDateRange = (dateRange) => {
        // date-fns를 사용하여 날짜를 원하는 형식으로 변환
        const startDate = format(new Date(dateRange[0]), 'yyyy. MM. dd (EEE)', { locale: ko });
        const endDate = format(new Date(dateRange[1]), 'yyyy. MM. dd (EEE)', { locale: ko });

        return `${startDate} - ${endDate}`;
    };

    const html = (allMarkers) => {

        return `
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
            top: -30px;
            left: -10px;
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
              center: new kakao.maps.LatLng(35.1595454, 126.8526012),
              level: 7
            };
            var map = new kakao.maps.Map(container, options);

            var places = ${JSON.stringify(allMarkers)};
            var polylinePath = [];
            var order = 1; // 순서를 관리할 변수

            function displayDistance(polyline, position) {
              var length = polyline.getLength();
              var message = '거리: ' + (length / 1000).toFixed(2) + ' km';
              
              var overlayContent = '<div style="padding:5px;background:white;border:1px solid black;">' + message + '</div>';
              
              var overlay = new kakao.maps.CustomOverlay({
                content: overlayContent,
                position: position,
                yAnchor: 1
              });
              
              overlay.setMap(map);
              
              setTimeout(function() {
                overlay.setMap(null);
              }, 3000);
            }

            places.forEach(function(place) {
              var markerPosition = new kakao.maps.LatLng(parseFloat(place.lat), parseFloat(place.lng));
              
              var marker = new kakao.maps.Marker({
                position: markerPosition,
                map: map,
                title: place.name,
                zIndex: 3
              });
              
              // 마커 클릭 시 장소명과 주소를 오버레이로 표시
                kakao.maps.event.addListener(marker, 'click', function() {
                  var overlayContent = '<div style="padding:10px;background:white;border:1px solid black;">' +
                                       '<strong>' + place.name + '</strong><br>' + 
                                       '<span>' + place.addr + '</span>' +
                                       '</div>';
    
                  var overlay = new kakao.maps.CustomOverlay({
                    content: overlayContent,
                    position: markerPosition,
                    yAnchor: 1
                  });
    
                  overlay.setMap(map);
    
                  // 3초 후 오버레이 제거
                  setTimeout(function() {
                    overlay.setMap(null);
                  }, 3000);
                });

              if (place.color != "#0000FF") {
                // 순서 라벨을 오버레이로 추가
                var labelContent = '<div class="markerLabel" style="background-color:#FF0000;">' + order + '</div>';
                var labelOverlay = new kakao.maps.CustomOverlay({
                  content: labelContent,
                  position: markerPosition,
                  yAnchor: 1.5,
                  xAnchor: 0.5,
                  zIndex: 3
                });
                labelOverlay.setMap(map);

                polylinePath.push(markerPosition);
                order++; // 순서를 증가시켜 다음 장소에 적용
              }

              marker.setMap(map);
            });

            if (polylinePath.length > 1) {
              var polyline = new kakao.maps.Polyline({
                path: polylinePath,
                strokeWeight: 5,
                strokeColor: '#FF0000',
                strokeOpacity: 0.7,
                strokeStyle: 'solid'
              });

              polyline.setMap(map);

              kakao.maps.event.addListener(polyline, 'click', function(mouseEvent) {
                var clickPosition = mouseEvent.latLng;
                displayDistance(polyline, clickPosition);
              });
            }
            
            
            // 마커를 지도에 추가하는 함수
            function addMarker(position, imageSrc, size, title, address, label, color) {
              var imageSize = new kakao.maps.Size(size.width, size.height); // 마커 크기 설정
              var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); // 마커 이미지 생성
              var marker = new kakao.maps.Marker({
                position: position, // 마커 위치
                image: markerImage, // 마커 이미지 설정
                map: map, // 마커를 표시할 지도 객체
                zIndex: 3
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
            

            // 숙소 마커 추가
            var accommodation = ${JSON.stringify(accommodation)};
            accommodation.forEach(function(hotel) {
              var markerPosition = new kakao.maps.LatLng(hotel.lng, hotel.lat); // 숙소 위치 설정
              addMarker(markerPosition, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', {width: 44, height: 55}, hotel.acc_name, hotel.addr, 'H', '#FFD700'); // 숙소 마커 추가 (금색)
            });

          });
        </script>
      </body>
    </html>
  `;
    };


    const generateMapHtml = () => {
        const allPlaces = availablePlaces.map((place, index) => ({
            ...place,
            label: `${index + 1}`,
            color: "#0000FF",
        }));

        const dayMarkers = selectedDay ? schedule[selectedDay].map((place, index) => ({
            ...place,
            label: `${index + 1}`,
            color: "#FF0000",
        })) : [];

        const allMarkers = [...allPlaces, ...dayMarkers];

        return html(allMarkers);
    };

    const mapFold= () =>{
        setMapFoldTF(!mapFoldTF);
    }



    const map = () => (
        <View style={styles.container}>
            <View style={[styles.center_row, styles.headerContainer]}>
                <View style={[{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-start' }]}>
                    <TouchableOpacity style={[styles.center_row, { marginLeft: '12%' }]} onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={14} color="black" />
                        <Text style={{ fontSize: 14, marginLeft: '5%' }}>이전</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ width: '40%', height: '100%' }}></View>
                <View style={[{ width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end', }]}>
                    <TouchableOpacity style={[styles.center_row, { marginRight: '12%' }]} onPress={() => handleCreate()}>
                        <Text style={{ fontSize: 14, marginRight: '5%' }}>완료</Text>
                        <Entypo name="chevron-thin-right" size={14} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.header}>
                <Text style={styles.location}>{scheduleInfo.plan_name}</Text>
                <Text style={styles.date}>{formatDateRange(scheduleInfo.dateRange)}</Text>
            </View>
            {mapFoldTF &&
                (
                    <View style={{ height: 300 }}>
                        <WebView
                            originWhitelist={['*']}
                            source={{ html: generateMapHtml() }}
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
                )

            }

            <TouchableOpacity style={styles.mapFold} onPress={()=>mapFold()}>
                {mapFoldTF?
                    (<Text style={styles.mapFoldText}>지도접기</Text>) : (<Text style={styles.mapFoldText}>지도열기</Text>)
                }
            </TouchableOpacity>
            {renderDayTabs()}
            <View style={styles.scheduleContainer}>
                {renderSchedule()}
            </View>
            <View style={styles.addButtonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>장소 추가</Text>
                </TouchableOpacity>
            </View>
            <PlaceSelectionModal
                visible={modalVisible}
                places={availablePlaces}
                onClose={() => setModalVisible(false)}
                onSelect={handleAddPlace}
            />
        </View>
    );






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

    return (
        <SafeAreaView style={styles.container}>
            {map()}
            {renderTabBar()}
        </SafeAreaView>
    );
}

const PlaceSelectionModal = ({ visible, places, onClose, onSelect }) => (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <SafeAreaView style={styles.modalContainer}>
            <Text style={styles.modalTitle}>장소 선택</Text>
            <FlatList
                data={places}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item)}>
                        <Text style={styles.modalItemText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
        </SafeAreaView>
    </Modal>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        paddingTop: '10%',
        paddingBottom: '2%'
    },

    center_row: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },

    header: {
        alignItems: 'center',
        marginVertical: 20
    },

    location: {
        fontSize: 24,
        fontWeight: 'bold'
    },

    date: {
        fontSize: 14,
        color: '#666'
    },

    dayTabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: 'white'
    },

    dayTab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: 'white'
    },

    dayTabActive: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#f35353'
    },

    dayTabText: {
        color: '#000'
    },

    dayTabTextActive: {
        color: '#fff'
    },

    scheduleContainer: {
        flex: 1,
        padding: 20,
        paddingBottom: 120
    }, // paddingBottom 제거

    scheduleItem: {
        flexDirection: 'row',
        marginBottom: 20
    },

    timeLine: {
        alignItems: 'center',
        width: 40
    },

    circle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#f35353'
    },

    line: {
        width: 2,
        flex: 1,
        backgroundColor: '#f35353'
    },

    scheduleItemContent: {
        flex: 1,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 5
    },

    iconTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10
    },

    categoryText: {
        fontSize: 16,
        color: '#70bec3',
        paddingBottom:5,
    },

    addressText: {
        fontSize: 14,
        color: '#666'
    },

    deleteIcon: {
        marginLeft: 10
    },

    addButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 60,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    addButton: {
        width: '100%',
        padding: 15,
        backgroundColor: '#f35353',
        borderRadius: 10,
        alignItems: 'center',
    },

    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },

    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },

    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },

    modalItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },

    modalItemText: {
        fontSize: 16
    },

    closeButton: {
        padding: 15,
        backgroundColor: '#f35353',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20
    },

    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
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
        marginBottom: 0
    },

    tabItem: {
        alignItems: 'center'
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

