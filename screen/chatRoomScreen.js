import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Keyboard, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore, storage } from './firebase';
import { collection, orderBy, query, onSnapshot, addDoc, doc, deleteDoc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, AntDesign, SimpleLineIcons, MaterialIcons, FontAwesome, Entypo } from '@expo/vector-icons';
import axios from "axios";

const ChatRoomScreen = ({ route }) => {
    const roomId = route.params.roomId;
    const createUser = route.params.createUser;
    const userInfo = route.params.userInfo;
    const roomName = route.params.name;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedImages, setSelectedImages] = useState([]); // 여러 이미지 저장
    const [modalVisible, setModalVisible] = useState(false); // 모달 표시 여부
    const [modalImage, setModalImage] = useState(null); // 모달에 표시할 이미지
    const navigation = useNavigation();
    const flatListRef = useRef(null); // FlatList의 ref 생성
    const [warning, setWarning] = useState(true);

    const localhost = "54.180.146.203";

    const getUserProfile = async (user_id) => {
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/setUser`, { user_id: user_id });

            if (response.data) {
                return response.data.profile_img;
            } else {
                return null;
            }
        } catch (e) {
            console.error(e)
        }
    }

    // 메시지 가져오기
    const fetchMessages = () => {
        const messagesRef = collection(firestore, 'chatRooms', roomId, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));

        return onSnapshot(q, async (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 각 메시지에 userProfile 추가 (비동기 처리)
            const result_msg = await Promise.all(msgs.map(async (msg) => {
                const userProfile = await getUserProfile(msg.userId);  // 비동기 처리
                return { ...msg, userProfile };  // 프로필을 메시지에 추가
            }));

            // 가공된 메시지를 setMessages에 저장
            setMessages(result_msg);

            // 메시지 목록이 업데이트될 때마다 스크롤을 가장 아래로 이동
            flatListRef.current?.scrollToEnd({ animated: true });
        });
    };

    // 채팅방 삭제 함수
    const deleteChatRoom = async () => {
        try {
            const roomRef = doc(firestore, 'chatRooms', roomId);
            const roomDoc = await getDoc(roomRef);

            if (roomDoc.exists()) {
                const roomData = roomDoc.data();

                // 현재 유저의 user_id를 멤버 리스트에서 제거
                await updateDoc(roomRef, {
                    members: arrayRemove(userInfo.user_id) // 멤버 리스트에서 user_id 제거
                });

                // 멤버 리스트를 다시 가져와서 0명이면 채팅방을 삭제
                const updatedRoomDoc = await getDoc(roomRef);
                const updatedRoomData = updatedRoomDoc.data();

                if (updatedRoomData.members.length === 0) {
                    // 멤버가 없으면 채팅방 삭제
                    await deleteDoc(roomRef);
                    console.log('채팅방 삭제됨');
                }

                // 채팅방 목록으로 이동
                navigation.navigate('ChatRoomList', { userInfo: userInfo });
            }
        } catch (error) {
            console.error("채팅방 나가기 또는 삭제 중 오류 발생: ", error);
        }
    };

    // 삭제 확인 Alert 함수
    const confirmDelete = () => {
        Alert.alert(
            '채팅방 나가기',
            '채팅은 복구되지 않습니다.',
            [
                { text: '취소', style: 'cancel' },
                { text: '확인', onPress: deleteChatRoom },
            ],
            { cancelable: false }
        );
    };

    // 메시지 전송 함수
    const sendMessage = async () => {
        if (message.trim() || selectedImages.length > 0) {
            let imageUrls = [];

            if (selectedImages.length > 0) {
                try {
                    for (const uri of selectedImages) {
                        const response = await fetch(uri);
                        const blob = await response.blob();
                        const imageRef = ref(storage, `images/${new Date().toISOString()}`);
                        await uploadBytes(imageRef, blob);
                        const imageUrl = await getDownloadURL(imageRef);
                        imageUrls.push(imageUrl);
                    }
                } catch (error) {
                    console.error("이미지 업로드 중 오류 발생: ", error);
                    return;
                }
            }

            try {
                const messagesRef = collection(firestore, 'chatRooms', roomId, 'messages');
                await addDoc(messagesRef, {
                    text: message || null,
                    imageUrls: imageUrls.length > 0 ? imageUrls : null,
                    createdAt: new Date(),
                    userId: userInfo.user_id,
                    userNick: userInfo.user_nick,
                });

                setMessage('');
                setSelectedImages([]);
                Keyboard.dismiss(); // 메시지 전송 후 키보드를 내림
                flatListRef.current?.scrollToEnd({ animated: true }); // 메시지 전송 후 스크롤 아래로 이동
            } catch (error) {
                console.error("메시지 전송 중 오류 발생: ", error);
            }
        }
    };

    // 이미지 선택 함수
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uris = result.assets.map(asset => asset.uri);
            setSelectedImages([...selectedImages, ...uris]);
        }
    };

    // 이미지 삭제 함수
    const removeImage = (uri) => {
        const filteredImages = selectedImages.filter(imageUri => imageUri !== uri);
        setSelectedImages(filteredImages);
    };

    // 이미지 확대 모달 열기
    const openImageModal = (imageUri) => {
        setModalImage(imageUri);
        setModalVisible(true);
    };

    useEffect(() => {
        return fetchMessages();
    }, []);


    // 메시지 렌더링 함수
    const renderMessageText = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                return (
                    <Text
                        key={index}
                        style={styles.link}
                        onPress={() => Linking.openURL(part)}
                    >
                        {part}
                    </Text>
                );
            }
            return <Text key={index} style={styles.messageText}>{part}</Text>;
        });
    };

    // 메시지 렌더링 함수
    const renderItem = ({ item }) => {
        const isCurrentUser = item.userId === userInfo.user_id;

        return (
            <View style={[{ marginBottom: 20 }, !isCurrentUser && { flexDirection: 'row' }]}>
                {!isCurrentUser && (item.userProfile ? (
                    <Image style={styles.profile} source={{ uri: item.userProfile }} />
                ) : (
                    <Image style={styles.profile} source={require("../assets/profile.png")} />
                ))}
                <View style={{ marginLeft: 10 }}>
                    {!isCurrentUser && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                            <Image style={styles.baseballImg} source={require('../assets/baseball.png')} />
                            <View style={{ paddingHorizontal: 5 }} />
                            <Text style={[isCurrentUser ? styles.myNick : styles.theirNick]}>{item.userNick}</Text>
                        </View>
                    )}


                    {item.text && <View style={[styles.messageContainer, isCurrentUser ? styles.myMessage : styles.theirMessage]}>
                        {renderMessageText(item.text)}
                    </View>}
                    {item.imageUrls && item.imageUrls.map((url, index) => (
                        <TouchableOpacity key={index} onPress={() => openImageModal(url)} style={isCurrentUser ? styles.myImage : styles.theirImage}>
                            <Image source={{ uri: url }} style={styles.image} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    // 상단 바 컴포넌트
    const topHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.flexRow}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>{roomName}</Text>


                    <TouchableOpacity onPress={confirmDelete}>
                        <Text style={{ fontWeight: "bold", color: 'red' }}>나가기</Text>
                    </TouchableOpacity>

                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {topHeader()}

            {warning&&(
                <View style={styles.warningContainer}>
                    <AntDesign name="warning" size={15} color="red" />
                    <ScrollView>
                        <Text style={styles.warningText}>비방/욕설/음란/광고 등 불건전 행위는 운영 정책에 의거 제재 대상이 되며, 피해가 발생 할 수 있으므로 결제정보 및 개인정보는 절대 타인에게 공개하지 마시기 바랍니다.</Text>
                    </ScrollView>
                </View>
            )}


            {/* 메시지 리스트 */}
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={styles.messageList}
                ref={flatListRef} // FlatList에 ref 추가
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })} // 콘텐츠 크기 변경 시 스크롤 아래로 이동
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })} // 레이아웃 변경 시 스크롤 아래로 이동
            />

            {/* 이미지 미리보기 */}
            {selectedImages.length > 0 && (
                <View style={styles.imagePreviewContainer}>
                    <ScrollView horizontal>
                        {selectedImages.map((uri, index) => (
                            <View key={index} style={styles.imagePreviewWrapper}>
                                <Image source={{ uri }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(uri)}>
                                    <AntDesign name="closecircle" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}


            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={pickImage} >
                    <MaterialCommunityIcons name="file-image-plus-outline" size={40} color="black" style={styles.imagePickerButton} />
                </TouchableOpacity>
                {/* 메시지 입력 및 전송 */}
                <TextInput
                    placeholder=" 입력창..."
                    value={message}
                    onChangeText={setMessage}
                    style={styles.input}
                />
                <TouchableOpacity onPress={sendMessage} >
                    <FontAwesome name="send" size={24} color="white" style={styles.sendButton} />
                </TouchableOpacity>
            </View>

            {/* 이미지 확대 모달 */}
            {modalImage && (
                <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <AntDesign name="close" size={30} color="white" />
                        </TouchableOpacity>
                        <Image source={{ uri: modalImage }} style={styles.modalImage} />
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    messageList: {
        flex: 1,
        padding: 10,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginVertical: 10,
        marginHorizontal: 10,
        width: "70%",
        borderRadius: 50
    },
    shadowContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },  // 위쪽에 그림자를 넣기 위해 음수 값 사용
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        elevation: 5,  // 안드로이드에서 그림자 효과를 주기 위한 옵션
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center', // 수직 중앙 정렬
        marginHorizontal: 10,
        backgroundColor: "#FBFBFB",
        paddingVertical: 10,

    },
    imagePickerButton: {
        alignItems: 'center', // 가로 정렬
        justifyContent: 'center', // 세로 정렬

    },
    sendButton: {
        backgroundColor: '#FF5A5A',
        padding: 12,
        borderRadius: 50,
        justifyContent: 'center', // 세로 정렬
        alignItems: 'center', // 가로 정렬
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    messageContainer: {
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        maxWidth: '80%',               // 컨테이너의 너비를 80%로 설정
        alignSelf: 'flex-start',        // 텍스트가 좌우로 꽉 차지 않도록 설정
        justifyContent: 'center',       // 컨테이너 안에서 수직 중앙 정렬
        marginTop: 10,
        flexWrap: 'wrap',               // 텍스트가 줄을 넘을 경우 자동으로 줄바꿈
        flexDirection: 'row'
    },
    myNick: {
        alignSelf: 'flex-end',
    },
    theirNick: {
        alignSelf: 'flex-start',
        fontWeight: "bold"
    },
    myMessage: {
        backgroundColor: '#ff5a5a',
        alignSelf: 'flex-end',
        borderTopRightRadius: 0,
        marginRight: 10,
        flexWrap: 'wrap',              // 텍스트가 줄을 넘을 경우 자동으로 줄바꿈
    },
    myImage: {
        alignSelf: 'flex-end',
    },
    theirMessage: {
        backgroundColor: '#FBFBFB',
        alignSelf: 'flex-start',
        borderTopLeftRadius: 0,
        borderColor: "#E8E8E8",
        borderWidth: 1,
    },
    theirImage: {
        alignSelf: 'flex-start',
    },
    messageText: {
        flexShrink: 1,
    },
    link: {
        color: '#0645AD',
        textDecorationLine: 'underline',
    },
    theirmessageText: {
        color: '#7E7E7E',
        alignSelf: 'center',
    },
    image: {
        width: 100,
        height: 100,
        marginTop: 10,
    },
    previewImage: {
        width: 100,
        height: 100,
        marginRight: 10,
    },
    imagePreviewWrapper: {
        position: 'relative',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 12,
        backgroundColor: 'white',
        borderRadius: 12,
    },
    imagePreviewContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f9f9f9',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '90%',
        height: '80%',
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        backgroundColor: '#FBFBFB',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 40,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        paddingLeft: 10,
        flex: 2,
    },
    baseballImg: {
        width: 20,
        height: 20
    },
    profile: {
        width: 45,                  // 프로필 이미지 너비
        height: 45,                 // 프로필 이미지 높이
        borderRadius: 22.5,          // 원형으로 만들기 위해 반지름을 이미지 크기의 절반으로 설정
        borderWidth: 2,              // 테두리 두께
        borderColor: 'white',        // 테두리 색상
        shadowColor: '#000',         // 그림자 색상
        shadowOffset: { width: 0, height: 2 },  // 그림자 오프셋
        shadowOpacity: 0.3,          // 그림자 불투명도
        shadowRadius: 3.84,          // 그림자 반경
        elevation: 5,                // 안드로이드 그림자 (그림자 높이)
        marginLeft: 10
    },
    warningContainer:{
        flexDirection:"row",
        borderRadius:5,
        borderWidth:0.2,
        width:"90%",
        height:50,
        padding:10,
        alignSelf:"center",
        alignItems:"center",
        marginVertical:10,

    },
    warningText:{
        fontSize:10,
        paddingLeft:10
    }

});

export default ChatRoomScreen;
