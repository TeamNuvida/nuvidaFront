import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {Image, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, FlatList} from "react-native";
import {FontAwesome, Entypo, Ionicons, Feather, AntDesign, MaterialCommunityIcons} from '@expo/vector-icons';
import axios from "axios";

const TravelLog = ({route}) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    const [planList, setPlanList] = useState(null);


    const localhost = '192.168.55.35';

    // 관심 데이터 가져오기
    const getPlanList = async () => {
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/getPlanList`,{
                user_id: userInfo.user_id
            });
            setPlanList(response.data)
        }catch (e) {
            console.error(e);
        }

    }

    useFocusEffect(
        useCallback(() => {
            getPlanList();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, []) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
    );


    // 상단 바 컴포넌트
    const topHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.flexRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>NUVIDA</Text>
                </View>
            </View>
        );
    };


    // 대표 일정 날짜 표시 변경 -> 2024-05-28
    const formatPlanDate = (date) => {
        if (!date) {
            // date가 null 또는 undefined인 경우 빈 문자열 반환
            return '';
        }
        return date.split(' ')[0];
    }

    const TravelCard = ({item}) => {
        return (
            <View style={{alignItems: "center"}}>
                <TouchableOpacity style={styles.cardContainer} onPress={()=>navigation.navigate("TripSchedule",{userInfo:userInfo, plan_seq:item.plan_seq})}>
                    <View style={styles.textContainer}>
                        <Text style={styles.titleText}>{item.plan_name}</Text>
                        <Text style={styles.date}>{formatPlanDate(item.start_date)} ~ {formatPlanDate(item.end_date)}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };


    return (
        <View style={styles.container}>
            {topHeader()}
            {planList && planList.length > 0?(
                <FlatList
                    data={planList}
                    renderItem={({ item }) => <TravelCard item={item} />}
                    keyExtractor={item => item.plan_seq}
                />
            ):(
                <View style={styles.nullItem}>
                    <Text >여행기록이 없습니다.</Text>
                </View>
            )}

        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    /* 하단바 */
    tabBar: {
        height: 50,
        flexDirection: 'row',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    /* 상단바 */
    headerContainer: {
        flexDirection: 'row',
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
        color: 'red',
        textAlign: 'center',
        flex: 2,
    },
    headerIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    headerIcon: {
        width: 26,
        height: 26,
        marginLeft: 10,
        marginRight: 5,
    },
    menuContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    menuBackground: {
        flexDirection: 'row',
        width: '60%',
        height: 40,
        backgroundColor: '#DCDCDC', // Color.colorGainsboro
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 2,
    },
    menu: {
        flex: 1,
        height: 35,
        backgroundColor: '#DCDCDC',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    activeMenu: {
        backgroundColor: '#FFFFFF', // Color.colorWhite
    },
    menuText: {
        color: '#000000', // Color.colorBlack
        lineHeight: 20,
        fontSize: 14, // FontSize.size_sm
        textAlign: 'center',
        fontWeight: '500',
    },
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 2},
        elevation: 3,
        width: '90%',
        marginVertical: 10,
        padding: 15,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    titleText: {
        fontSize: 18,
        marginBottom: 5,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // 양쪽 끝에 배치
        alignItems: 'center', // 수직 정렬
    },
    iconStyle: {
        marginLeft: 10, // 텍스트와 아이콘 사이의 간격 조정 (선택 사항)
    },
    nullItem:{
        alignItems: 'center',
    },

});

export default TravelLog;
