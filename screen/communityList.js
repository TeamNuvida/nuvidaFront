import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView,FlatList, Image, Modal, TextInput, Alert, ActivityIndicator  } from "react-native";
import { MaterialCommunityIcons, AntDesign, FontAwesome, Entypo, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import axios from 'axios';


export default function CommunityList({route}) {
    const navigation = useNavigation();
    const [cmtList, setCmtList] = useState(null);
    const [userInfo, setUserInfo] = useState(route.params.userInfo)

    const [notiState, setNotiState] = useState(false);

    const localhost = "54.180.146.203";
    

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

    const handleNoticeIconPress = async () => {
        if (userInfo) {
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


    const communityInfo = async (post_seq) =>{
        console.log(post_seq)
        if(!userInfo){
            return navigation.navigate("Signin");
        }

        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getCmtInfo`, {post_seq:post_seq});
            console.log(response.data);
            const intResponse = await axios.post(`http://${localhost}:8090/nuvida/getInt`, {post_seq:post_seq, user_id:userInfo.user_id});
            navigation.navigate('CommunityInfo', {cmtInfo:response.data, intTF:intResponse.data})
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }

    }

    const PostItem = ({ item }) => (
        <TouchableOpacity style={styles.postContainer} onPress={() => communityInfo(item.post_seq)}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : <Image source={require('../assets/logo.png')} style={styles.nullImage} />}
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

    const goMypage = () =>{
        if(userInfo){
            navigation.navigate('Mypage', {userInfo:userInfo})
        }else{
            navigation.navigate('Signin')
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
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('PinBall')}>
                    <MaterialCommunityIcons name="billiards-rack" size={24} color="black" />
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

    const handleWriteIngPost = () => {
        if(userInfo){
            navigation.navigate('WritingPost', {userInfo:userInfo});
        }else{
            navigation.navigate('Signin');
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <TouchableOpacity onPress={handleWriteIngPost}>
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
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingHorizontal:30,
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
        opacity:0.5,
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
    newPost:{
        marginRight:20,
        marginTop: 20,
        backgroundColor:'rgb(0,0,0)',
        width: '20%',
        alignItems:'center',
        padding:8,
        alignSelf:"flex-end",
        borderRadius:25,

    },
    newPostText:{
        fontWeight:"bold",
        fontSize:15,
        color:"#ffffff"
    },
    nullItem:{
        alignItems: 'center',
    }
});
