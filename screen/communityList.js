import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView,FlatList, Image, Modal, TextInput, Alert, ActivityIndicator  } from "react-native";
import { MaterialCommunityIcons, AntDesign, FontAwesome, Entypo, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import axios from 'axios';


export default function CommunityList() {
    const navigation = useNavigation();
    const [cmtList, setCmtList] = useState(null); // 로딩 상태 추가
    const userInfo = {user_id:'test', user_nick:'test'}

    const localhost = '192.168.55.35';
    

    useFocusEffect(
        useCallback(() => {
            const getCmtList = async () => {
                try {
                    const response = await axios.post(`http://${localhost}:8090/nuvida/getCmtList`);
                    console.log(response.data);
                    setCmtList(response.data);
                } catch (error) {
                    console.error('Error fetching plan data:', error);
                }
            };

            getCmtList();
        }, [])
    );


    const communityInfo = async (post_seq) =>{
        console.log(post_seq)
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getCmtInfo`, {post_seq:post_seq});
            console.log(response.data);
            const intResponse = await axios.post(`http://${localhost}:8090/nuvida/getInt`, {post_seq:post_seq, user_id:userInfo.user_id});
            navigation.navigate('CommunityInfo', {cmtInfo:response.data, intTF:intResponse.data})
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }

        // navigation.navigate('CommunityInfo')
    }

    const PostItem = ({ item }) => (
        <TouchableOpacity style={styles.postContainer} onPress={() => communityInfo(item.post_seq)}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/high-service-431903-t6.appspot.com/o/imgtest%2Fprofile.png?alt=media&token=668cdcff-3447-406d-a46c-de24b34235e0' }} style={styles.image} />}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.post_title}</Text>
                <Text style={styles.description}>{item.details}</Text>
                <View style={styles.iconContainer}>
                    <View style={styles.iconGroup}>
                        <FontAwesome name="heart-o" size={20} color="red" />
                        <Text style={styles.iconText}>{item.intCount}</Text>
                    </View>
                    <View style={[styles.icon, styles.iconGroup]}>
                        <FontAwesome name="comment-o" size={20} color="black" />
                        <Text style={styles.iconText}>{item.cmtCount}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );


    // 상단 바
    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={[{width: '30%', height: '100%'}]}>
                </View>
                <View style={[styles.center, {width: '40%', height: '100%'}]}>
                    <Text style={styles.headerText}>NUVIDA</Text>
                </View>
                <View style={[styles.headerIconContainer, {width: '30%', height: '100%'}]}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => console.log("알림페이지")}>
                        <MaterialCommunityIcons name="bell-plus" size={24} color="black" />
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
            <TouchableOpacity onPress={()=>navigation.navigate('WritingPost', {user_id:userInfo.user_id})}>
                <View style={styles.newPost}>
                    <Text style={styles.newPostText}>글작성</Text>
                </View>
            </TouchableOpacity>
            {cmtList?(
                <FlatList
                    data={cmtList}
                    renderItem={({ item }) => <PostItem item={item} />}
                    keyExtractor={item => item.post_seq}
                />
            ):(
                <View style={styles.nullItem}>
                    <Text >글 목록이 없습니다.</Text>
                </View>
            )}

            {renderTabBar()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    postContainer: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    icon: {
        marginLeft: 15,
    },

    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconText: {
        marginLeft: 5, // 아이콘과 텍스트 사이의 간격 조정
        fontSize: 14,
        color: '#000',
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
    newPost:{
        marginRight:15,
        marginVertical: 5,
        backgroundColor:'rgb(138,206,255)',
        width: '20%',
        alignItems:'center',
        padding:5,
        alignSelf:"flex-end",
        borderRadius:10,

    },
    newPostText:{
        fontWeight:"bold",
        fontSize:15
    },
    nullItem:{
        alignItems: 'center',
    }
});
