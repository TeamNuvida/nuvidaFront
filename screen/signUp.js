import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    SafeAreaView,
    Alert,
    Platform,
    ActivityIndicator
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native';

const SignUp = () => {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [hasCheckedDuplicate, setHasCheckedDuplicate] = useState(false);

    const localhost = "192.168.55.35";


    const checkDuplicate = async () => {
        try {
            if(username !=""){


                const response = await axios.post( `http://${localhost}:8090/nuvida/idCheck`,{
                    id: username
                });


                console.log(response.data)
                if(response.data == 0) {
                    // 사용 가능한 아이디인 경우
                    Alert.alert("사용 가능한 아이디입니다.");
                    setIsDuplicate(false);
                    setHasCheckedDuplicate(true); // 중복 확인을 성공적으로 마쳤음을 표시
                    console.log("isDuplicate 상태 변경:", isDuplicate);
                } else if(response.data != 0)  {
                    // 이미 사용 중인 아이디인 경우
                    Alert.alert("이미 사용중인 아이디입니다.");
                    setIsDuplicate(true);
                    setHasCheckedDuplicate(false); // 중복 확인에서 실패했음을 표시 (이 경우 회원가입 버튼을 비활성화)
                }
            }else {
                Alert.alert("아이디를 입력해주세요");
            }
        } catch (error) {
            console.error('중복 확인 중 에러 발생:', error);
        }

    };
    const handlePasswordChange = (password) => {
        const cleanedPassword = password.replace(/[^a-zA-Z0-9!@]/g, '');
        setPassword(cleanedPassword);
        setPasswordMatch(cleanedPassword === confirmPassword);
    };

    const handleConfirmPasswordChange = (confirmPassword) => {
        const cleanedPassword = password.replace(/[^a-zA-Z0-9!@]/g, '');
        setConfirmPassword(confirmPassword);
        setPasswordMatch(password === confirmPassword);
    };



    const handleSignUp = async () => {
        console.log("함수")
        // 회원가입 로직이 성공적으로 완료되었을 때만 조건 검사를 하고 싶다면,
        // isDuplicate와 password === confirmPassword 조건 검사를 axios.post 호출 이후에 배치하세요.
        console.log(hasCheckedDuplicate, passwordMatch);
        if (verifyInputs()) {
            try {

                if (password.length < 8) {
                    Alert.alert("비밀번호 오류", "비밀번호는 8자리 이상이어야 합니다.",
                        [
                            { text: "OK", onPress: () => resetForm() }
                        ]
                    );
                    return ; // 함수를 여기서 종료하여 회원가입 절차를 중단합니다.
                }

                const response = await axios.post( `http://${localhost}:8090/nuvida/signUp`,{
                    id: username,
                    pw: password,
                    name: name,
                    phone: phoneNumber,
                });

                console.log('회원가입:', username);
                Alert.alert(
                    "회원가입 성공",
                    "회원가입 성공",
                        [{
                        text: "확인",
                        onPress: () => navigation.navigate("signin"),
                        style:"cancel"

                    }],
                    {cancelable: false}
                );
                // navigation.navigate('HomeLogin');

            } catch (error) {
                console.error('회원가입 에러:', error);
            }
        } else {
            if (!hasCheckedDuplicate) {
                Alert.alert('오류', '아이디 중복 확인이 필요합니다.');
            } else if (!passwordMatch) {
                Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            } else {
                Alert.alert('오류', '모든 필드를 입력해주세요.');
            }
        }
    };
    const resetForm = () => {
        // 모든 상태를 초기화하거나 특정 상태만 초기화
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setName('');
        setPhoneNumber('');

        // 나머지 필요한 상태도 초기화
    };
    // 비밀번호 일치 확인
    useEffect(() => {
        if (password && confirmPassword) {
            setPasswordMatch(password === confirmPassword);
        }
    }, [password, confirmPassword]);

    // 모든 입력 필드 검증
    const verifyInputs = () => {
        if (!username || !password || !confirmPassword || !name || !phoneNumber) {
            Alert.alert('오류', '모든 필드를 입력해주세요.');
            return false;
        }
        if (isDuplicate) {
            Alert.alert('오류', '아이디 중복을 확인해주세요.');
            return false;
        }
        if (!passwordMatch) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return false;
        }
        return true;
    };



    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS는 padding, Android는 height 사용
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // 필요한 경우 Android에서 offset 조정
            >
                <ScrollView style={styles.container}>
                    <View style={styles.logoContainer}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Signin")}>
                            <Ionicons name="arrow-back" size={24} color="black" />

                        </TouchableOpacity>

                    </View>
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>아이디*</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                onChangeText={text => {
                                    const cleanedText = text.replace(/[^a-zA-Z0-9]/g, '');
                                    setUsername(cleanedText); setIsDuplicate(false); }}
                                value={username}
                                placeholder="아이디를 입력하세요"
                                autoCapitalize="none"
                            />
                            <TouchableOpacity style={styles.checkButton} onPress={checkDuplicate}>
                                <Text style={styles.checkButtonText}>중복확인</Text>
                            </TouchableOpacity>

                        </View>
                        {isDuplicate && <Text style={styles.errorText}>이미 사용중인 아이디입니다.</Text>}

                        <Text style={styles.label}>비밀번호*</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={handlePasswordChange}
                            value={password}
                            placeholder="********"
                            secureTextEntry={true}
                        />

                        <Text style={styles.label}>비밀번호 확인*</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={handleConfirmPasswordChange}
                            value={confirmPassword}
                            placeholder="********"
                            secureTextEntry={true}
                        />
                        {passwordMatch ?
                            (password.length > 0 && confirmPassword.length > 0) && <Text style={styles.successText}>비밀번호가 일치합니다.</Text> :
                            <Text style={styles.errorText}>비밀번호가 일치하지 않습니다.</Text>
                        }


                        {/* 이름 입력 */}
                        <Text style={styles.label}>이름*</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setName}
                            value={name}
                            placeholder="홍길동"
                        />

                        {/* 전화번호 입력 */}
                        <Text style={styles.label}>전화번호*</Text>
                        <TextInput
                            style={[styles.input, styles.inputFull]}
                            onChangeText={setPhoneNumber}
                            value={phoneNumber}
                            placeholder="010-1234-5678"
                            keyboardType="phone-pad" // 숫자 키패드를 기본으로 표시합니다.
                        />

                        {/* 회원가입 버튼 */}
                        <TouchableOpacity style={styles.signUpButton} onPress={() => handleSignUp()}>
                            <Text style={styles.signUpButtonText}>회원가입</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.buttonKakao} >
      <Image
        source={require('../assets/Kakaostart.png')}
        style={styles.kakaoLoginImage}
      />
    </TouchableOpacity> */}

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>


    );
};

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        marginBottom:-30,
        marginTop: Platform.OS === 'android' ? 5 : 0,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
    },

    successText: {
        color: 'green',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        // 로고가 중앙에 오도록 헤더를 정의합니다.
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom:-30
    },
    headerText: {
        // 새로 추가된 회원가입 텍스트 스타일
        fontSize: 20,
        fontWeight: 'bold',
    },

    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 20,
    },
    backButton: {
        // 뒤로가기 버튼 위치 조정
        position: 'absolute',
        left: 20,
        zIndex: 10,
        paddingTop:10,

    },

    logo: {
        width: 300,
        height: 150,
        alignSelf: 'center',// 로고를 스스로 정 중앙에 위치하도록 설정
        // 로고 스타일 기타 속성들...
    },

    form: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    formContainer: {
        marginTop:130,
        padding: 20,
    },
    label: {
        color: '#333',
        marginBottom: 8,
        marginTop: 10
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e1e1e1',
        padding: 10,
        marginRight: 8,
        borderRadius: 20,
    },
    checkButton: {
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 4,
    },
    checkButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',

    },
    signUpButton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop:20
    },
    signUpButtonText: {
        color: '#fff',
        fontWeight: 'bold',


    },
    buttonKakao: {
        backgroundColor: '#FEE500',
        padding: 2, // 전체 패딩을 조정하여 버튼의 높이와 너비를 조절
        borderRadius: 4, // 모서리 둥글기
        alignItems: 'center',
        marginTop: 8, // '회원가입' 버튼과의 상단 여백
        marginBottom: 16, // 하단 여백
    },


    kakaoLoginImage: {
        width: '100%',
        resizeMode: 'contain',
    },



});

export default SignUp;