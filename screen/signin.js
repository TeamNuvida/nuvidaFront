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
    BackHandler, Modal,
    Linking
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AntDesign, Ionicons} from '@expo/vector-icons';
import BouncyCheckbox from "react-native-bouncy-checkbox";

const Signin = () => {

    const navigation = useNavigation();
    const [loginInfo, setLoginInfo] = useState({
        id: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isServiceCheck, setIsServiceCheck] = useState(false);
    const [isAgreeCheck, setIsAgreeCheck] = useState(false);

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

    const handleSignUp = () =>{
        setIsModalVisible(true);
        setIsServiceCheck(false);
        setIsAgreeCheck(false);
    }

    const handlePress = () =>{
        Linking.openURL('https://sites.google.com/view/nuvida/%ED%99%88');
    }

    const handleGoSignUp = () =>{
        if(!isServiceCheck || !isAgreeCheck){
            return;
        }
        setIsModalVisible(false);
        navigation.navigate("SignUp")
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
                        <TouchableOpacity style={[styles.button, styles.buttonSignUp]} onPress={handleSignUp}>
                            <Text style={styles.buttonText}>회원가입</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Modal visible={isModalVisible} transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.boundContainer}>
                            <View style={styles.checkContainer}>
                                <BouncyCheckbox
                                    style={styles.checkbox}
                                    size={25}
                                    fillColor="red"
                                    unfillColor="#FFFFFF"
                                    iconStyle={{ borderColor: "red" }} // 네모 모양으로 변경
                                    isChecked={isServiceCheck}
                                    onPress={() => setIsServiceCheck(!isServiceCheck)}
                                />
                                <Text style={styles.checkText} onPress={handlePress}> [필수]NUVIDA 서비스 이용 약관 동의 </Text>
                            </View>
                            <View style={styles.checkContainer}>
                                <BouncyCheckbox
                                    style={styles.checkbox}
                                    size={25}
                                    fillColor="red"
                                    unfillColor="#FFFFFF"
                                    iconStyle={{ borderColor: "red" }} // 네모 모양으로 변경
                                    isChecked={isAgreeCheck}
                                    onPress={() => setIsAgreeCheck(!isAgreeCheck)}
                                />
                                <Text style={styles.checkText} onPress={handlePress}> [필수]개인정보 수집 및 이용 동의 </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.confirmButton, (isServiceCheck && isAgreeCheck) ? styles.buttonEnabled : styles.buttonDisabled]}
                                onPress={handleGoSignUp}
                                disabled={!isServiceCheck || !isAgreeCheck}
                            >
                                <Text style={styles.confirmButtonText}>확인</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
    modalContainer:{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.44)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    boundContainer:{
        paddingTop:60,
        backgroundColor:"#ffffff",
        width:"100%",
        paddingHorizontal:20,
        borderTopLeftRadius:30,
        borderTopRightRadius:30
    },
    checkContainer:{
        flexDirection: 'row',
        paddingBottom:20

    },
    checkbox:{
        marginRight:10
    },
    checkText:{
        textDecorationLine:"underline"

    },
    SignUpText:{

    },
    confirmButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
    },
    buttonEnabled: {
        backgroundColor: 'black',
        borderColor: 'black',
        borderWidth: 1,
    },
    buttonDisabled: {
        backgroundColor: 'gray',
        borderColor: 'gray',
        borderWidth: 1,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }


});
