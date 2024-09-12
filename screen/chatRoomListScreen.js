import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TextInput, TouchableOpacity, Modal } from 'react-native';
import { collection, query, orderBy, doc, getDoc, onSnapshot, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';

const ChatRoomListScreen = ({ route }) => {
    const [chatRooms, setChatRooms] = useState([]);
    const [filteredChatRooms, setFilteredChatRooms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isMemberList, setIsMemberList] = useState(true); // 유저가 속한 채팅방 목록인지 여부
    const [selectedRoomName, setSelectedRoomName] = useState(''); // 선택된 채팅방 이름 저장
    const [leaveModalVisible, setLeaveModalVisible] = useState(false); // 나가기 모달 표시 여부
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    useEffect(() => {
        const q = query(collection(firestore, 'chatRooms'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChatRooms(rooms);
            filterChatRooms(rooms, searchQuery, isMemberList); // 필터링된 데이터를 설정
        });

        return () => unsubscribe();
    }, [isMemberList]);

    const filterChatRooms = (rooms, query, isMemberList) => {
        let filtered = rooms.filter(room => room.name.toLowerCase().includes(query.toLowerCase()));

        if (isMemberList) {
            filtered = filtered.filter(room => room.members && room.members.includes(userInfo.user_id));
        }

        setFilteredChatRooms(filtered);
    };

    useEffect(() => {
        filterChatRooms(chatRooms, searchQuery, isMemberList);
    }, [searchQuery, chatRooms, isMemberList]);

    const handleEnterChatRoom = async (roomId, password, createUser, name) => {
        const roomRef = doc(firestore, 'chatRooms', roomId);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
            const roomData = roomDoc.data();

            if (password) {
                setSelectedRoomId(roomId);
                setModalVisible(true);
            } else {
                // 현재 유저가 멤버 리스트에 없으면 추가
                if (!roomData.members || !roomData.members.includes(userInfo.user_id)) {
                    await updateDoc(roomRef, {
                        members: arrayUnion(userInfo.user_id)  // Firestore 배열에 유저 추가
                    });
                }
                navigation.navigate('ChatRoomScreen', { roomId, userInfo, createUser, name });
            }
        }
    };

    const handleCheckPassword = async () => {
        const roomRef = doc(firestore, 'chatRooms', selectedRoomId);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
            const roomData = roomDoc.data();
            if (roomData.password === inputPassword) {
                setModalVisible(false);
                setInputPassword('');

                // 현재 유저가 멤버 리스트에 없으면 추가
                if (!roomData.members || !roomData.members.includes(userInfo.user_id)) {
                    await updateDoc(roomRef, {
                        members: arrayUnion(userInfo.user_id)  // Firestore 배열에 유저 추가
                    });
                }

                navigation.navigate('ChatRoomScreen', { roomId: selectedRoomId, userInfo, createUser: roomData.createUser, name: roomData.name });
            } else {
                Alert.alert('오류', '비밀번호가 틀렸습니다.');
            }
        }
    };

    // 채팅방 나가기 기능
    const handleLeaveRoom = async () => {
        try {
            const roomRef = doc(firestore, 'chatRooms', selectedRoomId);
            await updateDoc(roomRef, {
                members: arrayRemove(userInfo.user_id) // 멤버 리스트에서 유저 제거
            });

            // 멤버 리스트를 다시 가져와서 0명이면 채팅방을 삭제
            const updatedRoomDoc = await getDoc(roomRef);
            const updatedRoomData = updatedRoomDoc.data();

            if (updatedRoomData.members.length === 0) {
                // 멤버가 없으면 채팅방 삭제
                await deleteDoc(roomRef);
                console.log('채팅방 삭제됨');
            }

            setLeaveModalVisible(false);
        } catch (error) {
            console.error('채팅방 나가기 오류:', error);
        }
    };

    const handleLongPressRoom = (roomId, roomName) => {
        setSelectedRoomId(roomId);
        setSelectedRoomName(roomName);
        setLeaveModalVisible(true);
    };

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

    const setState = (state) =>{
        setIsMemberList(state);
        setSearchQuery('');
    }

    return (
        <View style={styles.container}>
            {topHeader()}

            {/* 버튼 추가 - 채팅 목록과 전체 채팅방 사이 전환 */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton,styles.tabTrueButton, isMemberList ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setState(true)}
                >
                    <Text style={isMemberList ? styles.activeTabText : styles.inactiveTabText}>채팅 목록</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabButton,styles.tabFalseButton, !isMemberList ? styles.activeTab : styles.inactiveTab]}
                    onPress={() => setState(false)}
                >
                    <Text style={!isMemberList ? styles.activeTabText : styles.inactiveTabText}>전체 채팅방</Text>
                </TouchableOpacity>
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="채팅방 검색"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <FlatList
                data={filteredChatRooms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatRoomItem}
                        onPress={() => handleEnterChatRoom(item.id, item.password, item.createUser, item.name)}
                        onLongPress={isMemberList ? () => handleLongPressRoom(item.id, item.name) : null}  // isMemberList일 때만 모달 띄우기
                    >
                        <View style={styles.row}>
                            {item.password && (<Entypo name="lock" size={24} color="black" />)}
                            <Text style={styles.chatRoomText}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

            {/* 비밀번호 입력 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>비밀번호 입력</Text>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="비밀번호 입력"
                            value={inputPassword}
                            onChangeText={setInputPassword}
                            secureTextEntry
                        />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.enterButton]}
                                onPress={handleCheckPassword}
                            >
                                <Text style={styles.buttonText}>입장</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 나가기 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={leaveModalVisible}
                onRequestClose={() => setLeaveModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>채팅방: {selectedRoomName}</Text>
                        <Text style={styles.modalText}>채팅방에서 나가시겠습니까?</Text>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setLeaveModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.leaveButton]}
                                onPress={handleLeaveRoom}
                            >
                                <Text style={styles.buttonText}>나가기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={styles.createButtonContainer}>
                <Button
                    title="채팅방 생성"
                    onPress={() => navigation.navigate('CreateChatRoomScreen', { userInfo })}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    tabButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    tabTrueButton:{
        borderTopRightRadius:0,
        borderBottomRightRadius:0,
    },
    tabFalseButton:{
        borderTopLeftRadius:0,
        borderBottomLeftRadius:0,
    },
    activeTab: {
        backgroundColor: '#f00',
    },
    inactiveTab: {
        backgroundColor: '#ddd',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    inactiveTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    searchInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    chatRoomItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chatRoomText: {
        fontWeight: 'bold',
        fontSize: 20,
        marginLeft: 10,
    },
    createButtonContainer: {
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    passwordInput: {
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 8,
        width: '100%',
        borderRadius: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: 'gray',
    },
    enterButton: {
        backgroundColor: 'green',
    },
    leaveButton: {
        backgroundColor: 'red',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
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
});

export default ChatRoomListScreen;
