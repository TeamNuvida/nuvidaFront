// src/screens/CreateChatRoomScreen.js
import React, {useEffect, useState} from 'react';
import {View, TextInput, Button, Alert, TouchableOpacity, StyleSheet, Text, FlatList} from 'react-native';
import { firestore } from './firebase'; // Firestore 인스턴스 가져오기
import { collection, addDoc } from 'firebase/firestore'; // Firestore 관련 모듈 가져오기
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, AntDesign, FontAwesome, Entypo, Ionicons, Feather, Fontisto } from '@expo/vector-icons';
import Modal from "react-native-modal";
import axios from "axios";

const CreateChatRoomScreen = ({ route }) => {
    const [roomName, setRoomName] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    const [isFriendsModalVisible, setFriendsModalVisible] = useState(false);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const localhost = "54.180.146.203";

    const [friendsList,setFriendsList] = useState(null);


    useEffect(() => {
        const getFriends = async () => {

            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/getFriend`,{user_id:userInfo.user_id});
                setFriendsList(response.data)
            } catch (error) {
                console.error('Error fetching plan data:', error);
            }
        };

        getFriends();
    }, []);

    const toggleFriendsModal = () => {
        setFriendsModalVisible(!isFriendsModalVisible);
    };

    const selectFriend = (friend) => {
        setSelectedFriends([...selectedFriends, friend]);
    };

    const createChatRoom = async () => {
        if(roomName.length===0){
            Alert.alert("", "채팅방 이름을 입력해주세요")
            return ;
        }
        try {

            // selectedFriends에서 user_id 값 추출
            const friendIds = selectedFriends.map(friend => friend.user_id);

            // members 배열에 현재 유저와 친구들의 user_id를 포함
            const members = [userInfo.user_id, ...friendIds];

            // Firestore에 새 채팅방 추가
            const docRef = await addDoc(collection(firestore, 'chatRooms'), {
                name: roomName,
                password: password || null,
                createdAt: new Date(),
                createUser: userInfo.user_id,
                members: members  // 멤버 목록에 유저와 친구들의 user_id 추가
            });

            console.log("채팅방 생성됨: ", docRef.id);  // Firestore에 문서가 생성된 것을 확인
            navigation.navigate('ChatRoomList', {userInfo:userInfo});
        } catch (error) {
            console.error('Error creating chat room: ', error);
        }
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

    const renderFriendItem = ({ item }) => (
        <View style={styles.friendItem}>
            <View style={styles.friendIconContainer}>
                <Entypo name="user" size={24} color="gray" />
            </View>
            <Text style={styles.friendName}>{item.user_nick}</Text>
            <TouchableOpacity style={styles.removeButton} onPress={() => setSelectedFriends(selectedFriends.filter(friend => friend.user_id !== item.user_id))}>
                <Entypo name="cross" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );


    return (
        <View style={styles.container}>
            {topHeader()}
            <TextInput
                placeholder="채팅방 이름"
                value={roomName}
                onChangeText={setRoomName}
            />
            <TextInput
                placeholder="비밀번호 (선택)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.inviteButton} onPress={toggleFriendsModal}>
                <Text style={styles.inviteButtonText}>일행 초대</Text>
            </TouchableOpacity>
            <FlatList
                data={selectedFriends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.user_id} // 고유한 user_id를 키로 사용
            />

            <Modal isVisible={isFriendsModalVisible}>
                <View style={styles.modalContent}>
                    {friendsList&&friendsList.length>0?(
                        friendsList.map(friend => (
                            <View key={friend.user_id} style={styles.friendItem2}>
                                <View style={styles.friendIconContainer}>
                                    <Entypo name="user" size={24} color="gray" />
                                </View>
                                <Text style={styles.friendName}>{friend.user_nick}</Text>
                                {selectedFriends.find(selectedFriend => selectedFriend.user_id === friend.user_id) ? (
                                    <View style={styles.inviteButton3}>
                                        <Text style={styles.invitedText}>초대완료</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.inviteButton2} onPress={() => selectFriend(friend)}>
                                        <Text style={styles.inviteButtonText2}>초대</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    ):(
                        <Text>초대 가능한 친구 목록이 없습니다.</Text>
                    )}
                    <TouchableOpacity style={styles.modalButton} onPress={toggleFriendsModal}>
                        <Text style={styles.modalButtonText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Button title="채팅방 생성" onPress={createChatRoom} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
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
    inviteButton: {
        backgroundColor: '#000000',
        borderRadius: 10,
        marginHorizontal:20,
        alignItems: 'center',
        paddingHorizontal:20,
        paddingVertical:15,
        marginBottom:5
    },
    inviteButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    inviteButton2: {
        backgroundColor: '#000000',
        alignItems: 'center',
        paddingHorizontal:20,
        paddingVertical:5,
        borderRadius:5,
        paddingBottom:7
    },
    inviteButtonText2: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    inviteButton3: {
        alignItems: 'center',
        paddingHorizontal:10,
        paddingVertical:5,
        borderRadius:5,
        paddingBottom:7
    },
    friendIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    friendName: {
        flex: 1,
        fontSize: 16,
    },
    invitedText: {
        color: 'green',
        fontWeight: 'bold',
    },
    modalButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#000000',
        borderRadius: 5,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    cancelButton: {
        backgroundColor: 'black',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal:10,
        marginHorizontal: 20,
        marginVertical:5,
        backgroundColor: '#fff', // 그림자가 잘 보이도록 배경색 추가
        borderRadius: 10, // 모서리 둥글게
        // 그림자 효과 추가
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5, // Android에서의 그림자 효과
    },
    friendItem2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal:20,
        marginVertical:5,
        backgroundColor: '#fff', // 그림자가 잘 보이도록 배경색 추가
        borderRadius: 10, // 모서리 둥글게
        // 그림자 효과 추가
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5, // Android에서의 그림자 효과

    },
});

export default CreateChatRoomScreen;
