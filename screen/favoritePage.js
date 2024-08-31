import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {Image, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, FlatList} from "react-native";
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {FontAwesome, Entypo, Ionicons, Feather, AntDesign, MaterialCommunityIcons} from '@expo/vector-icons';
import axios from "axios";



const FavoriteList = ({route}) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    const [favoritelist, setFavoritelist] = useState(null);

    const localhost = "54.180.146.203";

    // 관심 데이터 가져오기
    const getFavorite = async () => {
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/getFavoriteList`,{
                user_id: userInfo.user_id
            });
            setFavoritelist(response.data)
        }catch (e) {
            console.error(e);
        }

    }

    useFocusEffect(
        useCallback(() => {
            getFavorite();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, []) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
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

    }

    const handleInt = async (post_seq) => {
        const response = await axios.post(`http://${localhost}:8090/nuvida/delInt`, {post_seq:post_seq, user_id:userInfo.user_id});
        getFavorite();

    };

    const PostItem = ({ item }) => (
        <View style={{alignItems: "center"}}>
        <TouchableOpacity style={styles.cardContainer} onPress={() => communityInfo(item.post_seq)}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/high-service-431903-t6.appspot.com/o/imgtest%2Fprofile.png?alt=media&token=668cdcff-3447-406d-a46c-de24b34235e0' }} style={styles.image} />}
            <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{item.post_title}</Text>
                    <TouchableOpacity onPress={()=> handleInt(item.post_seq)}>
                        <AntDesign name="heart" size={24} color="red" style={styles.iconStyle}/>
                    </TouchableOpacity>
                </View>
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
        </View>
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


    return (
        <View style={styles.container}>
            {topHeader()}
            {favoritelist?(
                <FlatList
                    data={favoritelist}
                    renderItem={({ item }) => <PostItem item={item} />}
                    keyExtractor={item => item.post_seq}
                />
            ):(
                <View style={styles.nullItem}>
                    <Text >관심 목록이 없습니다.</Text>
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
        alignItems:"center"
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15,
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitleText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    descriptionText: {
        fontSize: 14,
        color: '#555',
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

    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingRight: 10,
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
    nullItem:{
        alignItems: 'center',
    },

});

export default FavoriteList;
