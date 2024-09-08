import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore, storage } from './firebase';
import { collection, orderBy, query, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const ChatRoomScreen = ({ route }) => {
    const roomId = route.params.roomId;
    const createUser = route.params.createUser;
    const userInfo = route.params.userInfo;
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedImages, setSelectedImages] = useState([]); // 여러 이미지 저장
    const navigation = useNavigation();

    // 메시지 가져오기
    const fetchMessages = () => {
        const messagesRef = collection(firestore, 'chatRooms', roomId, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));
        return onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });
    };

    // 채팅방 삭제 함수
    const deleteChatRoom = async () => {
        try {
            // Firestore에서 채팅방 삭제
            await deleteDoc(doc(firestore, 'chatRooms', roomId));
            navigation.navigate('ChatRoomList', {userInfo:userInfo}); // 삭제 후 목록으로 이동
        } catch (error) {
            console.error("채팅방 삭제 중 오류 발생: ", error);
        }
    };

    // 삭제 확인 Alert 함수
    const confirmDelete = () => {
        Alert.alert(
            '채팅방 삭제',
            '채팅방을 삭제하시겠습니까?',
            [
                {
                    text: '취소',
                    onPress: () => console.log('취소됨'),
                    style: 'cancel',
                },
                {
                    text: '확인',
                    onPress: deleteChatRoom, // 삭제 진행
                },
            ],
            { cancelable: false }
        );
    };

    // 메시지 전송 함수
    const sendMessage = async () => {
        if (message.trim() || selectedImages.length > 0) {
            let imageUrls = [];

            // 이미지가 선택되었을 때 이미지 업로드
            if (selectedImages.length > 0) {
                try {
                    for (const uri of selectedImages) {
                        const response = await fetch(uri); // 이미지 파일 가져오기
                        const blob = await response.blob(); // Blob으로 변환
                        const imageRef = ref(storage, `images/${new Date().toISOString()}`); // Firebase Storage 경로 지정
                        await uploadBytes(imageRef, blob); // Storage에 업로드
                        const imageUrl = await getDownloadURL(imageRef); // 업로드된 이미지의 URL 가져오기
                        imageUrls.push(imageUrl);
                    }
                } catch (error) {
                    console.error("이미지 업로드 중 오류 발생: ", error);
                    return;
                }
            }

            // Firestore에 메시지와 이미지 URL 추가
            try {
                const messagesRef = collection(firestore, 'chatRooms', roomId, 'messages');
                await addDoc(messagesRef, {
                    text: message || null,
                    imageUrls: imageUrls.length > 0 ? imageUrls : null,
                    createdAt: new Date(),
                    userId: userInfo.user_id, // 메시지 작성자의 ID
                });

                setMessage('');  // 메시지 초기화
                setSelectedImages([]);  // 선택된 이미지 초기화
            } catch (error) {
                console.error("메시지 전송 중 오류 발생: ", error);
            }
        }
    };

    // 이미지 선택 함수
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true, // 다중 이미지 선택
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uris = result.assets.map(asset => asset.uri); // 선택된 여러 이미지의 URI 추출
            setSelectedImages([...selectedImages, ...uris]); // 선택된 이미지들을 추가
        }
    };

    // 이미지 삭제 함수
    const removeImage = (uri) => {
        const filteredImages = selectedImages.filter(imageUri => imageUri !== uri); // 선택된 이미지에서 해당 이미지를 제외
        setSelectedImages(filteredImages);
    };

    useEffect(() => {
        return fetchMessages();
    }, []);

    // 메시지 렌더링 함수
    const renderItem = ({ item }) => {
        const isCurrentUser = item.userId === userInfo.user_id;

        return (
            <View style={[styles.messageContainer, isCurrentUser ? styles.myMessage : styles.theirMessage]}>
                {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
                {item.imageUrls && item.imageUrls.map((url, index) => (
                    <Image key={index} source={{ uri: url }} style={styles.image} />
                ))}
            </View>
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
                    {createUser === userInfo.user_id ? (
                        <TouchableOpacity onPress={confirmDelete}>
                            <Text style={{ fontWeight: "bold", color: 'red' }}>삭제</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 24 }} />
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {topHeader()}

            {/* 메시지 리스트 */}
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={styles.messageList}
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

            {/* 메시지 입력 및 전송 */}
            <TextInput
                placeholder="메시지 입력"
                value={message}
                onChangeText={setMessage}
                style={styles.input}
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                    <Text style={styles.buttonText}>이미지 선택</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Text style={styles.buttonText}>전송</Text>
                </TouchableOpacity>
            </View>
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
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
    },
    imagePickerButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        flex: 1,
        alignItems: 'center',
        marginRight: 5,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        flex: 1,
        alignItems: 'center',
        marginLeft: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    messageContainer: {
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        maxWidth: '80%',
    },
    myMessage: {
        backgroundColor: 'blue',
        alignSelf: 'flex-end',
    },
    theirMessage: {
        backgroundColor: 'red',
        alignSelf: 'flex-start',
    },
    messageText: {
        color: 'white',
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
    headerContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 20,
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

export default ChatRoomScreen;
