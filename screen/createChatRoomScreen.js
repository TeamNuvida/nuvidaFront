// src/screens/CreateChatRoomScreen.js
import React, { useState } from 'react';
import {View, TextInput, Button, Alert, TouchableOpacity, StyleSheet, Text} from 'react-native';
import { firestore } from './firebase'; // Firestore 인스턴스 가져오기
import { collection, addDoc } from 'firebase/firestore'; // Firestore 관련 모듈 가져오기
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, AntDesign, FontAwesome, Entypo, Ionicons, Feather, Fontisto } from '@expo/vector-icons';

const CreateChatRoomScreen = ({ route }) => {
    const [roomName, setRoomName] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    const createChatRoom = async () => {
        if(roomName.length===0){
            Alert.alert("", "채팅방 이름을 입력해주세요")
            return ;
        }
        try {
            
            // Firestore에 새 채팅방 추가
            const docRef = await addDoc(collection(firestore, 'chatRooms'), {
                name: roomName,
                password: password || null,
                createdAt: new Date(),
                createUser: userInfo.user_id,
                members: [userInfo.user_id]  // 멤버 목록에 유저 아이디 추가
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
});

export default CreateChatRoomScreen;
