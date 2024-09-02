import React, { useState,  useEffect  } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    TouchableWithoutFeedback,
    Keyboard,
    Text,
    Alert,
    Platform,
    ActivityIndicator,
    BackHandler
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const Signin = () => {

    const navigation = useNavigation();
    const [loginInfo, setLoginInfo] = useState({
        id: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const localhost = "54.180.146.203";

    useEffect(() => {
        const backAction = () => {
            // Main 페이지로 이동합니다.
            navigation.navigate('Main');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [navigation]);


    const handleLoginChange = (name, value) => {
        let cleanedValue = value;
        cleanedValue = cleanedValue.replace(/[^\w\s!@]/gi, '');
        setLoginInfo({ ...loginInfo, [name]: cleanedValue });
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/signin`,{
                id: loginInfo.id,
                password: loginInfo.password,
            });

            if (response.data === null || response.data.length === 0) {
                Alert.alert('로그인 실패', '아이디 또는 비밀번호를 확인해주세요.');
            } else {
                const userInfoString = JSON.stringify(response.data);
                await AsyncStorage.setItem('userInfo', userInfoString);

                navigation.navigate('Main');
            }
        } catch (error) {
            console.error('로그인 요청 실패:', error);
            if (error.response) {
                const errorMessage = `상태 코드: ${error.response.status}\n응답 데이터: ${JSON.stringify(error.response.data)}`;
                Alert.alert('로그인 요청 실패', errorMessage);
            } else {
                Alert.alert('로그인 요청 실패', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image source={require('../assets/logo.png')} style={styles.logo} onPress={() => navigation.goBack()} />
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>아이디*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="아이디를 입력하세요"
                            onChangeText={(value) => handleLoginChange('id', value)}
                            value={loginInfo.id}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>비밀번호*</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="비밀번호를 입력하세요 "
                            secureTextEntry={true}
                            onChangeText={(value) => handleLoginChange('password', value)}
                            value={loginInfo.password}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.buttonLogin]} onPress={handleLogin}>
                            <Text style={styles.buttonText}>로그인</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.buttonSignUp]} onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.buttonText}>회원가입</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default Signin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        marginTop: Platform.OS === 'android' ? -50 : -70,
        justifyContent: 'center', // This centers content vertically
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 200, // Add some space between the logo and input fields
    },
    logo: {
        width: 300,
        height: 150,
        alignSelf: 'center',
        resizeMode:"contain"
    },
    inputContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? 20 : 0, // Reduce the margin top
    },
    inputWrapper: {
        width: '100%',
        alignItems: 'center',
        marginBottom: -5, // Add margin bottom to space out input fields
    },
    inputLabel: {
        fontSize: 15,
        color: 'black',
        marginBottom: 5,
        alignSelf: 'flex-start',
        marginLeft: 35, // Adjust label position
    },
    // inputLabel: {
    //     fontSize: 15,
    //     color: 'black',
    //     marginBottom: 5,
    //     marginRight: Platform.OS === 'android' ? 280 : 290
    // },
    // inputLabel2: {
    //     fontSize: 15,
    //     color: 'black',
    //     marginBottom: 5,
    //     marginRight: Platform.OS === 'android' ? 265 : 280
    // },
    input: {
        height: 46,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        borderColor: '#e1e1e1',
        borderWidth: 1,
        borderRadius: 25,
        color: '#333',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 30,
        width: 300,
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%'
    },
    button: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10, // Add vertical margin between buttons
        width: '100%', // Ensure the button takes the full width
    },

    buttonLogin: {
        backgroundColor: 'black',
        borderColor: 'black',
        borderWidth: 1,
    },
    buttonSignUp: {
        backgroundColor: 'black',
        borderColor: 'black',
        borderWidth: 1,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: Platform.OS === 'android' ? 0 : 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
});
