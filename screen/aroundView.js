import React, { useEffect, useState, useCallback } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, FlatList, SafeAreaView, ActivityIndicator} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {WebView} from "react-native-webview";
import axios from "axios";

const Userprofile = ({route}) => {
    const API_KEY = "";
    const navigation = useNavigation();

    const [selectedCategory, setSelectedCategory] = useState(12);
    const [place, setPlace] = useState(null);



    // {item.firstimage ? <Image source={{ uri: item.firstimage }} style={styles.image} /> : <Image source={require('../assets/logo.png')} style={styles.nullImage} />}
    // <View style={styles.textContainer}>
    //     <Text>{item.title}</Text>
    //     <Text>{getCategorie(item.contenttypeid)}</Text>
    //     <Text>{item.addr1}</Text>
    // </View>


    const getAroundList = async () =>{
        try{
            const categoryParam = selectedCategory ? `&contentTypeId=${selectedCategory}` : '';

            // 반경 5km
            const locationListNum = await axios.get(`http://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}&numOfRows=20&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=E&mapX=126.8889925&mapY=35.168339&radius=5000&listYN=N&_type=JSON${categoryParam}`)
            const locationNum = locationListNum.data.response.body.items.item[0].totalCnt;
            const locationResponse = await axios.get(`http://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}&numOfRows=${locationNum}&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=E&mapX=126.8889925&mapY=35.168339&radius=5000&listYN=Y&_type=JSON${categoryParam}`)
            const items = locationResponse.data.response.body.items.item;

            setPlace(items)

        }catch (e){
            console.error(e)
        }
    }

    const getAround = async (category) =>{
        try{
            const categoryParam = category ? `&contentTypeId=${category}` : '';

            // 반경 5km
            const locationListNum = await axios.get(`http://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}&numOfRows=20&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=E&mapX=126.8889925&mapY=35.168339&radius=5000&listYN=N&_type=JSON${categoryParam}`)
            const locationNum = locationListNum.data.response.body.items.item[0].totalCnt;
            const locationResponse = await axios.get(`http://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}&numOfRows=${locationNum}&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=E&mapX=126.8889925&mapY=35.168339&radius=5000&listYN=Y&_type=JSON${categoryParam}`)
            const items = locationResponse.data.response.body.items.item;

            setPlace(items)

        }catch (e){
            console.error(e)
        }
    }

    useFocusEffect(
        useCallback(() => {
            getAroundList();


            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [])
    );



    const categories = [
        { id: 12, name: '관광지' },
        { id: 14, name: '문화시설' },
        { id: 38, name: '쇼핑' },
        { id: 39, name: '음식점' }
    ];

    const getCategorie = (id) =>{
        switch (id){
            case '12' :
                return "관광지";
            case '14':
                return "문화시설";
            case '38':
                return "쇼핑";
            case '39':
                return "음식점";
            default:
                return "기타";
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
              center: new kakao.maps.LatLng(35.1682414234, 126.8890596255), // 초기 중심 좌표 설정
              level: 5 // 지도 레벨 설정 (확대 정도)
            };
            var map = new kakao.maps.Map(container, options); // 지도 생성
    
            var positions = ${JSON.stringify(place)}; // 일정 정보
            
            // 마커를 지도에 추가하는 함수
            function addMarker(position, imageSrc, size, title, address) {
              var imageSize = new kakao.maps.Size(size.width, size.height); // 마커 크기 설정
              var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); // 마커 이미지 생성
              var marker = new kakao.maps.Marker({
                position: position, // 마커 위치
                image: markerImage // 마커 이미지 설정
              });
              marker.setMap(map); // 지도에 마커 추가
              
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
            
            var markerPosition = new kakao.maps.LatLng(35.1682414234, 126.8890596255); // 마커 위치 설정
                addMarker(markerPosition, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', {width: 34, height: 45}, "광주 기아챔피언스필드", "광주광역시 북구 서림로 10"); // 마커 추가
            
            // 일반 장소 마커 추가
            positions.forEach(function(position) {
                var markerPosition = new kakao.maps.LatLng(position.mapy, position.mapx); // 마커 위치 설정
                addMarker(markerPosition, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', {width: 34, height: 45}, position.title, position.addr1); // 마커 추가
            });
          });
        </script>
      </body>
    </html>
  `;

    const topHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.flexRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>챔피언스 필드 반경 5km</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>
        );
    };

    const handleCategorySelect = (category) => {
        if(category===selectedCategory){
            return;
        }
        setSelectedCategory(category);
        getAround(category);
    };

    const RenderList = ({item}) => {
        return (
            <TouchableOpacity style={styles.renderContainer} onPress={()=>viewInfo(item)}>
                {item.firstimage ? <Image source={{ uri: item.firstimage }} style={styles.image} /> : <Image source={require('../assets/logo.png')} style={styles.nullImage} />}
                <View style={styles.textContainer}>
                    <Text>{item.title}</Text>
                    <Text>{getCategorie(item.contenttypeid)}</Text>
                    <Text>{item.addr1}</Text>
                </View>
            </TouchableOpacity>
        );
    };


    const viewInfo = async (item) =>{
        try {
            const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&contentId=${item.contentid}&defaultYN=Y&_type=JSON&firstImageYN=Y&addrinfoYN=Y&overviewYN=Y&mapinfoYN=Y`);
            const data = response.data.response.body.items.item[0];
            console.log(data)
        } catch (e) {
            console.error(e);
        }

    }


    return (
        <View style={styles.container}>
            {topHeader()}

            {/* 지도 */}
            <View style={styles.mapContainer}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html }}
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View >

            {/* 카테고리 */}
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

            {/* 장소 목록 */}
            <FlatList
                data={place}
                renderItem={({ item }) => <RenderList item={item} />}
                keyExtractor={item => item.contentid}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    mapContainer: {
        height: 300,
        width: '100%',
        position: 'absolute',
        top: 80, // Adjust this value according to your header height
        zIndex: 1,
    },
    contentContainer: {
        paddingTop: 380, // Adjust this value to leave space for the map and category bar
    },
    headerContainer: {
        backgroundColor: '#fff',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 20,
        marginBottom: 10,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        flex: 2,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 380, // This places the category container right below the map
        width: '100%',
        zIndex: 2,
        backgroundColor: '#fff',
        paddingVertical: 10,
    },
    categoryButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    selectedCategoryButton: {
        backgroundColor: '#007bff',
    },
    categoryText: {
        color: '#000',
        fontWeight: 'bold',
    },
    renderContainer:{
        flexDirection: 'row',
        paddingHorizontal:20,
        paddingBottom: 20,
        marginBottom:20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    textContainer: {
        flex: 1,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    nullImage:{
        width: 80,
        height: 80,
        borderRadius: 8,
        opacity: 0.5,
    },
});

export default Userprofile;
