import React, { useEffect, useState, useCallback } from 'react';
import {View, Text, Button, FlatList, StyleSheet, TouchableOpacity, Linking, Image, ScrollView} from 'react-native';
import axios from 'axios';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {WebView} from "react-native-webview";
import {useFocusEffect, useNavigation} from "@react-navigation/native";

const AroundViewInfo = () => {
    const navigation = useNavigation();
    const [places, setPlaces] = useState([]); // 장소 목록
    const [page, setPage] = useState(1); // 현재 페이지
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
    const [isEndReached, setIsEndReached] = useState(false); // 마지막 페이지 여부

    const [selectedCategory, setSelectedCategory] = useState("AT4");

    const apiKey = ''; // 실제 발급받은 API 키로 대체

    const API_KEY = "";


    const categories = [
        { id: "AT4", name: '관광지' },
        { id: "event", name: '행사/공연/축제' },
        { id: "CT1", name: '문화시설' },
        { id: "CE7", name: '카페' },
        { id: "FD6", name: '음식점' },
        { id: "CS2", name: '편의점' },
        { id: "PK6", name: '주차장' },
        { id: "OL7", name: '주유소' },
        { id: "BK9", name: '은행' },
        { id: "AD5", name: '숙박' },
        { id: "HP8", name: '병원' },
        { id: "PM9", name: '약국' },
    ];

    const getCategorie = (id) =>{
        switch (id){
            case 'AT4' :
                return "관광지";
            case 'event':
                return "행사/공연/축제";
            case 'CT1':
                return "문화시설";
            case 'CE7':
                return "카페";
            case 'FD6':
                return "음식점";
            case 'PK6':
                return "주차장";
            case 'CS2':
                return "편의점";
            case 'OL7':
                return "주유소";
            case 'MT1':
                return "대형마트";
            case 'SW8':
                return "지하철";
            case 'BK9':
                return "은행";
            case 'AD5':
                return "숙박";
            case 'HP8':
                return "병원";
            case 'PM9':
                return "약국";
            default:
                return "기타";
        }
    };
    
    const getEvent = async (category)=> {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/[^0-9]/g, '');

        if (isLoading) return; // 이미 로딩 중이거나 마지막 페이지에 도달한 경우, 추가 요청 방지

        setIsLoading(true); // 로딩 시작

        try {
            const eventListNum = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${API_KEY}&numOfRows=20&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=A&listYN=N&eventStartDate=${formattedDate}&_type=JSON&areaCode=5`)
            const eventNum = eventListNum.data.response.body.items.item[0].totalCnt;
            const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/searchFestival1?serviceKey=${API_KEY}&numOfRows=${eventNum}&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&arrange=A&listYN=Y&eventStartDate=${formattedDate}&_type=JSON&areaCode=5`)

            const eventList = response.data.response.body.items.item;

            const list = await Promise.all(eventList.map(async event => {
                // getUrl 함수의 결과를 기다려야 하므로 await 사용
                const placeUrl = await getUrl(event.contentid);

                return {
                    address_name: event.addr1,               // addr1 -> address_name
                    category_group_code: 'event',            // contenttypeid -> category_group_code
                    category_group_name: event.cat1,         // cat1 -> category_group_name
                    category_name: `${event.cat1} > ${event.cat2} > ${event.cat3}`, // 카테고리 이름을 하나로 합침
                    distance: "",                            // 기존 데이터에 없기 때문에 빈 문자열로 설정
                    id: event.contentid,                     // contentid -> id
                    place_name: event.title,                 // title -> place_name
                    road_address_name: event.addr2,          // addr2 -> road_address_name
                    x: event.mapx,                           // mapx -> x
                    y: event.mapy,                           // mapy -> y
                    firstimage: event.firstimage,
                    eventstartdate: event.eventstartdate,
                    eventenddate: event.eventenddate,
                    place_url: placeUrl                      // 비동기 함수로부터 URL을 받아 설정
                };
            }));
            setPlaces(list);

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false); // 로딩 종료
        }

    }

    const getUrl = async (id) => {
        const response = await axios.get(`http://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&MobileOS=AND&MobileApp=NUVIDA&contentId=${id}&defaultYN=Y&_type=JSON&firstImageYN=Y&addrinfoYN=Y&overviewYN=Y&mapinfoYN=Y`)

        const url = response.data.response.body.items.item[0].homepage;
        // 정규식을 사용하여 href 속성 추출
        const hrefMatch = url.match(/href="([^"]*)"/);

        if (hrefMatch && hrefMatch[1]) {
            // 필요에 따라 슬래시 제거 (슬래시가 포함된 경우)
            const extractedUrl = hrefMatch[1].replace(/\/$/, ''); // 마지막 슬래시 제거
            return extractedUrl;
        }else {
            return "";
        }
    }

    const getAround = async (category) =>{
        console.log(category)
        const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${category}&x=126.8890596255&y=35.1682414234&radius=5000&sort=distance&page=1`;

        if (isLoading) return; // 이미 로딩 중이거나 마지막 페이지에 도달한 경우, 추가 요청 방지

        setIsLoading(true); // 로딩 시작

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `KakaoAK ${apiKey}`,
                },
            });
            console.log(response.data.meta)

            // 마지막 페이지에 도달했는지 확인
            if (response.data.meta.is_end) {
                setIsEndReached(true);
            }

            setPlaces(response.data.documents);

            setPage(1); // 현재 페이지 업데이트
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    }

    const searchCafes = async (nextPage = 1, reset = false) => {
        console.log(nextPage, reset)
        const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=${selectedCategory}&x=126.8890596255&y=35.1682414234&radius=5000&sort=distance&page=${nextPage}`;

        if (isLoading || isEndReached) return; // 이미 로딩 중이거나 마지막 페이지에 도달한 경우, 추가 요청 방지

        setIsLoading(true); // 로딩 시작

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `KakaoAK ${apiKey}`,
                },
            });

            console.log(response.data.meta)

            // 마지막 페이지에 도달했는지 확인
            if (response.data.meta.is_end) {
                setIsEndReached(true);
            }

            // 검색을 처음부터 시작할 때 기존 데이터를 리셋
            if (reset) {
                setPlaces(response.data.documents);
            } else {
                // 새로운 데이터를 기존 데이터에 추가
                setPlaces(prevPlaces => [...prevPlaces, ...response.data.documents]);
            }

            setPage(nextPage); // 현재 페이지 업데이트
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };

    useFocusEffect(
        useCallback(() => {
            setIsEndReached(false); // 끝 도달 여부 초기화
            setPage(1); // 페이지 번호 초기화
            getAround(selectedCategory); // 페이지 1에서 다시 검색, 기존 데이터 리셋

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [])
    );

    // FlatList의 onEndReached 이벤트로 다음 페이지 호출
    const handleLoadMore = () => {
        if (!isEndReached && !isLoading) {
            searchCafes(page + 1); // 다음 페이지 호출
        }
    };

    // 특정 장소의 카카오맵 페이지를 열기
    const openPlaceInKakaoMap = (placeUrl) => {
        Linking.openURL(placeUrl).catch(err => console.error("Couldn't load page", err));
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
      level: 5 // 기본 지도 레벨 설정
    };
    var map = new kakao.maps.Map(container, options); // 지도 생성

    var positions = ${JSON.stringify(places)}; // 마커 정보
    
    // LatLngBounds 객체 생성 (마커가 모이는 영역을 계산하기 위한 객체)
    var bounds = new kakao.maps.LatLngBounds();
    
    // 마커를 지도에 추가하는 함수
    function addMarker(position, imageSrc, size, title, address) {
      var imageSize = new kakao.maps.Size(size.width, size.height); // 마커 크기 설정
      var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize); // 마커 이미지 생성
      var markerPosition = new kakao.maps.LatLng(position.y, position.x); // 마커 좌표 생성
      var marker = new kakao.maps.Marker({
        position: markerPosition, // 마커 위치
        image: markerImage // 마커 이미지 설정
      });
      marker.setMap(map); // 지도에 마커 추가

      // LatLngBounds에 마커의 좌표를 추가하여 경계를 계산
      bounds.extend(markerPosition);

      // 마커 클릭 시 커스텀 오버레이 표시
      kakao.maps.event.addListener(marker, 'click', function() {
        var overlayContent = '<div style="padding:10px;background:white;border:1px solid black;">' +
                             '<strong>' + title + '</strong><br>' + 
                             '<span>' + address + '</span>' +
                             '</div>';

        var overlay = new kakao.maps.CustomOverlay({
          content: overlayContent,
          position: markerPosition,
          yAnchor: 2 // 마커 위에 오버레이가 나타나도록 설정
        });

        overlay.setMap(map);

        // 3초 후 오버레이 제거
        setTimeout(function() {
          overlay.setMap(null);
        }, 3000);
      });

      return marker;
    }
    
    // 광주 기아챔피언스필드 마커 추가
    var championFieldPosition = new kakao.maps.LatLng(35.1682414234, 126.8890596255); // 마커 위치 설정
    addMarker({y: 35.1682414234, x: 126.8890596255}, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', {width: 34, height: 45}, "광주 기아챔피언스필드", "광주광역시 북구 서림로 10");
    
    // 다른 마커 추가
    positions.forEach(function(position) {
        addMarker(position, 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', {width: 34, height: 45}, position.place_name, position.address_name);
    });

    // 경계를 설정하여 모든 마커가 보이도록 지도 확대/축소 조정
    map.setBounds(bounds);
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
        setPlaces([]);
        setPage(1);
        setIsEndReached(false); // 끝 도달 여부 초기화
        if(category=='event'){
            getEvent(category);
        }else{
            getAround(category);
        }
        
    };

    const formatDate = (dateString) => {
        // dateString에서 연도, 월, 일 부분을 각각 추출
        const year = dateString.substring(0, 4); // "2024"
        const month = dateString.substring(4, 6); // "10"
        const day = dateString.substring(6, 8); // "10"

        // 원하는 형식으로 결합하여 반환
        return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    };

    const RenderList = ({item}) => {
        return (

            <TouchableOpacity style={styles.renderContainer} onPress={() => openPlaceInKakaoMap(item.place_url)}>
                <View style={styles.textContainer}>
                    <Text style={{fontWeight:"bold", marginBottom:3}}>{item.place_name}</Text>
                    <Text style={{color:"#787878", marginBottom:3}}>{getCategorie(item.category_group_code)}</Text>
                    <Text style={{marginBottom:3}}>{item.address_name}</Text>
                    {item.category_group_code != 'event'&&(<Text style={{fontSize:12, marginBottom:3}}>{item.distance}m</Text>)}
                    {item.category_group_code === 'event'&&(<Text style={{fontSize:12}}>시작날짜 : {formatDate(item.eventstartdate)}</Text>)}
                    {item.category_group_code === 'event'&&(<Text style={{fontSize:12}}>종료날짜 : {formatDate(item.eventenddate)}</Text>)}


                </View>
            </TouchableOpacity>
        );
    };


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

                {/* 카테고리 */}
                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                    </ScrollView>
                </View>
            </View >


            <FlatList
                data={places}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RenderList item={item} />}
                onEndReached={handleLoadMore} // 스크롤이 끝에 도달했을 때 호출
                onEndReachedThreshold={0.01} // 리스트 끝에서 10% 남았을 때 호출
                ListFooterComponent={isLoading ? <Text>Loading...</Text> : null} // 로딩 중일 때 표시
            />
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    placeName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
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
        position: 'relative', // 지도와 카테고리 둘 다 위에 표시
        marginBottom:10,
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // 반투명 배경색으로 카테고리 강조
        paddingVertical: 10,
        position: 'absolute',
        bottom: 0, // 지도 하단에 배치
        width: '100%',
        zIndex: 2, // 지도 위에 표시되도록 zIndex 설정
    },
    categoryButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 50,
        marginHorizontal: 3,
    },
    selectedCategoryButton: {
        backgroundColor: '#007bff',
    },
    categoryText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize:12
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

export default AroundViewInfo;
