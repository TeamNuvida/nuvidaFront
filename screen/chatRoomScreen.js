import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
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
    const [modalVisible, setModalVisible] = useState(false); // 모달 표시 여부
    const [modalImage, setModalImage] = useState(null); // 모달에 표시할 이미지
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
            await deleteDoc(doc(firestore, 'chatRooms', roomId));
            navigation.navigate('ChatRoomList', { userInfo: userInfo }); // 삭제 후 목록으로 이동
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
    const renderItem = ({ item }) => {
        const isCurrentUser = item.userId === userInfo.user_id;

        return (
            <View style={{ marginBottom: 20 }}>
                <Text style={[isCurrentUser ? styles.myNick : styles.theirNick]}>{item.userNick}</Text>
                <View style={[styles.messageContainer, isCurrentUser ? styles.myMessage : styles.theirMessage]}>
                    {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
                    {item.imageUrls && item.imageUrls.map((url, index) => (
                        <TouchableOpacity key={index} onPress={() => openImageModal(url)}>
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
    myNick: {
        alignSelf: 'flex-end',
    },
    theirNick: {
        alignSelf: 'flex-start',
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
