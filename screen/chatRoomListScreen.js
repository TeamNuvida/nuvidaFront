import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, TextInput, TouchableOpacity, Modal } from 'react-native';
import { collection, query, orderBy, doc, getDoc, onSnapshot } from 'firebase/firestore';
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
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    useEffect(() => {
        const q = query(collection(firestore, 'chatRooms'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChatRooms(rooms);
            setFilteredChatRooms(rooms);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const filtered = chatRooms.filter(room =>
            room.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredChatRooms(filtered);
    }, [searchQuery, chatRooms]);

    const handleEnterChatRoom = async (roomId, password, createUser) => {
        if (password) {
            setSelectedRoomId(roomId);
            setModalVisible(true);
        } else {
            navigation.navigate('ChatRoomScreen', { roomId, userInfo, createUser });
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
                // createUser 정보를 함께 전달
                navigation.navigate('ChatRoomScreen', { roomId: selectedRoomId, userInfo, createUser: roomData.createUser });
            } else {
                Alert.alert('오류', '비밀번호가 틀렸습니다.');
            }
        }
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

    return (
        <View style={styles.container}>
            {topHeader()}
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
                    <TouchableOpacity style={styles.chatRoomItem} onPress={() => handleEnterChatRoom(item.id, item.password, item.createUser)}>
                        <View style={styles.row}>
                            {item.password && (<Entypo name="lock" size={24} color="black" />)}
                            <Text style={styles.chatRoomText}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />

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
                        {/* 취소와 입장 버튼을 나란히 배치 */}
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

            <View style={styles.createButtonContainer}>
                <Button
                    title="채팅방 생성"
                    onPress={() => navigation.navigate('CreateChatRoomScreen', {userInfo})}
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
        flexDirection: 'row', // 버튼을 가로로 배치
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5, // 버튼 사이에 여백 추가
    },
    cancelButton: {
        backgroundColor: 'gray',
    },
    enterButton: {
        backgroundColor: 'green',
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
