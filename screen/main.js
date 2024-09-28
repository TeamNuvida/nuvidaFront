import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    Linking,
    ImageBackground
} from "react-native";
import { MaterialCommunityIcons, AntDesign, FontAwesome, Entypo, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import PagerView from '@react-native-community/viewpager';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Main({ weather, particulateMatter, store, location }) {

    // API KEY
    const API_KEY = "q9%2BtR1kSmDAYUNoOjKOB3vkl1rLYVTSEVfg4sMDG2UYDAL4KiJo5GaFq9nfn%2FdUnUFjK%2FrOY3UfgJvHtOBAEmQ%3D%3D";

    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
    const [userInfo, setUserInfo] = useState(null);  // 로그인 정보

    // 여행 일정
    const [titlePlan, setTitlePlan] = useState(null); // 대표로 보이는 일정
    // 오늘의 경기
    const [matches, setMatches] = useState(null); // 시합 정보
    const [weatherData, setWeatherData] = useState(weather); // 날씨
    const [particulateMatterData, setParticulateMatterData] = useState(particulateMatter); // 미세먼지
    const [betData, setBetData] = useState(null); // 베팅 정보
    const [userBetData, setUserBetData] = useState(null); // 내가 한 베팅 정보
    const [modalVisible, setModalVisible] = useState(false); // 베팅 팝업창
    const [selectedTeam, setSelectedTeam] = useState(null); // 베팅 팝업창 (팀 선택)
    const [betPoint, setBetPoint] = useState(''); // 베팅 팝업창 (베팅한 포인트)
    // 이번주 경기
    const [weeklyMatchData, setWeeklyMatchData] = useState([]); // 경기 정보
    const [weeklyBetData, setWeeklyBetData] = useState(null); // 베팅 정보
    // 인기 글
    const [boardData, setBoardData] = useState([]);
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const [loadingUser, setLoadingUser] = useState(true); // 로딩 상태 추가

    const [notiState, setNotiState] = useState(false);
    const [season, setSeasonScore] = useState(null);
    const [betScore, setBetScore] = useState(null);

    const scrollViewRef = useRef(null);

    // localhost 주소값
    const localhost = "54.180.146.203";

    const logo = [
        require("../assets/KIA.png"),
        require("../assets/doodan_bears.png"),
        require("../assets/hanwha.png"),
        require("../assets/kiwoom_heroes.png"),
        require("../assets/kt_wiz.png"),
        require("../assets/lgtwins.png") ,
        require("../assets/lotte_giants.png") ,
        require("../assets/nc_dinos.png"),
        require("../assets/samsung_lions.png") ,
        require("../assets/ssg_landers.png"),
        require("../assets/question.png"),
    ];

    useFocusEffect(
        useCallback(() => {
            // 화면이 포커스를 받을 때마다 스크롤을 최상단으로 이동시킵니다.
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ y: 0, animated: true });
            }
        }, [])
    );

    // 유저 정보 테스트용 데이터, 나중에 스토리지에 있는 로그인 정보로 가져오기
    useFocusEffect(
        useCallback(() => {
            const user = async () => {
                try {
                    setUserInfo(null);
                    setIsLoggedIn(false);
                    const storedUserInfo = await AsyncStorage.getItem('userInfo');
                    console.log(JSON.parse(storedUserInfo));
                    if (storedUserInfo) {
                        setUserInfo(JSON.parse(storedUserInfo)); // AsyncStorage에서 불러온 userInfo 설정
                        setIsLoggedIn(true);
                    }else{
                        setUserInfo(null);
                        setIsLoggedIn(false);
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    setLoadingUser(false); // 데이터 로드 완료 후 로딩 상태 false로 변경
                }
            };

            user();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
                // 필요에 따라 추가적인 정리 작업을 여기서 할 수 있습니다.
            };
        }, []) // 빈 배열을 의존성으로 두면, 화면이 포커스를 받을 때마다 실행됩니다.
    );

    const getNotiState = async () => {
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/checkNoti`,{
                user_id: userInfo.user_id
            });
            if(response.data > 0){
                setNotiState(true);
            }else {
                setNotiState(false);
            }
        }catch (e) {
            console.error(e);
        }

    }

    useFocusEffect(
        useCallback(() => {
            if(userInfo){
                getNotiState();
            }else {
                setNotiState(false);
            }
            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [userInfo])
    );

    // 여행 일정
    useEffect(() => {
        const fetchPlanData = async () => {
            try {
                if(userInfo){
                    const response = await axios.post(`http://${localhost}:8090/nuvida/getPlan`,{user_id : userInfo.user_id});
                    setTitlePlan(response.data);
                }else {
                    console.log("여행일정 null임")
                }
            } catch (error) {
                console.error('Error fetching plan data:', error);
            }
        };
        fetchPlanData();
    }, [userInfo]);

    // 오늘의 경기, 베팅 정보 (3초마다 실행)
    useEffect(() => {
        setLoading(true)
        const fetchData = () => {
            fetchBetData();
            fetchMatchData();

        };

        fetchData();

        const intervalId = setInterval(fetchData, 3000); // 3초마다 fetchData 함수 호출
        return () => clearInterval(intervalId);
    }, []);

    // 오늘의 경기
    const fetchMatchData = async () => {
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getMatch`);
            setMatches(response.data);

            const getSession = await axios.post(`http://${localhost}:8090/nuvida/getSeason`);
            setSeasonScore(getSession.data);
        } catch (error) {
            console.error(error)
        }
    };

    // 오늘의 베팅
    const fetchBetData = async () => {
        try{
            const matches = await axios.post(`http://${localhost}:8090/nuvida/getMatch`)
            const response = await axios.post(`http://${localhost}:8090/nuvida/getBtPoin`, {bs_seq:matches.data.bs_seq});
            setBetData(response.data);
        }catch (error) {
            console.error(error)

        }finally {
            setLoading(false); // 데이터 로드 완료 후 로딩 상태 false로 변경
        }
    };

   // 유저 배팅 정보
    useFocusEffect(
        useCallback(() => {
            const fetchUserBetData = async () => {
                try{
                    if(userInfo){
                        const matches = await axios.post(`http://${localhost}:8090/nuvida/getMatch`);
                        const response = await axios.post(`http://${localhost}:8090/nuvida/getUserBtPoin`, {bs_seq:matches.data.bs_seq, user_id:userInfo.user_id})
                        setUserBetData(response.data);
                    }else{
                        console.log("배팅null")
                    }
                }catch (e) {
                    console.error(e)

                }
            };

            fetchUserBetData();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [userInfo])
    );


    // 이번주 경기 일정

    useFocusEffect(
        useCallback(() => {
            const fetchWeeklyMatchData = async () => {
                try{
                    const response = await axios.post(`http://${localhost}:8090/nuvida/getWeeklyMatchData`);
                    setWeeklyMatchData(response.data);

                    const getBetScore = await axios.post(`http://${localhost}:8090/nuvida/getBettingScore`);
                    setBetScore(getBetScore.data);
                }catch (error){
                    console.error(error)
                }
            };
            fetchWeeklyMatchData();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [])
    );


    // 인기 글
    useFocusEffect(
        useCallback(() => {
            const fetchBoardData = async () => {
                try{
                    const response = await axios.post(`http://${localhost}:8090/nuvida/hotPost`);
                    setBoardData(response.data);
                }catch (e) {
                    console.error(e)
                }
            };
            fetchBoardData();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [])
    );

    // 상단바 알림 아이콘
    const handleNoticeIconPress = async () => {
        if (isLoggedIn) {
            try{
                const response = await axios.post(`http://${localhost}:8090/nuvida/setNoti`,{user_id:userInfo.user_id});
                navigation.navigate("NoticeList", {noticeList:response.data});
            }catch (e) {
                console.error(e)
            }

        } else {
            navigation.navigate("Signin");
        }
    }

    // 하단바 일정관리 아이콘
    const handlePlanCalendarIconPress = () => {
        if (isLoggedIn) {
            navigation.navigate("TripCalendar",{userInfo:userInfo});
        } else {
            navigation.navigate("Signin");
        }
    };

    // 여행 일정
    const handlePlanContainerPress = () => {
        if (isLoggedIn && titlePlan.plan_seq == null) {
            navigation.navigate("ScheduleCreation1", {userInfo:userInfo});
        } else if (isLoggedIn && titlePlan.plan_seq != null) {
            navigation.navigate("TripSchedule",{userInfo:userInfo, plan_seq:titlePlan.plan_seq});
        } else {
            navigation.navigate("Signin");
        }
    }

    // 베팅 팝업창
    const handleBet = async() => {
        if (betPoint <= 0 ) {
            alert('베팅 포인트를 입력하세요.');
            setBetPoint('');
            return;
        } else if (userInfo.user_point < betPoint){
            alert('포인트가 부족합니다.');
            setBetPoint('');
            return;
        }

        // 유저 배팅 등록
        try{
            if(!userBetData){
                const response = await axios.post(`http://${localhost}:8090/nuvida/setUserBT`, {bs_seq:matches.bs_seq, user_id:userInfo.user_id, selectedTeam:selectedTeam, betPoint:betPoint, user_point:userInfo.user_point});
            }else{
                const response = await axios.post(`http://${localhost}:8090/nuvida/UpDateUserBT`, {bs_seq:matches.bs_seq, user_id:userInfo.user_id, nowPoint:userBetData.bt_point, betPoint:betPoint, user_point:userInfo.user_point});
            }

            // 나중에 유저 정보 저장하는 코드 수정
            const userSet = await axios.post(`http://${localhost}:8090/nuvida/setUser`, {user_id:userInfo.user_id});

            const userInfoString = JSON.stringify(userSet.data);
            await AsyncStorage.setItem('userInfo', userInfoString);

            setUserInfo(userSet.data);
        }catch (error) {
            console.error(error)

        }


        // 다시 배팅 정보 세팅
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/getBtPoin`, {bs_seq:matches.bs_seq});
            setBetData(response.data);
        }catch (error) {
            console.error(error)

        }

        // 다시 유저 배팅 상태 세팅
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/getUserBtPoin`, {bs_seq:matches.bs_seq, user_id:userInfo.user_id})
            setUserBetData(response.data);
        }catch (e) {
            console.error(e)

        }

        setBetPoint('');
        setModalVisible(false);
    };

    // 경기 시작 전 베팅할 팀 선택
    const handleTeamSelect = (team) => {
        setSelectedTeam(team);
        setModalVisible(true);
    };

    // 경기 종료 후 베팅 포인트 획득
    const handleGetPoint = async(getPoint) => {
        const point = userInfo.user_point + getPoint;
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/getPoin`, {bs_seq:matches.bs_seq, user_id:userInfo.user_id, getPoint:point})
            setUserBetData(response.data);

            // 나중에 유저 정보 저장하는 코드 수정
            const userSet = await axios.post(`http://${localhost}:8090/nuvida/setUser`, {user_id:userInfo.user_id});

            const userInfoString = JSON.stringify(userSet.data);
            await AsyncStorage.setItem('userInfo', userInfoString);

            setUserInfo(userSet.data);

            alert('포인트 획득\n내 포인트: ' + point);
        }catch (e) {
            console.error(e)
            alert('잠시 후 다시 시도해주세요. ');

        }

        console.log("얻은 포인트: " + getPoint);
        setSelectedTeam(null);
        setModalVisible(false);
    };

    // 이번주 경기 일정 배팅 아이콘
    const handleWeeklyBetPress = (id) => {
        if (isLoggedIn) {
            console.log(id);
            navigation.navigate("betPage", { id });
        } else {
            navigation.navigate("Signin");
        }
    };



    // 인기 글
    const handlePostPress = async (postSeq) => {
        console.log('postSeq:', postSeq);
        if(isLoggedIn){
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/getCmtInfo`, {post_seq:postSeq});
                console.log(response.data);
                const intResponse = await axios.post(`http://${localhost}:8090/nuvida/getInt`, {post_seq:postSeq, user_id:userInfo.user_id});
                navigation.navigate('CommunityInfo', {cmtInfo:response.data, intTF:intResponse.data, userInfo:userInfo})
            } catch (error) {
                console.error('Error fetching plan data:', error);
            }
        }else {
            navigation.navigate("Signin");
        }
    };

    // 날짜 표시 변경 -> 07/04 (목)
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);

        const padNumber = (num) => (num < 10 ? `0${num}` : num);
        const getDayOfWeek = (date) => {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return days[date.getDay()];
        };
        const month = padNumber(date.getMonth() + 1);
        const day = padNumber(date.getDate());
        const dayOfWeek = getDayOfWeek(date);
        return `${month}/${day} (${dayOfWeek})`;
    };

    // 시간 표시 변경 -> 12 : 00
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const padNumber = (num) => (num < 10 ? `0${num}` : num);
        return `${padNumber(hours)} : ${padNumber(minutes)}`;
    };

    // 날짜 표시 변경 -> 날씨 api
    const formatWeatherDate = (date) => {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);

        return (year + month + day).toString();
    };

    // 시간 표시 변경 -> 날씨 api
    const formatWeatherTime = (date) => {
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);

        if (minutes >= '45') {
            return (hours + '45').toString();
        } else {
            const getHoursTime = date.getHours() - 1;
            const setHoursTime = ('0' + getHoursTime).slice(-2);

            return (setHoursTime + '00').toString();
        }
    };

    // 기준 시간 -> 예측 시간으로 변경
    const formatFcstTime = (base_time) => {
        const hours = parseInt(base_time.slice(0, 2), 10);
        let nextHour = hours + 1;

        if (nextHour >= 24) {
            return "0000";
        } else {
            return nextHour.toString().padStart(2, '0') + "00";
        }
    };

    // 미세먼지 등급 변경 (1 -> 좋음)
    const formatParticulateMatterGrade = (grade) => {
        if (grade === '1') {
            return '좋음';
        } else if (grade === '2') {
            return '보통';
        } else if (grade === '3') {
            return '나쁨';
        } else if (grade === '4') {
            return '매우나쁨';
        } else {
            return '없음';
        }
    };

    // 대표 일정 날짜 표시 변경 -> 2024-05-28
    const formatPlanDate = (date) => {
        if (!date) {
            // date가 null 또는 undefined인 경우 빈 문자열 반환
            return '';
        }
        return date.split(' ')[0];
    }

    // 대표 일정 D-Day 계산
    const formatDDay = (startTime) => {
        if (!startTime) {
            // startTime이 null 또는 undefined인 경우 "D-Day 없음" 또는 다른 기본값 반환
            return 'D-Day 없음';
        }
        const start = new Date();
        const end = new Date(startTime);
        const timeDifference = end - start;
        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        return (daysDifference <= 0)? '여행중' : 'D-' + daysDifference;
    };

    // 베팅 포인트 표시 변환 => %
    const formatBtPoint = (weeklyBetData, point) => {
        if (!weeklyBetData){
            console.log('formatBtPoint betData loading..')
        }
        // return ((point / (weeklyBetData.kiaBtPoint + weeklyBetData.opBtPoint)) * 100).toFixed(2);

        const totalPoints = weeklyBetData.kiaBtPoint + weeklyBetData.opBtPoint;

        const percentage = (point / totalPoints) * 100;

        // percentage가 NaN이면 0을 반환
        return isNaN(percentage) ? 0 : percentage.toFixed(2);
    };


    const BtPointPersent = (totalPoint, point) => {


        const percentage = (point / totalPoint) * 100;

        // percentage가 NaN이면 0을 반환
        return isNaN(percentage) ? 0 : percentage.toFixed(0);
    };

    // 상단 바
    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={[{width: '30%', height: '100%',}]}>
                </View>
                <View style={[styles.center, {width: '40%', height: '100%',}]}>
                    <Text style={styles.headerText}>NUVIDA</Text>
                </View>
                <View style={[styles.headerIconContainer, {width: '30%', height: '100%',}]}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('BaseballSchedule')}>
                        <AntDesign name="calendar" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={handleNoticeIconPress}>
                        {notiState?(
                            <MaterialCommunityIcons name="bell-plus" size={24} color="red" />
                        ):(
                            <MaterialCommunityIcons name="bell-plus" size={24} color="black" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // 대표 여행 일정
    const renderMainPlan = () => {
        return (
            <TouchableOpacity style={[styles.center, {width: '100%', marginTop: 10}]} onPress={handlePlanContainerPress}>
                {!isLoggedIn || !titlePlan || !titlePlan.plan_name ? (
                    <View style={[styles.center, styles.planContainer]}>
                        <Image source={require('../assets/plus.png')} style={styles.planIcon} />
                        <Text style={styles.planText}>새로운 일정을 생성해주세요</Text>
                    </View>
                ) : (
                    <View style={[styles.center_row, styles.planContainer]}>
                        {titlePlan.url ? (<Image source={{ uri: titlePlan.url }} style={styles.planImage} />) : (<Image source={require('../assets/planImage.png')} style={styles.planImage} />)}
                        <View style={styles.planContent}>
                            <View style={styles.contentTopSection}>
                                <View style={[styles.center, styles.ddayContainer,]}>
                                    <Text style={styles.ddayText}>{formatDDay(titlePlan.start_date)}</Text>
                                </View>
                                <View style={styles.planNameSection}>
                                    <Text style={styles.planNameText}>{titlePlan.plan_name}</Text>
                                </View>
                            </View>
                            <View style={styles.contentBottomSection}>
                                <Text style={{fontSize: 15}}>{titlePlan.member}인</Text>
                                <Text style={{fontSize: 14}}>{formatPlanDate(titlePlan.start_date)} ~ {formatPlanDate(titlePlan.end_date)}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderSeason = () => {
        return (
            <View style={[styles.center, {width: '100%'}]}>
                <View style={[styles.center, styles.matchDateContainer]}>
                    <Image source={require('../assets/matchDate.png')} style={styles.matchDateImage} />
                    {season && <Text style={styles.matchDateText}>{season[0].ss_title} 순위</Text>}
                </View>
                <View style={[styles.seasonContainer, {alignItems: 'center', justifyContent: 'center'}]}>
                    <View style={{width: '100%', flexDirection: "row", marginTop: '2%'}}>
                        <View style={{width: '10%', alignItems: 'center', marginHorizontal: 5, marginLeft: '7%'}}>
                            <Text style={[styles.seasonContainerText, {fontWeight: 'bold'}]}>순위</Text>
                        </View>
                        <View style={{width: '20%', alignItems: 'center', flexDirection: "row", justifyContent: 'center', marginHorizontal: 5}}>
                            <Text style={[styles.seasonContainerText, {fontWeight: 'bold'}]}>팀</Text>
                        </View>
                        <View style={{width: '15%', alignItems: 'center', marginHorizontal: 5}}>
                            <Text style={[styles.seasonContainerText, {fontWeight: 'bold'}]}>승</Text>
                        </View>
                        <View style={{width: '15%', alignItems: 'center', marginHorizontal: 5}}>
                            <Text style={[styles.seasonContainerText, {fontWeight: 'bold'}]}>패</Text>
                        </View>
                        <View style={{width: '15%', alignItems: 'center', marginHorizontal: 5}}>
                            <Text style={[styles.seasonContainerText, {fontWeight: 'bold'}]}>무</Text>
                        </View>
                    </View>
                    <View style={{width: '90%', height: 0.5, marginVertical: 10, backgroundColor: '#C2C2C2'}} />
                    {season ? (
                        season.map((data, index) => (
                            <View key={index} style={{alignItems: 'center', justifyContent: 'center'}}>
                                <View style={{flexDirection: "row", width: '100%', alignItems: 'center', marginVertical: 5}}>
                                    <View style={{width: '10%', alignItems: 'center', marginHorizontal: 5}}>
                                        <Text style={[styles.seasonText]}>{index + 1}</Text>
                                    </View>
                                    <View style={{width: '20%', flexDirection: "row", justifyContent: 'center', alignItems: 'center', marginHorizontal: 5}}>
                                        <Image source={logo[Number(data.logo_img)]} style={styles.seasonTeam} />
                                        <Text style={[styles.seasonText]}>{data.team_name}</Text>
                                    </View>
                                    <View style={{width: '15%', alignItems: 'center', marginHorizontal: 5}}>
                                        <Text style={[styles.seasonText]}>{data.win}</Text>
                                    </View>
                                    <View style={{width: '15%', alignItems: 'center', marginHorizontal: 5}}>
                                        <Text style={[styles.seasonText]}>{data.lose}</Text>
                                    </View>
                                    <View style={{width: '15%', alignItems: 'center', marginHorizontal: 5}}>
                                        <Text style={[styles.seasonText]}>{data.draw}</Text>
                                    </View>
                                </View>
                                <View style={{width: '90%', height: 0.5, marginVertical: 10, backgroundColor: '#C2C2C2'}} />
                            </View>
                        ))
                    ) : (
                        <Text style={[styles.seasonText]}>경기 결과가 없습니다.</Text>
                    )}
                </View>
            </View>
        );
    };

    // 오늘의 경기
    const renderTodayMatch = () => {
        return (
            <View style={[styles.center, {width: '100%',}]}>
                <View style={[styles.center, styles.matchDateContainer,]}>
                    <Image source={require('../assets/matchDate.png')} style={styles.matchDateImage} />
                    {matches && <Text style={styles.matchDateText}>{formatDate(matches.match_date)}</Text>}
                </View>
                <View style={[styles.center_row, styles.matchContainer]}>
                    {matches ? (
                        <>
                            <View style={[styles.center, {width: '33%', paddingLeft: 3,}]}>
                                <Image source={require('../assets/KIA.png')} style={[styles.teamLogo,]} />
                                <Text style={styles.teamText}>KIA</Text>
                            </View>
                            <View style={[styles.center, {width: '34%',}]}>
                                <Text style={styles.matchTime}>{formatTime(matches.match_date)}</Text>
                                <View style={styles.center_row}>
                                    <Text style={[styles.score,]}>{matches.score}</Text>
                                    <Text style={[styles.scoreHyphen, {marginRight: 5, marginLeft: 5,}]}>-</Text>
                                    <Text style={[styles.score,]}>{matches.op_score}</Text>
                                </View>
                            </View>
                            <View style={[styles.center, {width: '33%', paddingRight: 3,}]}>
                                <Image source={logo[Number(matches.logo_img)]} style={styles.teamLogo} />
                                <Text style={styles.teamText}>{matches.team_name}</Text>
                            </View>
                        </>
                    ) : (
                        <Text style={{ color: '#fff' }}>Loading match data...</Text>
                    )}
                </View>
                <View style={[styles.center, styles.weatherContainer]}>
                    {renderWeather()}
                </View>
                <Image source={require('../assets/star.png')} style={{ width: 60, height: 40, marginTop: 20, marginBottom: 5 }} />
                <View style={[styles.center, styles.matchDateContainer,]}>
                    <Image source={require('../assets/matchDate.png')} style={styles.matchDateImage} />
                    {matches.state==='0' ? (<Text style={styles.matchDateText}>승리팀 예측</Text>):(
                        matches.state==='1'?(<Text  style={styles.matchDateText}>KIA 승리</Text>):(matches.state==='2'?(<Text style={styles.matchDateText}>{matches.team_name} 승리</Text>):(matches.state==='3'?(<Text style={styles.matchDateText}>동점</Text>):(<Text style={styles.matchDateText}>우천취소</Text>)))
                    )}

                </View>
                <View style={styles.betContainer}>
                    {renderTodayBet()}
                </View>
            </View>
        );
    };

    // 오늘의 경기 (베팅)
    const renderTodayBet = () => {
        const currentTime = new Date();
        // currentTime.setHours(currentTime.getHours() + 9);
        const dateFromString = new Date(matches.match_date);


        if(!isLoggedIn){
                return (
                    <View style={[styles.center_row, {height: '100%', width: '100%'}]}>
                        <View style={{position: 'absolute', borderColor: '#0E1923', borderRadius: 10, borderWidth: 2.5, backgroundColor: '#fff', width: '40%', height: '37%', top: '37%', zIndex: 6, elevation: 5,}}>
                            <View style={[styles.center_row, {width: '100%', height: '100%'}]}>
                                <View style={[styles.center, {width: '37%', height: '100%', marginLeft: '3%'}]}>
                                    <Image source={require('../assets/KIA.png')} style={[{width: '90%', height: '81%'}]} />
                                </View>
                                <View style={[styles.center, {width: '20%', height: '100%',}]}>
                                    <Text style={{fontSize: 20, fontWeight: 'bold'}}>vs</Text>
                                </View>
                                <View style={[styles.center, {width: '37%', height: '100%', marginRight: '3%'}]}>
                                    <Image source={logo[Number(matches.logo_img)]} style={{width: '90%', height: '81%'}} />
                                </View>
                            </View>
                        </View>
                        <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderRightWidth: 1, zIndex: 5}}>
                            <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: '12%', height: '100%', marginLeft: '5%'}}>
                                        <FontAwesome name="star" size={22} color="#FFC107" />
                                        <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', left: '25%'}}>P</Text>
                                    </View>
                                    <View style={{width: '80%', height: '100%', marginLeft: '3%'}}>
                                        <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.kiaBtPoint}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                    <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.kiaBtPoint)}%</Text>
                                </View>
                                <View style={{width: '35%', height: '100%',}}></View>
                            </View>
                        </View>
                        <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderLeftWidth: 1, zIndex: 5}}>
                            <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: '80%', height: '100%', marginRight: '3%', alignItems:'flex-end'}}>
                                        <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.opBtPoint}</Text>
                                    </View>
                                    <View style={{width: '12%', height: '100%', marginRight: '5%'}}>
                                        <FontAwesome name="star" size={22} color="#FFC107" />
                                        <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', right: '25%'}}>P</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                <View style={{width: '35%', height: '100%',}}></View>
                                <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                    <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.opBtPoint)}%</Text>
                                </View>
                            </View>
                        </View>

                        {currentTime < dateFromString && (
                            <TouchableOpacity style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', right: '57%', backgroundColor: '#0E1923', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} onPress={() => navigation.navigate("Signin")}>
                                <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>KIA 예측</Text>
                            </TouchableOpacity>
                        )}
                        {currentTime < dateFromString && (
                        <TouchableOpacity style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', left: '57%', backgroundColor: '#0E1923', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} onPress={() => navigation.navigate("Signin")} >
                            <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>{matches.team_name} 예측</Text>
                        </TouchableOpacity>
                        )}
                    </View>
                )};



        if (!betData) {
            return <Text>Loading match data...</Text>;
        }


        // 경기 시작 전
        if (currentTime < dateFromString) {
            if (!userBetData) {
                return renderBeforeMatch();
            } else {
                return renderAdditionalBet();
            }
        } else if (currentTime >= dateFromString && matches.state == '0') {
            // 경기 중
            if (!userBetData) {
                return (
                    <View style={[styles.center_row, {height: '100%', width: '100%'}]}>
                        <View style={{position: 'absolute', borderColor: '#0E1923', borderRadius: 10, borderWidth: 2.5, backgroundColor: '#fff', width: '40%', height: '37%', top: '37%', zIndex: 6, elevation: 5,}}>
                            <View style={[styles.center_row, {width: '100%', height: '100%'}]}>
                                <View style={[styles.center, {width: '37%', height: '100%', marginLeft: '3%'}]}>
                                    <Image source={require('../assets/KIA.png')} style={[{width: '90%', height: '81%'}]} />
                                </View>
                                <View style={[styles.center, {width: '20%', height: '100%',}]}>
                                    <Text style={{fontSize: 20, fontWeight: 'bold'}}>vs</Text>
                                </View>
                                <View style={[styles.center, {width: '37%', height: '100%', marginRight: '3%'}]}>
                                    <Image source={logo[Number(matches.logo_img)]} style={{width: '90%', height: '81%'}} />
                                </View>
                            </View>
                        </View>
                        <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderRightWidth: 1, zIndex: 5}}>
                            <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: '12%', height: '100%', marginLeft: '5%'}}>
                                        <FontAwesome name="star" size={22} color="#FFC107" />
                                        <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', left: '25%'}}>P</Text>
                                    </View>
                                    <View style={{width: '80%', height: '100%', marginLeft: '3%'}}>
                                        <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.kiaBtPoint}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                    <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.kiaBtPoint)}%</Text>
                                </View>
                                <View style={{width: '35%', height: '100%',}}></View>
                            </View>
                        </View>
                        <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderLeftWidth: 1, zIndex: 5}}>
                            <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: '80%', height: '100%', marginRight: '3%', alignItems:'flex-end'}}>
                                        <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.opBtPoint}</Text>
                                    </View>
                                    <View style={{width: '12%', height: '100%', marginRight: '5%'}}>
                                        <FontAwesome name="star" size={22} color="#FFC107" />
                                        <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', right: '25%'}}>P</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                <View style={{width: '35%', height: '100%',}}></View>
                                <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                    <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.opBtPoint)}%</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                        );
            } else {
                return (
                    <View style={[styles.center_row, {height: '100%', width: '100%'}]}>
                        <View style={{position: 'absolute', borderColor: '#0E1923', borderRadius: 10, borderWidth: 2.5, backgroundColor: '#fff', width: '40%', height: '37%', top: '37%', zIndex: 6, elevation: 5,}}>
                            <View style={[styles.center_row, {width: '100%', height: '100%'}]}>
                                <View style={[styles.center, {width: '37%', height: '100%', marginLeft: '3%'}]}>
                                    <Image source={require('../assets/KIA.png')} style={[{width: '90%', height: '81%'}]} />
                                </View>
                                <View style={[styles.center, {width: '20%', height: '100%',}]}>
                                    <Text style={{fontSize: 20, fontWeight: 'bold'}}>vs</Text>
                                </View>
                                <View style={[styles.center, {width: '37%', height: '100%', marginRight: '3%'}]}>
                                    <Image source={logo[Number(matches.logo_img)]} style={{width: '90%', height: '81%'}} />
                                </View>
                            </View>
                        </View>
                        <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderRightWidth: 1, zIndex: 5}}>
                            <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: '12%', height: '100%', marginLeft: '5%'}}>
                                        <FontAwesome name="star" size={22} color="#FFC107" />
                                        <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', left: '25%'}}>P</Text>
                                    </View>
                                    <View style={{width: '80%', height: '100%', marginLeft: '3%'}}>
                                        <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.kiaBtPoint}</Text>
                                        {userBetData.team_name==="KIA"?(
                                            <Text style={styles.batText}>베팅 포인트 : {userBetData.bt_point}</Text>
                                        ):(
                                            <Text style={styles.batText}>베팅 포인트 : 0</Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                    <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.kiaBtPoint)}%</Text>
                                </View>
                                <View style={{width: '35%', height: '100%',}}></View>
                            </View>
                        </View>
                        <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderLeftWidth: 1, zIndex: 5}}>
                            <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: '80%', height: '100%', marginRight: '3%', alignItems:'flex-end'}}>
                                        <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.opBtPoint}</Text>
                                        {userBetData.team_name==="KIA"?(
                                            <Text style={styles.batText}>베팅 포인트 : 0</Text>
                                        ):(
                                            <Text style={styles.batText}>베팅 포인트 : {userBetData.bt_point}</Text>
                                        )}
                                    </View>
                                    <View style={{width: '12%', height: '100%', marginRight: '5%'}}>
                                        <FontAwesome name="star" size={22} color="#FFC107" />
                                        <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', right: '25%'}}>P</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                <View style={{width: '35%', height: '100%',}}></View>
                                <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                    <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.opBtPoint)}%</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            }


        } else {
            // 경기 종료

            if (!userBetData) {
                // 경기 종료 베팅X
                return (
                    <View style={[styles.center_row, {height: '100%', width: '100%'}]}>
                        <View style={{position: 'absolute', borderColor: '#0E1923', borderRadius: 10, borderWidth: 2.5, backgroundColor: '#fff', width: '40%', height: '37%', top: '37%', zIndex: 6, elevation: 5,}}>
                            <View style={[styles.center_row, {width: '100%', height: '100%'}]}>
                                <View style={[styles.center, {width: '37%', height: '100%', marginLeft: '3%'}]}>
                                    <Image source={require('../assets/KIA.png')} style={[{width: '90%', height: '81%'}]} />
                                </View>
                                <View style={[styles.center, {width: '20%', height: '100%',}]}>
                                    <Text style={{fontSize: 20, fontWeight: 'bold'}}>vs</Text>
                                </View>
                                <View style={[styles.center, {width: '37%', height: '100%', marginRight: '3%'}]}>
                                    <Image source={logo[Number(matches.logo_img)]} style={{width: '90%', height: '81%'}} />
                                </View>
                            </View>
                        </View>
                        <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderRightWidth: 1, zIndex: 5}}>
                            <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: '12%', height: '100%', marginLeft: '5%'}}>
                                        <FontAwesome name="star" size={22} color="#FFC107" />
                                        <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', left: '25%'}}>P</Text>
                                    </View>
                                    <View style={{width: '80%', height: '100%', marginLeft: '3%'}}>
                                        <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.kiaBtPoint}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                    <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.kiaBtPoint)}%</Text>
                                </View>
                                <View style={{width: '35%', height: '100%',}}></View>
                            </View>
                        </View>
                        <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderLeftWidth: 1, zIndex: 5}}>
                            <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                <View style={{flexDirection: 'row'}}>
                                    <View style={{width: '80%', height: '100%', marginRight: '3%', alignItems:'flex-end'}}>
                                        <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.opBtPoint}</Text>
                                    </View>
                                    <View style={{width: '12%', height: '100%', marginRight: '5%'}}>
                                        <FontAwesome name="star" size={22} color="#FFC107" />
                                        <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', right: '25%'}}>P</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                <View style={{width: '35%', height: '100%',}}></View>
                                <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                    <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.opBtPoint)}%</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            } else {
                const totalPoint = betData.kiaBtPoint+betData.opBtPoint;
                let getPoint = 0;

                if(matches.state=='1'){
                    if (userBetData.result=='1' || userBetData.result=='4' ){
                        getPoint = userBetData.bt_point/betData.kiaBtPoint*totalPoint;
                        getPoint = Math.ceil(getPoint);
                    }

                }else if (matches.state=='2'){
                    if (userBetData.result=='1'|| userBetData.result=='4'){
                        getPoint = userBetData.bt_point/betData.opBtPoint*totalPoint;
                        getPoint = Math.ceil(getPoint);
                    }
                } else{
                    getPoint = userBetData.bt_point;
                }


                if(userBetData.result=='4'){
                    return (
                        <View style={[styles.center_row, {height: '100%', width: '100%'}]}>
                            <View style={{position: 'absolute', borderColor: '#0E1923', borderRadius: 10, borderWidth: 2.5, backgroundColor: '#fff', width: '40%', height: '37%', top: '37%', zIndex: 6, elevation: 5,}}>
                                <View style={[styles.center_row, {width: '100%', height: '100%'}]}>
                                    <View style={[styles.center, {width: '37%', height: '100%', marginLeft: '3%'}]}>
                                        <Image source={require('../assets/KIA.png')} style={[{width: '90%', height: '81%'}]} />
                                    </View>
                                    <View style={[styles.center, {width: '20%', height: '100%',}]}>
                                        <Text style={{fontSize: 20, fontWeight: 'bold'}}>vs</Text>
                                    </View>
                                    <View style={[styles.center, {width: '37%', height: '100%', marginRight: '3%'}]}>
                                        <Image source={logo[Number(matches.logo_img)]} style={{width: '90%', height: '81%'}} />
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderRightWidth: 1, zIndex: 5}}>
                                <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{width: '12%', height: '100%', marginLeft: '5%'}}>
                                            <FontAwesome name="star" size={22} color="#FFC107" />
                                            <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', left: '25%'}}>P</Text>
                                        </View>
                                        <View style={{width: '80%', height: '100%', marginLeft: '3%'}}>
                                            <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.kiaBtPoint}</Text>
                                            {matches.state=='1'?(
                                                    <Text style={styles.batText}>획득 포인트: {getPoint}</Text>
                                            ):(
                                                <Text style={styles.batText}>획득 포인트: 0</Text>
                                            )}

                                        </View>
                                    </View>
                                </View>
                                <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                    <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                        <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.kiaBtPoint)}%</Text>
                                    </View>
                                    <View style={{width: '35%', height: '100%',}}></View>
                                </View>
                            </View>
                            <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderLeftWidth: 1, zIndex: 5}}>
                                <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{width: '80%', height: '100%', marginRight: '3%', alignItems:'flex-end'}}>
                                            <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.opBtPoint}</Text>
                                            {matches.state=='1'?(
                                                <Text style={styles.batText}>획득 포인트: 0</Text>

                                            ):(

                                                <Text style={styles.batText}>획득 포인트: {getPoint}</Text>
                                            )}
                                        </View>
                                        <View style={{width: '12%', height: '100%', marginRight: '5%'}}>
                                            <FontAwesome name="star" size={22} color="#FFC107" />
                                            <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', right: '25%'}}>P</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                    <View style={{width: '35%', height: '100%',}}></View>
                                    <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                        <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.opBtPoint)}%</Text>
                                    </View>
                                </View>
                            </View>

                        </View>
                    );

                }else {
                    return (
                        <View style={[styles.center_row, {height: '100%', width: '100%'}]}>
                            <View style={{position: 'absolute', borderColor: '#0E1923', borderRadius: 10, borderWidth: 2.5, backgroundColor: '#fff', width: '40%', height: '37%', top: '37%', zIndex: 6, elevation: 5,}}>
                                <View style={[styles.center_row, {width: '100%', height: '100%'}]}>
                                    <View style={[styles.center, {width: '37%', height: '100%', marginLeft: '3%'}]}>
                                        <Image source={require('../assets/KIA.png')} style={[{width: '90%', height: '81%'}]} />
                                    </View>
                                    <View style={[styles.center, {width: '20%', height: '100%',}]}>
                                        <Text style={{fontSize: 20, fontWeight: 'bold'}}>vs</Text>
                                    </View>
                                    <View style={[styles.center, {width: '37%', height: '100%', marginRight: '3%'}]}>
                                        <Image source={logo[Number(matches.logo_img)]} style={{width: '90%', height: '81%'}} />
                                    </View>
                                </View>
                            </View>
                            <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderRightWidth: 1, zIndex: 5}}>
                                <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{width: '12%', height: '100%', marginLeft: '5%'}}>
                                            <FontAwesome name="star" size={22} color="#FFC107" />
                                            <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', left: '25%'}}>P</Text>
                                        </View>
                                        <View style={{width: '80%', height: '100%', marginLeft: '3%'}}>
                                            <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.kiaBtPoint}</Text>
                                            {matches.state=='1'?(
                                                    <Text style={styles.batText}>획득 포인트: {getPoint}</Text>


                                            ):(
                                                <Text style={styles.batText}>획득 포인트: 0</Text>

                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                    <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                        <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.kiaBtPoint)}%</Text>
                                    </View>
                                    <View style={{width: '35%', height: '100%',}}></View>
                                </View>
                            </View>
                            <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderLeftWidth: 1, zIndex: 5}}>
                                <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={{width: '80%', height: '100%', marginRight: '3%', alignItems:'flex-end'}}>
                                            <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.opBtPoint}</Text>
                                            {matches.state=='1'?(
                                                <Text style={styles.batText}>획득 포인트: 0</Text>

                                            ):(
                                                <Text style={styles.batText}>획득 포인트: {getPoint}</Text>
                                            )}
                                        </View>
                                        <View style={{width: '12%', height: '100%', marginRight: '5%'}}>
                                            <FontAwesome name="star" size={22} color="#FFC107" />
                                            <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', right: '25%'}}>P</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                                    <View style={{width: '35%', height: '100%',}}></View>
                                    <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                                        <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.opBtPoint)}%</Text>
                                    </View>
                                </View>
                            </View>

                            { userBetData.result!='2' ?( matches.state=='1' ?(
                                        <TouchableOpacity style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', right: '57%', backgroundColor: '#0E1923', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} onPress={() => handleGetPoint(getPoint)}>
                                            <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>포인트 획득</Text>
                                        </TouchableOpacity>
                                    ):(
                                        <View style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', right: '57%', backgroundColor: '#808081', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} >
                                            <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>예측 성공</Text>
                                        </View>
                                    )

                            ):(
                                <View style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', right: '57%', backgroundColor: '#808081', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} >
                                <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>예측실패</Text>
                                </View>
                                )}
                            { userBetData.result!='2' ?( matches.state=='1' ?(
                                    <View style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', left: '57%', backgroundColor: '#808081', borderColor: '#fff', borderWidth: 2, borderRadius: 20}}  >
                                        <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>예측 성공</Text>
                                    </View>
                                ): (
                                    <TouchableOpacity style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', left: '57%', backgroundColor: '#0E1923', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} onPress={() => handleGetPoint(getPoint)} >
                                        <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>포인트 얻기</Text>
                                    </TouchableOpacity>
                                        )):(
                                <View style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', left: '57%', backgroundColor: '#808081', borderColor: '#fff', borderWidth: 2, borderRadius: 20}}  >
                                    <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>예측 실패</Text>
                                </View>
                            )}
                        </View>
                    );
                }
            }

        }
    };

    // 오늘의 경기 베팅 (경기 시작 전)
    const renderBeforeMatch = () => {
        return (
            <View style={[styles.center_row, {height: '100%', width: '100%'}]}>
                <View style={{position: 'absolute', borderColor: '#0E1923', borderRadius: 10, borderWidth: 2.5, backgroundColor: '#fff', width: '40%', height: '37%', top: '37%', zIndex: 6, elevation: 5,}}>
                    <View style={[styles.center_row, {width: '100%', height: '100%'}]}>
                        <View style={[styles.center, {width: '37%', height: '100%', marginLeft: '3%'}]}>
                            <Image source={require('../assets/KIA.png')} style={[{width: '90%', height: '81%'}]} />
                        </View>
                        <View style={[styles.center, {width: '20%', height: '100%',}]}>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>vs</Text>
                        </View>
                        <View style={[styles.center, {width: '37%', height: '100%', marginRight: '3%'}]}>
                            <Image source={logo[Number(matches.logo_img)]} style={{width: '90%', height: '81%'}} />
                        </View>
                    </View>
                </View>
                <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderRightWidth: 1, zIndex: 5}}>
                    <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{width: '12%', height: '100%', marginLeft: '5%'}}>
                                <FontAwesome name="star" size={22} color="#FFC107" />
                                <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', left: '25%'}}>P</Text>
                            </View>
                            <View style={{width: '80%', height: '100%', marginLeft: '3%'}}>
                                <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.kiaBtPoint}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                        <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                            <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.kiaBtPoint)}%</Text>
                        </View>
                        <View style={{width: '35%', height: '100%',}}></View>
                    </View>
                </View>
                <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderLeftWidth: 1, zIndex: 5}}>
                    <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{width: '80%', height: '100%', marginRight: '3%', alignItems:'flex-end'}}>
                                <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.opBtPoint}</Text>
                            </View>
                            <View style={{width: '12%', height: '100%', marginRight: '5%'}}>
                                <FontAwesome name="star" size={22} color="#FFC107" />
                                <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', right: '25%'}}>P</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                        <View style={{width: '35%', height: '100%',}}></View>
                        <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                            <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.opBtPoint)}%</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', right: '57%', backgroundColor: '#0E1923', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} onPress={() => handleTeamSelect('KIA')}>
                    <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>KIA 예측</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', left: '57%', backgroundColor: '#0E1923', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} onPress={() => handleTeamSelect(matches.team_name)}>
                    <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>{matches.team_name} 예측</Text>
                </TouchableOpacity>

                {/* 포인트 입력 모달 */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
                            <Text style={{ marginBottom: 10 }}>베팅할 포인트를 입력하세요:</Text>
                            <Text style={{ marginBottom: 10 }}>내 포인트: {userInfo.user_point}</Text>
                            <TextInput
                                style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 }}
                                placeholder="포인트 입력"
                                keyboardType="numeric"
                                value={betPoint}
                                onChangeText={(text) => setBetPoint(text)}
                            />
                            <TouchableOpacity
                                style={{ backgroundColor: selectedTeam === 'KIA' ? '#0E1923' : '#0E1923', padding: 10, borderRadius: 5, alignItems: 'center' }}
                                onPress={handleBet}
                            >
                                <Text style={{ color: 'white' }}>확인</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ backgroundColor: '#ccc', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text>취소</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );}

    // 오늘의 경기 추가 베팅 (경기 시작 전)
    const renderAdditionalBet = () => {
        return (
            <View style={[styles.center_row, {height: '100%', width: '100%'}]}>
                <View style={{position: 'absolute', borderColor: '#0E1923', borderRadius: 10, borderWidth: 2.5, backgroundColor: '#fff', width: '40%', height: '37%', top: '37%', zIndex: 6, elevation: 5,}}>
                    <View style={[styles.center_row, {width: '100%', height: '100%'}]}>
                        <View style={[styles.center, {width: '37%', height: '100%', marginLeft: '3%'}]}>
                            <Image source={require('../assets/KIA.png')} style={[{width: '90%', height: '81%'}]} />
                        </View>
                        <View style={[styles.center, {width: '20%', height: '100%',}]}>
                            <Text style={{fontSize: 20, fontWeight: 'bold'}}>vs</Text>
                        </View>
                        <View style={[styles.center, {width: '37%', height: '100%', marginRight: '3%'}]}>
                            <Image source={logo[Number(matches.logo_img)]} style={{width: '90%', height: '81%'}} />
                        </View>
                    </View>
                </View>
                <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderRightWidth: 1, zIndex: 5}}>
                    <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{width: '12%', height: '100%', marginLeft: '5%'}}>
                                <FontAwesome name="star" size={22} color="#FFC107" />
                                <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', left: '25%'}}>P</Text>
                            </View>
                            <View style={{width: '80%', height: '100%', marginLeft: '3%'}}>
                                <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.kiaBtPoint}</Text>
                                {userBetData.team_name==="KIA"?(
                                    <Text style={styles.batText}>베팅 포인트 : {userBetData.bt_point}</Text>
                                ):(
                                    <Text style={styles.batText}>베팅 포인트 : 0</Text>
                                    )}

                            </View>
                        </View>
                    </View>
                    <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                        <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                            <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.kiaBtPoint)}%</Text>
                        </View>
                        <View style={{width: '35%', height: '100%',}}></View>
                    </View>
                </View>
                <View style={{width: '50%', height: '100%', borderColor: '#0E1923', borderLeftWidth: 1, zIndex: 5}}>
                    <View style={{width: '100%', height: '17%', marginTop: '20%'}}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{width: '80%', height: '100%', marginRight: '3%', alignItems:'flex-end'}}>
                                <Text style={{fontSize: 17, fontWeight: 'bold'}}>{betData.opBtPoint}</Text>
                                {userBetData.team_name==="KIA"?(
                                    <Text style={styles.batText}>베팅 포인트 : 0</Text>
                                ):(
                                    <Text style={styles.batText}>베팅 포인트 : {userBetData.bt_point}</Text>
                                )}
                            </View>
                            <View style={{width: '12%', height: '100%', marginRight: '5%'}}>
                                <FontAwesome name="star" size={22} color="#FFC107" />
                                <Text style={{position: 'absolute', zIndex: 6, fontSize: 17, fontWeight: 'bold', right: '25%'}}>P</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{width: '100%', height: '63%', flexDirection: 'row'}}>
                        <View style={{width: '35%', height: '100%',}}></View>
                        <View style={{width: '65%', height: '100%', alignItems: 'center'}}>
                            <Text style={{fontSize: 37, fontWeight: 'bold',}}>{BtPointPersent(betData.kiaBtPoint+betData.opBtPoint, betData.opBtPoint)}%</Text>
                        </View>
                    </View>
                </View>

                {userBetData.team_name==='KIA'? (
                    <TouchableOpacity style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', right: '57%', backgroundColor: '#0E1923', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} onPress={() => handleTeamSelect(userBetData.team_name)}>
                        <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>추가 베팅하기</Text>
                    </TouchableOpacity>

                ):(
                    <View style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', right: '57%', backgroundColor: '#808081', borderColor: '#fff', borderWidth: 2, borderRadius: 20}}>
                        <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>KIA</Text>
                    </View>
                    )}
                {userBetData.team_name==='KIA'? (
                    <View style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', left: '57%', backgroundColor: '#808081', borderColor: '#fff', borderWidth: 2, borderRadius: 20}}>
                        <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>{matches.team_name}</Text>
                    </View>
                    ):(
        <TouchableOpacity style={{ position: 'absolute', width: '35%', height: 40, zIndex: 6, top: '89%', left: '57%', backgroundColor: '#0E1923', borderColor: '#fff', borderWidth: 2, borderRadius: 20}} onPress={() => handleTeamSelect(userBetData.team_name)}>
            <Text style={{ color: '#fff', fontSize: 14, margin: 'auto', fontWeight: 'bold' }}>추가 베팅하기</Text>
        </TouchableOpacity>)}



                {/* 포인트 입력 모달 */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
                            <Text style={{ marginBottom: 10 }}>베팅할 포인트를 입력하세요:</Text>
                            <Text style={{ marginBottom: 10 }}>내 포인트: {userInfo.user_point}</Text>
                            <TextInput
                                style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 }}
                                placeholder="포인트 입력"
                                keyboardType="numeric"
                                value={betPoint}
                                onChangeText={(text) => setBetPoint(text)}
                            />
                            <TouchableOpacity
                                style={{ backgroundColor: 'gray', padding: 10, borderRadius: 5, alignItems: 'center' }}
                                onPress={handleBet}
                            >
                                <Text style={{ color: 'white' }}>확인</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ backgroundColor: '#ccc', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text>취소</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    };

        // 오늘의 경기 -> 날씨
        const renderWeather = () => {
            let pty = null;
            let sky = null;
            let iconName = '';
            let IconComponent = null;
            let weatherName = '';

            if (!weatherData) {
                return <Text>Loading weather data...</Text>;
            }

            sky = weatherData["SKY"];
            pty = weatherData["PTY"];

            if(pty ==='0'){
                if(sky === '1'){
                    weatherName = '맑음';
                    iconName = 'sun';
                    IconComponent = Feather;
                }else if(sky ==='3'){
                    weatherName = '구름많음';
                    iconName = 'day-cloudy';
                    IconComponent = Fontisto;
                }else{
                    weatherName = '흐림';
                    iconName = 'cloudy';
                    IconComponent = Fontisto;
                }

            } else if (pty === '1'){
                weatherName = '비';
                iconName = 'weather-pouring';
                IconComponent = MaterialCommunityIcons;
            } else if (pty === '2'){
                weatherName = '비 / 눈';
                iconName = 'weather-snowy-rainy';
                IconComponent = MaterialCommunityIcons;
            } else if (pty === '3'){
                weatherName = '눈';
                iconName = 'weather-snowy';
                IconComponent = MaterialCommunityIcons;
            } else if (pty === '5'){
                weatherName = '빗방울';
                iconName = 'weather-rainy';
                IconComponent = MaterialCommunityIcons;
            } else if (pty === '6'){
                weatherName = '비 / 눈';
                iconName = 'weather-snowy-rainy';
                IconComponent = MaterialCommunityIcons;
            } else if (pty === '7'){
                weatherName = '눈날림';
                iconName = 'weather-snowy-heavy';
                IconComponent = MaterialCommunityIcons;
            }else {
                weatherName = '흐림';
                iconName = 'cloudy';
                IconComponent = Fontisto;
            }

            const rain = weatherData.rain ? `${weatherData.rain["1h"]}mm/h` : "강수없음";

            return (
                <View style={[styles.center, {height: '100%'}]}>
                    <View style={[styles.center_row, {height: '50%', paddingBottom: '5%'}]}>
                        <View style={[styles.center_row, styles.tempContainer]}>
                            <View style={[styles.center, {width: '50%', height: '100%', marginLeft: '10%'}]}>
                                <Image source={{uri:`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}} style={{width:100, height:100}}></Image>
                            </View>
                            <View style={[styles.center, { width: '40%', height: '100%'}]}>
                                <Text style={{color: '#fff', fontSize: 15,}}>{weatherData.weather[0].description}</Text>
                                <Text style={{color: '#fff', fontSize: 17, fontWeight: 'bold', marginTop: 5}}>{weatherData.main.temp}℃</Text>
                            </View>
                        </View>
                        <View style={[styles.center, styles.dustContainer]}>
                            {renderParticulateMatter()}
                        </View>

                    </View>
                    <View style={[styles.center_row]}>
                        <View style={[styles.center, {width: '30%', marginLeft: '5%'}]}>
                            <View style={[styles.center, styles.weatherIcon]}>
                                <Entypo name="water" size={30} color="black" style={{zIndex: 6,}}/>
                            </View>
                            <Text style={styles.weatherText}>{rain}</Text>
                        </View>
                        <View style={[styles.center, {width: '30%',}]}>
                            <View style={[styles.center, styles.weatherIcon]}>
                                <MaterialCommunityIcons name="water-percent" size={40} color="black" style={{zIndex: 6,}}/>
                            </View>
                            <Text style={styles.weatherText}>{weatherData.main.humidity}%</Text>
                        </View>
                        <View style={[styles.center, {width: '30%', marginRight:'5%'}]}>
                            <View style={[styles.center, styles.weatherIcon]}>
                                <MaterialCommunityIcons name="navigation-variant" size={30} color="black" style={{zIndex: 6, }}/>
                            </View>
                            <Text style={styles.weatherText}>{weatherData.wind.speed}m/s</Text>

                        </View>

                    </View>

                </View>
            );
        };

    // 미세먼지 정보
    const renderParticulateMatter = () => {
        if (!particulateMatterData) {
            return <Text>Loading weather data...</Text>;
        }
        return (
            <View>
                <View style={{flexDirection: 'row', alignItems: 'center',}}>
                    <Feather name="smile" size={30} color="#fff" />
                    <View style={{justifyContent: 'center', marginLeft: 10}}>
                        <Text style={styles.dustText}>미세먼지</Text>
                        <Text style={styles.dustText}>{formatParticulateMatterGrade(particulateMatterData[0].pm10Grade1h)}</Text>
                    </View>
                </View>
                <View style={[styles.center_row, { marginTop: 10,}]}>
                    <Feather name="smile" size={30} color="#fff" />
                    <View style={{justifyContent: 'center', marginLeft: 10}}>
                        <Text style={styles.dustText}>초미세먼지</Text>
                        <Text style={styles.dustText}>{formatParticulateMatterGrade(particulateMatterData[0].pm25Grade1h)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const goBetting = () =>{
        if(isLoggedIn){
            navigation.navigate('Betting', {userInfo:userInfo})
        }else{
            navigation.navigate("Signin");
        }
    }

    const handleNavi = async (item) => {
        const destination = encodeURIComponent(item.title); // 목적지 이름
        const endLat = item.mapy; // 목적지 위도
        const endLng = item.mapx; // 목적지 경도

        // 카카오맵 길찾기 URL
        const url = `kakaomap://route?ep=${endLat},${endLng}&by=PUBLIC`; // by=FOOT, CAR, PUBLIC 등이 가능합니다.
        const installUrl = 'https://play.google.com/store/apps/details?id=net.daum.android.map';  // 카카오맵 설치 페이지 URL

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
    };

    // 주변 관광지
    const renderLocationList = () => {
        return location.map((page) => {
            // 이미지 소스를 결정
            const isLogo = !page.firstimage || page.firstimage.length === 0;
            const imageSource = isLogo ? require('../assets/logo.png') : { uri: page.firstimage };

            return (
                <View key={page.contentid} style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{
                        width: 200,
                        height: 300, // 전체 컨테이너 크기는 동일하게 유지
                        marginHorizontal: 10,
                        borderRadius: 10,
                        elevation: 3,
                        backgroundColor: '#fff',
                        overflow: 'hidden' // 이미지가 컨테이너를 넘어가지 않도록 처리
                    }}>
                        {isLogo ? (
                            <View style={{ flex: 1 }}>
                                <View style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#fff' // 로고일 때 배경 색상 지정
                                }}>
                                    <Image
                                        source={imageSource}
                                        style={{
                                            width: 130, // 이미지의 고정 너비
                                            height: 130, // 이미지의 고정 높이
                                            resizeMode: 'contain' // 이미지가 컨테이너 안에 맞게 축소
                                        }}
                                    />
                                </View>
                                <View style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)', // 반투명한 검정 배경
                                    padding: 10
                                }}>
                                    <Text style={{
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: 16,
                                        height: 40, // 제목 영역의 고정 높이
                                        overflow: 'hidden'
                                    }}
                                          numberOfLines={2} // 두 줄까지만 표시
                                          ellipsizeMode="tail"
                                    >
                                        {page.title}
                                    </Text>
                                    <Text style={{
                                        color: '#fff',
                                        fontSize: 14,
                                        marginBottom: 10,
                                        height: 20, // 설명 영역의 고정 높이
                                        overflow: 'hidden'
                                    }}
                                          numberOfLines={1} // 한 줄까지만 표시
                                          ellipsizeMode="tail" // 말줄임표를 사용해 텍스트가 넘치는 경우 처리
                                    >
                                        {page.addr1} {page.addr2}
                                    </Text>
                                    <TouchableOpacity style={{
                                        backgroundColor: '#000000',
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        borderRadius: 5,
                                        alignSelf: 'flex-start' // 버튼을 왼쪽으로 정렬
                                    }} onPress={() => handleNavi(page)}>
                                        <Text style={{
                                            color: '#fff',
                                            fontWeight: 'bold'
                                        }}>길찾기</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <ImageBackground
                                source={imageSource}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'flex-end'
                                }}
                            >
                                <View style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.2)', // 반투명한 검정 배경
                                    padding: 10
                                }}>
                                    <Text style={{
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: 16,
                                        height: 40, // 제목 영역의 고정 높이
                                        overflow: 'hidden'
                                    }}
                                          numberOfLines={2} // 두 줄까지만 표시
                                          ellipsizeMode="tail"
                                    >
                                        {page.title}
                                    </Text>
                                    <Text style={{
                                        color: '#fff',
                                        fontSize: 14,
                                        marginBottom: 10,
                                        height: 20, // 설명 영역의 고정 높이
                                        overflow: 'hidden'
                                    }}
                                          numberOfLines={1} // 한 줄까지만 표시
                                          ellipsizeMode="tail" // 말줄임표를 사용해 텍스트가 넘치는 경우 처리
                                    >
                                        {page.addr1} {page.addr2}
                                    </Text>
                                    <TouchableOpacity style={{
                                        backgroundColor: '#000000',
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        borderRadius: 5,
                                        alignSelf: 'flex-start' // 버튼을 왼쪽으로 정렬
                                    }} onPress={() => handleNavi(page)}>
                                        <Text style={{
                                            color: '#fff',
                                            fontWeight: 'bold'
                                        }}>길찾기</Text>
                                    </TouchableOpacity>
                                </View>
                            </ImageBackground>
                        )}
                    </View>
                </View>
            );
        });
    };

    const renderBettingRanking = () => {
        return (
            <View style={{ paddingHorizontal: 20, backgroundColor: '#f9f9f9', marginTop: '3%' }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center', marginTop: 15, marginBottom: 5 }}>
                    <Text style={{ width: '15%', fontWeight: "bold", textAlign: 'center' }}>순위</Text>
                    <Text style={{ width: '35%', fontWeight: "bold", textAlign: 'center' }}>닉네임</Text>
                    <Text style={{ width: '25%', fontWeight: "bold", textAlign: 'center' }}>승리횟수</Text>
                    <Text style={{ width: '25%', fontWeight: "bold", textAlign: 'center' }}>승률</Text>
                </View>
                <View style={{ width: '100%', height: 0.5, alignSelf: 'center', marginBottom: 10, backgroundColor: '#C2C2C2' }} />
                {betScore ? (
                    betScore.map((data, index) => (
                        <View key={index}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: 'center', marginBottom: 15 }}>
                                <Text style={{ width: '15%', textAlign: 'center' }}>{index + 1}위</Text>
                                <Text style={{ width: '35%', textAlign: 'center' }}>{data.user_nick}</Text>
                                <Text style={{ width: '25%', textAlign: 'center' }}>{data.win}</Text>
                                <Text style={{ width: '25%', textAlign: 'center' }}>{data.score_ratio}%</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={{ textAlign: 'center' }}>순위 결과가 없습니다.</Text>
                )}
            </View>
        );
    };

    // 이번주 경기 일정
    const renderWeeklyMatchList = () => {
        return weeklyMatchData.map((page) => (
            <View key={page.bs_seq} style={styles.center}>
                <View style={[styles.center, styles.matchDateContainer]}>
                    <Image source={require('../assets/redBar.png')} style={styles.matchDateImage} />
                    <Text style={styles.matchDateText}>{formatDate(page.match_date)}</Text>
                </View>
                <View style={[styles.center_row, styles.matchScheduleContainer]}>
                    <View key={page.bs_seq}>
                        <View style={styles.center_row}>
                            <View style={[styles.center, {width: '40%',}]}>
                                <Image source={require('../assets/KIA.png')} style={styles.teamLogo} />
                                <Text style={styles.matchScheduleTeam}>KIA</Text>
                            </View>
                            <View style={[styles.center, {width: '20%', paddingBottom: '3%'}]}>
                                <Text style={styles.matchScheduleTime}>{formatTime(page.match_date)}</Text>
                                <Text style={styles.matchHyphen}>VS</Text>
                            </View>
                            <View style={[styles.center, {width: '40%'}]}>
                                <Image source={logo[Number(page.logo_img)]} style={styles.teamLogo} />
                                <Text style={styles.matchScheduleTeam}>{page.team_name}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.center_row, styles.matchScheduleBetContainer,]}>
                    <View key={page.id}>
                        <View style={{ justifyContent: 'center', flexDirection: 'row',}}>
                            <View style={{ width: '65%', justifyContent: 'center'}}>
                                <Text style={styles.betScore}>{formatBtPoint(page,page.kiaBtPoint)}% : {formatBtPoint(page,page.opBtPoint)}%</Text>
                            </View>
                            <View style={{width: '35%',}}>
                                <TouchableOpacity style={[styles.center, styles.betButton]} onPress={() => goBetting()}>
                                    <Text style={styles.betButtonText}>베팅하기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        ));
    };

    // 인기 글
    const renderBoard = () => {
        return boardData.map((post, index) => (
            <View style={styles.center} key={post.post_seq}>
                <TouchableOpacity style={[styles.center, styles.boardContainer]} onPress={() => handlePostPress(post.post_seq)}>
                    <View style={[styles.center_row, styles.boardTopSection]}>
                        <View style={[styles.center, {width: '15%', height: '100%',}]}>
                            {post.profile_img ? (<Image source={{uri:post.profile_img}} style={[styles.profileIcon,]} />) : (<Image source={require('../assets/profile.png')} style={styles.profileIcon} />)}
                        </View>
                        <View style={styles.nickname}>
                            <Text>{post.user_nick}</Text>
                        </View>
                        <View style={[styles.center_row, {width: '35%', height: '100%',}]}>
                            <View style={[styles.center, styles.boardIcon]}>
                                <AntDesign name="heart" size={17} color="black" />
                            </View>
                            <View style={styles.boardCount}>
                                <Text>{post.intCount}</Text>
                            </View>
                            <View style={[styles.center, styles.boardIcon]}>
                                <FontAwesome name="comment-o" size={20} color="black" />
                            </View>
                            <View style={styles.boardCount}>
                                <Text>{post.cmtCount}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.center, styles.boardBottomSection]}>
                        <View style={styles.boardTitle}>
                            <Text style={{fontWeight: 'bold', fontSize: 16,}}>{post.post_title}</Text>
                        </View>
                        <View style={styles.boardContent}>
                            <Text style={{fontSize: 14}}>{post.details}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        ));
    };

    const goChat = () =>{
        if(isLoggedIn){
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

    const goMypage = () =>{
        if(isLoggedIn){
            navigation.navigate('Mypage', {userInfo:userInfo})
        }else{
            navigation.navigate('Signin')
        }
    }

    // 로딩 중일 때 표시할 컴포넌트
    if (loading || loadingUser) {
        console.log("로딩 중")
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (

        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView ref={scrollViewRef} style={{ backgroundColor: "#fff"}}>
                {renderMainPlan()}
                <View style={styles.line} />
                {matches ? (
                 renderTodayMatch()
                    ):(
                        renderSeason()
                    )}
                <View style={[styles.line]} />
                <View style={{flexDirection: 'row'}}>
                    <Ionicons name="baseball-outline" size={24} color="black" style={{marginLeft: '5%'}}/>
                    <TouchableOpacity style={{flexDirection: 'row'}} onPress={()=>navigation.navigate("AroundViewInfo")}>
                    <Text style={{marginLeft: '2%', fontSize: 16, fontWeight: 'bold'}}>경기장 근처 관광지</Text>
                    <MaterialCommunityIcons name="arrow-right" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    style={styles.locationContainer}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {renderLocationList()}
                </ScrollView>

                <View style={styles.line} />
                {weeklyMatchData&&weeklyMatchData.length>0?(
                    <View style={{flexDirection: 'row'}}>
                        <Ionicons name="baseball-outline" size={24} color="black" style={{marginLeft: '5%'}}/>
                        <Text style={{marginLeft: '2%', fontSize: 16, fontWeight: 'bold'}}>이번주 경기 일정</Text>
                    </View>
                ):(
                    <TouchableOpacity style={{flexDirection: 'row'}} onPress={() => goBetting()}>
                        <Ionicons name="baseball-outline" size={24} color="black" style={{marginLeft: '5%'}}/>
                        <Text style={{marginLeft: '2%', fontSize: 16, fontWeight: 'bold'}}>베팅 순위 Top10</Text>
                        <MaterialCommunityIcons name="arrow-right" size={24} color="black" />
                    </TouchableOpacity>
                    )}
                {weeklyMatchData&&weeklyMatchData.length>0?(
                <PagerView style={styles.weeklyContainer}>
                    {renderWeeklyMatchList()}
                </PagerView>
                    ):(
                    renderBettingRanking()
                    )}
                <View style={styles.line} />
                <Text style={styles.subTitle}>인기 글</Text>
                {renderBoard()}
            </ScrollView>
            {renderTabBar()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
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

    subTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: '7%',
    },

    line: {
        width: '90%',
        height: 0.5,
        margin: 'auto',
        marginTop: 35,
        marginBottom: 35,
        backgroundColor: '#C2C2C2'
    },

    planContainer: {
        width: "90%",
        height: 161,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginTop: 15,
        shadowColor: '#000000',  // 그림자
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 1,
        elevation: 5,
    },

    planIcon: {
        width: 30,
        height: 30,
    },

    planText: {
        fontSize: 16,
        paddingTop: 15,
    },

    planImage: {
        width: '33%',
        height: '75%',
        marginLeft: '5%',
        borderRadius: 8,
    },

    planContent: {
        width: '53%',
        height: '75%',
        marginLeft: '4%',
        marginRight: '5%',
    },

    contentTopSection: {
        width: '100%',
        height: '63%',
        flexDirection: 'row',
    },

    contentBottomSection: {
        width: '100%',
        height: '37%',
        paddingLeft: 5,
        justifyContent: 'center',
    },

    ddayContainer: {
        width: '25%',
        height: '40%',
        borderRadius: 30,
        backgroundColor: '#D9D9D9',
    },

    ddayText: {
        fontSize: 13,
        fontWeight: 'bold',
    },

    planNameSection: {
        width: '72%',
        height: '100%',
        marginLeft: '3%',
    },

    planNameText: {
        marginTop: '1%',
        fontSize: 17,
        fontWeight: 'bold',
        marginLeft: 5,
    },

    /* 오늘의 경기 */
    matchDateContainer: {
        width: '52%',
        position: 'relative',
        zIndex: 6,
    },

    matchDateImage: {
        width: 220,
        height: 42,
    },

    matchDateText: {
        position: 'absolute',
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },

    matchTime: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 5,
    },

    matchContainer: {
        width: "90%",
        height: 157,
        backgroundColor: '#0E1923',
        borderRadius: 10,
        marginTop: '-7.5%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
seasonContainer: {
        width: "90%",
        backgroundColor: '#0E1923',
        borderRadius: 10,
        marginTop: '-7.5%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        paddingTop:35,
    },

    teamLogo: {
        width: '87%',
        height: '60%',
        marginTop: '10%',
    },

    teamText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
        marginTop: -7,
        zIndex: 6,
    },

    score: {
        fontSize: 43,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: -10,
    },

    scoreHyphen: {
        fontSize: 40,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 10,
    },

    weatherContainer: {
        width: "90%",
        height: 234,
        backgroundColor: '#0E1923',
        borderRadius: 10,
        marginTop: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },

    tempContainer: {
        width: '57%',
        height: '100%',
        marginRight: '3%',
    },

    dustContainer: {
        width: '40%',
        height: '100%',
        paddingRight: '7%',
    },

    dustText: {
        color: '#fff',
        fontSize: 12,
    },

    weatherIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#a8a8af',
        borderRadius: 50,
    },

    weatherText: {
        color: '#fff',
        fontSize: 13,
        marginTop: 10,
    },

    matchScheduleContainer: {
        width: "90%",
        height: 157,
        borderColor: '#B60000',
        borderWidth: 2,
        borderRadius: 10,
        marginTop: '-7.5%',
    },

    matchScheduleTeam: {
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: '5%'
    },

    matchScheduleTime: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: '40%',
        marginBottom: '5%',
    },

    matchHyphen: {
        fontSize: 30,
        fontWeight: '800',
    },

    matchScheduleBetContainer: {
        width: "90%",
        height: 65,
        borderColor: '#B60000',
        borderWidth: 2,
        borderRadius: 10,
        marginTop: '2.5%',
    },

    weeklyContainer: {
        width: '100%',
        height: 266,
        flexDirection: 'row',
    },

    betScore: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: '10%'
    },

    betButton: {
        width: '85%',
        height: 40,
        backgroundColor: '#B60000',
        borderRadius: 10,
    },

    betButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff'
    },

    boardContainer: {
        width: "90%",
        height: 161,
        borderColor: '#E6E6E6',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: '3%',
        marginBottom: '3%',
    },

    boardTopSection: {
        width: '90%',
        height: '25%',
    },

    boardBottomSection: {
        width: '90%',
        height: '60%',
    },

    profileIcon: {
        width: 30,
        height: 30,
    },

    nickname: {
        fontSize: 15,
        width: '50%',
        height: '100%',
    },

    boardIcon: {
        width: '20%',
        height: '100%',

    },

    boardCount: {
        width: '30%',
        height: '100%',
        fontSize: 13,
        justifyContent: 'center',
        paddingLeft: '3%',

    },

    boardTitle: {
        width: '95%',
        height: '35%',
        justifyContent: 'center',
    },

    boardContent: {
        width: '95%',
        height: '65%',
        justifyContent: 'center'
    },

    /* 상단바 */
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingTop: '10%',
        paddingBottom: '2%',
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







    /* 베팅 */
    betContainer: {
        width: "90%",
        height: 230,
        borderColor: '#0E1923',
        borderWidth: 2,
        borderRadius: 10,
        marginTop: '-7.5%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
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

    locationContainer:{
        width: '100%',
        height: 350,
        flexDirection: 'row',
        marginTop: 10, // 여유 공간 추가
    },

    locationListContainer:{
        width: 200,
        height: 300,
        borderColor: '#070000',
        borderWidth: 2,
        borderRadius: 10,
        marginHorizontal:10,
    },
    locationImg:{
        width:"100%",
        height:150,
        alignSelf:"center",
        marginVertical:10,
        borderRadius: 5,
    },
    nullImg:{
          width:"100%",
          height:150,
          opacity:0.5,
        alignSelf:"center",
        marginVertical:10,
        borderRadius: 5,
    },
    locationTitleText:{
        fontWeight:"bold"
    },
    locationAddrText:{
        color:"#818080",
    },
    locationNavi:{
        width: "40%",
        height: "10%",
        borderRadius: 5,
        backgroundColor: '#f35353',
        alignItems:"center",
        marginTop:10,
    },
    locationNaviText:{
        fontWeight:"bold"
    },
    batText:{
        fontSize: 14,
        fontWeight: 'bold',
    },
    seasonContainerText:{
        fontSize:14,
        color:"#ffffff",
        marginRight:"16%"
    },
    seasonText:{
        fontSize:14,
        color:"#ffffff",
        marginRight:"12%"
    },
    seasonTeam:{
        width:30,
        height:30,
        marginRight:10
    },
    rankingContainer:{
        width: "90%",
        alignSelf:"center",
        borderRadius:5,
        borderWidth:1,
        borderColor:"#0E1923",
        marginTop:15,

    },
    ranking:{
        marginBottom:20
    },
    rankingText:{
        fontSize:15,
        marginRight:"12%"
    }
});

