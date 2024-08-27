import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {Image, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, FlatList, Alert} from "react-native";
import {FontAwesome, Entypo, Ionicons, Feather, AntDesign, MaterialCommunityIcons} from '@expo/vector-icons';
import axios from "axios";


const FriendList = ({route}) => {
    const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'
    const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
    const [requestFriend, setRequestFriend] = useState(''); //친구 요청

    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    const [friendList, setFriendList] = useState(null);
    const [filteredFriendList, setFilteredFriendList] = useState(null); // 필터링된 친구 목록 상태

    const localhost = '192.168.55.35';

    // 친구 목록 가져오기
    const getFriendList = async () => {
        try {
            setSearchQuery('');
            setFriendList([]);
            const response = await axios.post(`http://${localhost}:8090/nuvida/getFriend`, {
                user_id: userInfo.user_id
            });
            setFriendList(response.data);
            setFilteredFriendList(response.data); // 초기 필터링된 목록은 전체 목록으로 설정
        } catch (e) {
            console.error(e);
        }
    }

    // 요청 목록 가져오기
    const getRequestList = async () => {
        try{
            setFriendList([]);
            const response = await axios.post(`http://${localhost}:8090/nuvida/getRequestList`,{
                user_id: userInfo.user_id
            });
            setFriendList(response.data);
        }catch (e) {
            console.error(e);
        }

    }

    useFocusEffect(
        useCallback(() => {
            if(activeTab === 'friends'){
                getFriendList();
            } else {
                getRequestList();
            }


            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, []) // 의존성으로 route.params.userInfo를 추가하여, 값이 변경될 때마다 렌더링
    );

    // 검색어에 따라 친구 목록을 필터링하는 함수
    const handleSearch = (query) => {
        setSearchQuery(query);

        if (query === '') {
            setFilteredFriendList(friendList); // 검색어가 없으면 전체 목록 표시
        } else {
            const filteredList = friendList.filter(item =>
                item.user_id.toLowerCase().includes(query.toLowerCase()) ||
                item.user_nick.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredFriendList(filteredList);
        }
    };


    // 검색어에 따라 친구 요청 처리
    const handleRequest = (query) => {
        setRequestFriend(query);
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
                </View>
            </View>
        );
    };

    // 하단 바 컴포넌트
    const bottomHeader = () => {
        return (
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Entypo name="home" size={24} color="black"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <FontAwesome name="calendar-check-o" size={24} color="black"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <FontAwesome name="calendar-check-o" size={24} color="black"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="chatbubbles-outline" size={24} color="black"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Feather name="user" size={24} color="black"/>
                </TouchableOpacity>
            </View>
        );
    };

    const handleSetActiveTab = (active) => {
        setActiveTab(active);

        if(active === 'friends'){
            getFriendList();
        } else {
            getRequestList();
        }
    }

    const delFriend = async (user_id) =>{
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/delFriend`, {
                fr_user: user_id,
                user_id: userInfo.user_id
            });
            Alert.alert('','삭제되었습니다.');
            getFriendList();
        }catch (e) {
            console.error(e)
        }
    }


    const FriendItem = ({ item }) => {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.friendItem}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.profileIcon} />
                    ) : (
                        <Image
                            source={require("../assets/profile.png")}
                            style={styles.profileIcon}
                        />
                    )}
                    <View style={styles.friendInfo}>
                        <Text style={styles.username}>{item.user_id}</Text>
                        <Text style={styles.name}>{item.user_nick}</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteFriendButton} onPress={() => delFriend(item.user_id)}>
                        <Text style={styles.deleteFriendText}>친구 삭제</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    };


    const renderFriendsList = () => (
        <>
            <TextInput
                style={styles.searchBar}
                placeholder="친구 검색"
                placeholderTextColor="#B7B7B7"
                value={searchQuery}
                onChangeText={handleSearch} // 검색어 변경 시 필터링
            />
            {filteredFriendList ? (
                <FlatList
                    data={filteredFriendList}
                    renderItem={({ item }) => <FriendItem item={item} />}
                    keyExtractor={item => item.user_id}
                />
            ) : (
                <View style={styles.nullItem}>
                    <Text>친구 목록이 없습니다.</Text>
                </View>
            )}
        </>
    );


    const requestFr = async () => {
        console.log(requestFriend);
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/requestFriend`, {
                request_id: requestFriend,
                user_id: userInfo.user_id
            });
            if (response.data > 1) {
                Alert.alert('친구 요청 성공', `${requestFriend}님에게 친구 요청을 보냈습니다.`);
            }else if (response.data > 0){
                Alert.alert('친구 요청 실패', '이미 존재하는 친구 입니다.');
            }else{
                Alert.alert('친구 요청 실패','존재하지 않는 회원입니다.')
            }
            setRequestFriend('');
        }catch (e) {
            console.error(e)
        }
    }

    const acceptFriend = async (user_id) => {
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/acceptFriend`, {
                fr_user: user_id,
                user_id: userInfo.user_id
            });
            getRequestList();
        }catch (e) {
            console.error(e)
        }
    }

    const refusalFriend = async (user_id) => {
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/refusalFriend`, {
                fr_user: user_id,
                user_id: userInfo.user_id
            });
            getRequestList();
        }catch (e) {
            console.error(e)
        }
    }


    const RequestItem = ({ item }) => {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.friendItem}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.profileIcon} />
                    ) : (
                        <Image
                            source={require("../assets/profile.png")}
                            style={styles.profileIcon}
                        />
                    )}
                    <View style={styles.friendInfo}>
                        <Text style={styles.username}>{item.user_id}</Text>
                        <Text style={styles.name}>{item.user_nick}</Text>
                    </View>
                    <View style={styles.acceptButtons}>
                        <TouchableOpacity style={styles.acceptButton} onPress={()=>acceptFriend(item.user_id)}>
                            <Text style={styles.acceptButtonText}>확인</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptButton} onPress={()=> refusalFriend(item.user_id)}>
                            <Text style={styles.acceptButtonText}>취소</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    };


    const renderFriendRequests = () => (
        <>
            <TextInput
                style={styles.searchBar}
                placeholder="친구 요청을 보낼 아이디"
                placeholderTextColor="#B7B7B7"
                value={requestFriend}
                onChangeText={handleRequest} // 검색어 변경 시 필터링
            />
            <View style={{alignItems: "center"}}>
                <TouchableOpacity style={styles.requestButton} onPress={() => requestFr()}>
                    <Text style={styles.requestButtonText}>요청</Text>
                </TouchableOpacity>
            </View>
            {friendList?(
                <FlatList
                    data={friendList}
                    renderItem={({ item }) => <RequestItem item={item} />}
                    keyExtractor={item => item.user_id}
                />
            ):(
                <View style={styles.nullItem}>
                    <Text >요청 목록이 없습니다.</Text>
                </View>
            )}
        </>
    );

    return (
        <View style={styles.container}>
            {topHeader()}
            <View style={styles.menuContainer}>
                <View style={styles.menuBackground}>
                    <TouchableOpacity
                        style={[styles.menu, activeTab === 'friends' && styles.activeMenu]}
                        onPress={() => handleSetActiveTab('friends')}
                    >
                        <Text style={styles.menuText}>친구 목록</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.menu, activeTab === 'requests' && styles.activeMenu]}
                        onPress={() => handleSetActiveTab('requests')}
                    >
                        <Text style={styles.menuText}>친구 요청</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {activeTab === 'friends' ? renderFriendsList() : renderFriendRequests()}
            {bottomHeader()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 16,
    },
    searchBar: {
        height: 40,
        borderRadius: 20,
        borderColor: "#B7B7B7",
        borderWidth: 1,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    friendItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    friendInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: "bold",
    },
    name: {
        fontSize: 14,
        color: "#757575",
    },
    deleteFriendButton: {
        backgroundColor: "#DCDCDC",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    deleteFriendText: {
        fontSize: 12,
        color: "#000000",
        fontWeight: "bold",
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
    acceptButtons: {
        flexDirection: "row",
    },
    acceptButton: {
        backgroundColor: "#000000",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginRight: 8,
    },
    acceptButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    requestButton: {
        backgroundColor: "#000000",
        borderRadius: 6,
        width: 50,
        height: 30,
    },
    requestButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 5,
    },
    nullItem:{
        alignItems: 'center',
    },
});

export default FriendList;
