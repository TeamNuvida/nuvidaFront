import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {Image, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, FlatList} from "react-native";
import {FontAwesome, Entypo, Ionicons, Feather, AntDesign, MaterialCommunityIcons} from '@expo/vector-icons';
import axios from "axios";




const MypostList = ({route}) => {
    const [activeTab, setActiveTab] = useState('community'); // 'community' or 'comment'

    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    const [postList, setPostList] = useState(null);


    const localhost = "54.180.146.203";



    // 작성한 글 데이터 가져오기
    const getCommunityList = async () => {
        try{
            setPostList([]);
            const response = await axios.post(`http://${localhost}:8090/nuvida/getCommunityList`,{
                user_id: userInfo.user_id
            });
            setPostList(response.data);
        }catch (e) {
            console.error(e);
        }

    }

    // 작성한 댓글 데이터 가져오기
    const getCommentList = async () => {
        try{
            setPostList([]);
            const response = await axios.post(`http://${localhost}:8090/nuvida/getCommentList`,{
                user_id: userInfo.user_id
            });
            setPostList(response.data);
        }catch (e) {
            console.error(e);
        }

    }

    useFocusEffect(
        useCallback(() => {
            if(activeTab === 'community'){
                getCommunityList();
            }else{
                getCommentList();
            }


            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, []) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
    );

    const deletePost = async (postSeq) => {
        try {
            if (activeTab === 'community') {
                await axios.post(`http://${localhost}:8090/nuvida/deletePost`, {
                    post_seq: postSeq,
                    user_id: userInfo.user_id
                });
                getCommunityList();
            } else {
                await axios.post(`http://${localhost}:8090/nuvida/deleteComment`, {
                    post_seq: postSeq,
                    user_id: userInfo.user_id
                });
                getCommentList();
            }
        } catch (e) {
            console.error(e);
        }
    };

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

    const PostItem = ({ item }) => {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ alignItems: "center" }}>
                    <TouchableOpacity style={styles.cardContainer} onPress={() => communityInfo(item.post_seq)}>
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.image} />
                        ) : (
                            <Image
                                source={{
                                    uri: 'https://firebasestorage.googleapis.com/v0/b/high-service-431903-t6.appspot.com/o/imgtest%2Fprofile.png?alt=media&token=668cdcff-3447-406d-a46c-de24b34235e0'
                                }}
                                style={styles.image}
                            />
                        )}
                        <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                                <Text style={styles.titleText}>{item.post_title}</Text>
                                <TouchableOpacity onPress={() => deletePost(item.post_seq)}>
                                    <Feather name="trash-2" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.descriptionText}>{item.details}</Text>
                            <Text style={styles.dateText}>{item.regi_at}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    };

    const CommentItem = ({ item }) => {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ alignItems: "center" }}>
                    <TouchableOpacity style={styles.cardContainer} onPress={() => communityInfo(item.post_seq)}>
                        <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                                <Text style={styles.titleText}>{item.post_title}</Text>
                                <TouchableOpacity onPress={() => deletePost(item.cmt_seq)}>
                                    <Feather name="trash-2" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.descriptionText}>{item.cmt_detail}</Text>
                            <Text style={styles.dateText}>{item.regi_at}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    };


    // 상단 바 컴포넌트
    const topHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.flexRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>NUVIDA</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>
        );
    };

    const handleSetActiveTab = (active) => {
        setActiveTab(active);

        if(active === 'community'){
            getCommunityList();
        } else {
            getCommentList();
        }
        console.log(active)
    }


    return (
        <View style={styles.container}>
            {topHeader()}

                <View style={styles.menuContainer}>
                    <View style={styles.menuBackground}>
                        <TouchableOpacity
                            style={[styles.menu, activeTab === 'community' && styles.activeMenu]}
                            onPress={() => handleSetActiveTab('community')}
                        >

                            <Text style={styles.menuText}>커뮤니티글</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.menu, activeTab === 'comment' && styles.activeMenu]}
                            onPress={() => handleSetActiveTab('comment')}
                        >
                            <Text style={styles.menuText}>작성한 댓글</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {postList?(
                    <FlatList
                        data={postList}
                        renderItem={({ item }) =>
                            activeTab === 'community' ? (
                                <PostItem item={item} />
                            ) : (
                                <CommentItem item={item} />
                            )
                        }
                        keyExtractor={item =>
                            activeTab === 'community'
                                ? item.post_seq
                                : item.cmt_seq
                        }
                    />
                ):(
                    <View style={styles.nullItem}>
                        <Text >작성한 글이 없습니다.</Text>
                    </View>
                )}


        </View>
    );
};

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
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    nullItem:{
    alignItems: 'center',
},

});

export default MypostList;
