import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {MaterialCommunityIcons, AntDesign} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from "axios";

// Firebase 프로젝트에서 가져온 구성 객체
const firebaseConfig = {
    apiKey: "AIzaSyDZuZsmJDYEWp5arnfRc6pSqMd0WAt01kU",
    authDomain: "high-service-431903-t6.firebaseapp.com",
    projectId: "high-service-431903-t6",
    storageBucket: "high-service-431903-t6.appspot.com",
    messagingSenderId: "797041135189",
    appId: "1:797041135189:android:bfe45b46755c233195cedc"
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
        const storageRef = ref(storage, `profile/${filename}`);

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



const Userprofile = ({route}) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);
    const [profile_img, setProfile_img] = useState(userInfo.profile_img);
    const [user_nick, setUser_nick] = useState(userInfo.user_nick);
    const [user_pw, setUser_pw] = useState(null);
    const [user_phone, setUser_phone] = useState(userInfo.user_phone);


    const localhost = '192.168.55.35';

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImageUri = result.assets[0].uri;

            try {
                const downloadURL = await uploadImageAsync(selectedImageUri);
                setProfile_img(downloadURL); // 프로필 이미지 URL 업데이트
            } catch (error) {
                console.error('Error uploading image:', error);
            }
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
                </View>
            </View>
        );
    };
    
    const handleChangeProfile = () =>{
        console.log("변경")
    }

    const handlePasswordChange = (text) => {
        // 영어와 숫자만 허용하는 정규식
        const filteredText = text.replace(/[^a-zA-Z0-9]/g, '');
        setUser_pw(filteredText);
    };

    const changeUserInfo = async ()=>{
        console.log("이미지", profile_img);
        console.log("닉네임", user_nick);
        console.log("비번", user_pw);
        console.log("폰", user_phone);

        if (user_pw && user_pw.length < 8) {
            Alert.alert("비밀번호 오류", "비밀번호는 8자리 이상이어야 합니다.",
                [
                    { text: "OK" }
                ]
            );
            return ; // 함수를 여기서 종료하여 회원가입 절차를 중단합니다.
        }

        if (!user_nick) {
            Alert.alert("닉네임 오류", "닉네임을 입력해주세요.",
                [
                    { text: "OK" }
                ]
            );
            return ; // 함수를 여기서 종료하여 회원가입 절차를 중단합니다.
        }
        
        try{

            const response = await axios.post(`http://${localhost}:8090/nuvida/updateUserInfo`,{
                user_id: userInfo.user_id,
                profile_img: profile_img,
                user_nick: user_nick,
                user_pw:user_pw,
                user_phone:user_phone
            });

            const userInfoString = JSON.stringify(response.data);
            await AsyncStorage.setItem('userInfo', userInfoString);
            navigation.navigate('Mypage', {userInfo:response.data});

        }catch (e) {
            console.error(e);
        }
    }
    
    return (
        <View style={styles.container}>
            {topHeader()}
            {/*<View style={styles.logoBackgroundWrapper}>*/}
            {/*    <View style={styles.logoBackground}/>*/}
            {/*</View>*/}
            <View style={styles.profileContainer}>

                <Text style={styles.label}>프로필</Text>
                <View style={styles.profileImgContainer}>
                    {userInfo && userInfo.profile_img ? (
                        <Image
                            style={styles.profileIcon}
                            resizeMode="cover"
                            source={{ uri: profile_img }}
                        />
                    ) : (
                        <Image
                            style={styles.profileIcon}
                            resizeMode="cover"
                            source={require("../assets/profile.png")}
                        />
                    )}
                    <TouchableOpacity style={styles.changeButton} onPress={pickImage}>
                        <Text style={styles.changeButtonText}>변경</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>닉네임</Text>
                    <TextInput
                        style={styles.inputBackground}
                        value={user_nick}
                        onChangeText={setUser_nick}
                        placeholder="닉네임을 입력하세요"
                        placeholderTextColor="gray"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>비밀번호</Text>
                    <TextInput
                        style={styles.inputBackground}
                        value={user_pw}
                        onChangeText={handlePasswordChange} // 영어와 숫자만 입력되도록 처리
                        placeholder="비밀번호 입력"
                        placeholderTextColor="gray"
                        secureTextEntry={true} // 비밀번호를 암호화된 형태로 보여줌
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>휴대폰 번호</Text>
                    <TextInput
                        style={styles.inputBackground}
                        value={user_phone}
                        onChangeText={setUser_phone}
                        placeholder="010-0000-0000"
                        placeholderTextColor="gray"
                        keyboardType="phone-pad"
                    />
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate("Mypage",{userInfo:userInfo})}>
                    <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={()=>changeUserInfo()}>
                    <Text style={styles.buttonText}>수정</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "white",
        justifyContent: "space-between",
    },
    logoText: {
        fontSize: 15,
        lineHeight: 20,
        color: "black",
        fontWeight: "500",
        textAlign: "center",
    },
    logoBackgroundWrapper: {
        alignItems: "center",
        marginBottom: 16,
    },
    logoBackground: {
        width: 58,
        height: 58,
        backgroundColor: "white",
        borderRadius: 15,
        shadowColor: "rgba(0, 0, 0, 0.25)",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 4,
        elevation: 4,
        shadowOpacity: 1,
    },
    profileContainer: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        lineHeight: 21,
        color: "black",
        fontWeight: "400",
        marginBottom: 8,
    },
    inputBackground: {
        height: 33,
        backgroundColor: "whitesmoke",
        borderRadius: 15,
        borderColor: "lightgray",
        borderWidth: 0.5,
        justifyContent: "center",
        paddingLeft: 16,
        fontSize: 15,
        color: "black",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
    },
    button: {
        height: 36,
        width: 79,
        backgroundColor: "black",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "400",
        lineHeight: 22,
        fontSize: 15,
    },
    profileIconWrapper: {
        alignItems: "center",
        marginTop: 16,
    },
    profileImgContainer: {
        flexDirection: 'row', // 이미지와 버튼을 가로로 배치
        alignItems: 'center', // 세로 축에서 가운데 정렬
    },
    profileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10, // 이미지와 버튼 사이의 간격
    },
    changeButton: {
        backgroundColor: '#007BFF', // 버튼 배경색
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    changeButtonText: {
        color: '#FFFFFF', // 텍스트 색상
        fontSize: 14,
        fontWeight: 'bold',
    },
    /* 상단바 */
    headerContainer: {
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

export default Userprofile;
