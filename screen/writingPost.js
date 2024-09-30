import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {Button, Image, View, ScrollView, TextInput, StyleSheet, TouchableOpacity, Text, SafeAreaView, Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import axios from "axios";

// Firebase 프로젝트에서 가져온 구성 객체
const firebaseConfig = {

};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 이미지 업로드 함수
const uploadImageAsync = async (uri) => {
    try {
        // Fetch를 사용하여 이미지를 가져오고 Blob으로 변환
        const response = await fetch(uri);
        const blob = await response.blob();

        // Firebase Storage에 고유한 파일 이름으로 저장
        const filename = uri.split('/').pop();
        const storageRef = ref(storage, `imgtest/${filename}`);

        // Firebase Storage에 파일 업로드
        await uploadBytes(storageRef, blob);

        // 업로드된 파일의 다운로드 URL 가져오기
        const downloadURL = await getDownloadURL(storageRef);

        console.log('File available at:', downloadURL);
        return downloadURL;

    } catch (error) {
        console.error('Error uploading image: ', error);
        throw error;
    }
};

// 메인 앱 컴포넌트
export default function WritingPost({route}) {
    const [images, setImages] = useState([]);
    const [category, setCategory] = useState(1);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [contentHeight, setContentHeight] = useState(100); // 초기 높이 설정
    const [imageUrls, setImageUrls] = useState([]);
    const [isUploading, setIsUploading] = useState(false); // 업로드 상태 관리
    const navigation = useNavigation();
    const userInfo = route.params.userInfo;

    const categories = [
        { id: 1, name: '야구' },
        { id: 2, name: '여행' },
        { id: 3, name: '방문후기' },
    ];

    const localhost = "54.180.146.203";

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            allowsMultipleSelection: true, // 여러 장 선택 가능 옵션 추가
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages]);

            setIsUploading(true); // 업로드 시작
            // 각 이미지의 다운로드 URL을 얻음
            try {
                for (const uri of newImages) {
                    const downloadURL = await uploadImageAsync(uri);
                    setImageUrls(prevUrls => [...prevUrls, downloadURL]);
                }
            } catch (error) {
                console.error('Error uploading images:', error);
            } finally {
                setIsUploading(false); // 업로드 완료
            }
        }
    };

    const handleSubmit = async() => {
        if (isUploading) {
            Alert.alert('이미지 등록 중입니다', '잠시 후 다시 시도해주세요.');
            return;
        }

        if (title.length >30 ) {
            Alert.alert('내용을 확인해주세요.', '제목을 30글자 이내로 작성해주세요.');
            return;
        }

        if (title.length == 0 || content.length == 0) {
            Alert.alert('내용을 확인해주세요.', '제목 혹은 내용을 입력해주세요.');
            return;
        }

        console.log('Title:', title.length);
        console.log('Content:', content.length);

        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/insertPost`, {user_id:userInfo.user_id, post_title:title, details:content, imageList:imageUrls, category:category});

            if(category!=3){
                Alert.alert('','게시물 등록이 완료되었습니다.');
            }else{
                Alert.alert('','게시물 등록이 완료되었습니다.\n포인트는 7일 안에 적립됩니다.');
            }

            navigation.navigate('CommunityList', {userInfo: userInfo})

        } catch (error) {
            console.error('Error submitting post:', error);
        }
    };

    const handleCategorySelect = (select) => {
        if(select===category){
            return;
        }
        setCategory(select);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>NUVIDA</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.categoryContainer}>
                <Text style={{fontSize:15, fontWeight:"bold"}}>category : </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((select) => (
                        <TouchableOpacity
                            key={select.id}
                            style={[
                                styles.categoryButton,
                                category === select.id ? styles.selectedCategoryButton : null
                            ]}
                            onPress={() => handleCategorySelect(select.id)}
                        >
                            <Text style={[
                                styles.categoryText,
                                category === select.id ? { color: '#fff' } : null
                            ]}>
                                {select.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <TextInput
                style={[styles.input, { height: Math.max(50, contentHeight) }]} // 최소 높이를 100으로 설정
                placeholder="제목을 입력해주세요."
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={[styles.input, { height: Math.max(100, contentHeight) }]} // 최소 높이를 100으로 설정
                placeholder="내용을 입력해주세요."
                value={content}
                onChangeText={setContent}
                multiline
                onContentSizeChange={(event) =>
                    setContentHeight(event.nativeEvent.contentSize.height)
                }
            />
            <TouchableOpacity style={styles.imgButton} onPress={pickImage}>
                <Text style={styles.buttonText}>이미지 등록</Text>
            </TouchableOpacity>
            <ScrollView>
                <View style={styles.imageContainer}>
                    {images.map((image, index) => (
                        <Image key={index} source={{ uri: image }} style={styles.image} />
                    ))}
                </View>
            </ScrollView>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>작성 완료</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    contentInput: {
        height: 100,
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 20,
    },
    image: {
        width: 100,
        height: 100,
        margin: 5,
    },
    imgButton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
        flex: 1, // 중앙 정렬을 위해 추가
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        width: '100%',
    },
    categoryButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 50,
        marginHorizontal: 3,
    },
    selectedCategoryButton: {
        backgroundColor: '#ff3131',
    },
    categoryText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize:13
    },
});
