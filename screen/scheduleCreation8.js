import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Image, Modal, TextInput, Alert, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons, AntDesign, FontAwesome, Entypo, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import axios from 'axios';

export default function ScheduleCreation8({ route }) {
    const navigation = useNavigation();
    const [cmtList, setCmtList] = useState(null); // 로딩 상태 추가
    const userInfo = { user_id: 'test', user_nick: 'test' }

    const localhost = '192.168.55.35';

    const scheduleInfo = route.params.scheduleInfo; // 일정 생성 정보
    const plan_seq = route.params.plan_seq;
    console.log(plan_seq)

    // 상단 바
    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={[{ width: '30%', height: '100%' }]}>
                </View>
                <View style={[styles.center, { width: '40%', height: '100%' }]}>
                    <Text style={styles.headerText}>NUVIDA</Text>
                </View>
                <View style={[styles.headerIconContainer, { width: '30%', height: '100%' }]}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => console.log("알림페이지")}>
                        <MaterialCommunityIcons name="bell-plus" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // 일정 정보 표시
    const renderScheduleInfo = () => {
        return (
            <View style={styles.infoContainer}>
                <View style={styles.textContainer}>
                <Text style={styles.text}>일정이 생성되었습니다.</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{scheduleInfo.plan_name}</Text>
                    <Text style={styles.cardText}>기간: {scheduleInfo.dateRange[0].split('T')[0]} - {scheduleInfo.dateRange[1].split('T')[0]}</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("TripSchedule", { userInfo, plan_seq })}>
                        <Text style={styles.actionButtonText}>교통편 등록하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>일정 공유하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // 하단 바
    const renderTabBar = () => {
        return (
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
                    <Entypo name="home" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => console.log("핀볼빵")}>
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
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}

            <ScrollView style={styles.contentContainer}>
                {renderScheduleInfo()}
            </ScrollView>

            {renderTabBar()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    infoContainer: {
        marginBottom: 20,
    },
    card: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    placeCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
    },
    placeImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    placeInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    placeAddr: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    placeTime: {
        fontSize: 12,
        color: '#999',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    actionButton: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f35353',
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    /* 상단바 */
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    /* 하단바 */
    tabBar: {
        height: 70,
        flexDirection: 'row',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        bottom: 10,
    },
    textContainer:{
        paddingVertical:20,
    },
    text:{
        fontSize:20,
        fontWeight:"bold",
        color:"#9e9d9d"
    }
});
