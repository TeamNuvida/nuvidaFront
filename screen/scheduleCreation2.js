import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { FontAwesome5, AntDesign, FontAwesome, Entypo, Ionicons, Feather, MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ScheduleCreation1({route}) {
    const navigation = useNavigation();

    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
    const [userInfo, setUserInfo] = useState(null);  // 로그인 정보
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const scheduleInfo = route.params.scheduleInfo; // 일정 생성 정보

    console.log(scheduleInfo);

    const [selectedBox, setSelectedBox] = useState(null);
    const [planName, setPlanName] = useState('');

    // 유저 정보 (테스트용)
    useEffect(() => {
        const user = async () => {
            try {
                setUserInfo(route.params.userInfo);
                setIsLoggedIn(true);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false); // 데이터 로드 완료 후 로딩 상태 false로 변경
            }
        };
        user();
    }, []);

    // 루트 정보 추가
    const handleScheduleInfoPress = () => {
        if (planName.length <= 0) {
            Alert.alert('', '여행 이름을 입력해주세요.');
            return;
        }

        if (selectedBox === null) {
            Alert.alert('', '이동수단을 선택해주세요.');
            return;
        }

        const updateScheduleInfo = { ...scheduleInfo, plan_name: planName, move: selectedBox };
        navigation.navigate('ScheduleCreation3', { scheduleInfo: updateScheduleInfo, userInfo:userInfo });
    }

    // 여행 이름 삭제
    const handleClear = () => {
        setPlanName(''); // 텍스트 지우기
    };

    // 이동 수단 선택
    const handleSelect = (boxId) => {
        setSelectedBox(boxId);
    };

    // 로딩 중일 때 표시할 컴포넌트
    if (loading) {
        console.log("로딩 중")
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    // 상단 바
    const renderHeader = () => {
        return (
            <View style={[styles.center_row, styles.headerContainer]}>
                <View style={[{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-start'}]}>
                    <TouchableOpacity style={[styles.center_row, {marginLeft: '12%'}]} onPress={() => navigation.goBack()}>
                        <Entypo name="chevron-thin-left" size={14} color="black" />
                        <Text style={{fontSize: 14, marginLeft: '5%'}}>이전</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width: '40%', height: '100%'}}>
                </View>
                <View style={[{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end',}]}>
                    <TouchableOpacity style={[styles.center_row, {marginRight: '12%'}]} onPress={() => handleScheduleInfoPress()}>
                        <Text style={{fontSize: 14, marginRight: '5%'}}>다음</Text>
                        <Entypo name="chevron-thin-right" size={14} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // 여행 루트 생성 방법
    const renderTravelRoute = () => {
        return (
            <View style={[styles.container, {alignItems: 'center'}]}>
                <View style={[{width: '85%', height: 150,  marginTop: '20%', justifyContent: 'center'}]}>
                    <View style={{flexDirection: 'row'}}>
                        <MaterialIcons name="edit-calendar" size={24} color="black" />
                        <Text style={{fontSize: 17, fontWeight: 'medium', marginLeft: '2%'}}>여행 이름</Text>
                    </View>
                    <View style={{width: '90%', height: '35%', borderRadius: 25, backgroundColor: '#f6f6f6', marginTop: '3%', marginLeft: '5%', flexDirection: 'row'}}>
                        <TextInput
                            style={{ width: '84%', height: '100%', marginLeft: '5%', fontSize: 16}}
                            placeholder="여행이름을 입력해주세요."
                            onChangeText={text => setPlanName(text)}
                            value={planName}
                        />
                        {planName.length > 0 && (
                            <TouchableOpacity onPress={handleClear} style={{width: '11%', height: '100%', justifyContent: 'center'}}>
                                <AntDesign name="closecircle" size={19} color="#C8C8C8" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{flexDirection: 'row', marginTop: '10%'}}>
                        <MaterialIcons name="edit-calendar" size={24} color="black" />
                        <Text style={{fontSize: 17, fontWeight: 'medium', marginLeft: '2%'}}>이동 수단</Text>
                    </View>

                </View>
                <View style={[styles.center_row, {width: '100%', height: 200}]}>
                    <TouchableOpacity
                        style={[styles.center, {borderColor: '#EFEFEF', backgroundColor: '#fff', width: '40%', height: '83%', borderRadius: 10, borderWidth: 2, marginRight: '2%'}, selectedBox === 1 && {borderColor: 'black', backgroundColor: '#E6E6E6',}]}
                        onPress={() => handleSelect(1)}
                    >
                        <FontAwesome5 name="bus" size={40} color="#4E4E4E" style={{ zIndex: 1, marginTop: '5%' }} />
                        <Text style={{marginTop: '5%', fontSize: 15}}>대중교통</Text>

                        {selectedBox === 1 && (
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color="black"
                                style={{
                                    position: 'absolute',
                                    top: '5%',
                                    right: '6%',
                                    fontSize: 30,
                                    zIndex: 2,
                                    textAlign: 'center',
                                }}
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.center, {borderColor: '#EFEFEF', backgroundColor: '#fff', width: '40%', height: '83%', borderRadius: 10, borderWidth: 2, marginLeft: '2%'}, selectedBox === 2 && {borderColor: 'black', backgroundColor: '#E6E6E6',}]}
                        onPress={() => handleSelect(2)}
                    >
                        <FontAwesome5 name="car-alt" size={40} color="#4E4E4E" style={{ zIndex: 1, marginTop: '5%' }} />
                        <Text style={{marginTop: '5%', fontSize: 15}}>자동차</Text>

                        {selectedBox === 2 && (
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color="black"
                                style={{
                                    position: 'absolute',
                                    top: '5%',
                                    right: '6%',
                                    fontSize: 30,
                                    zIndex: 2,
                                    textAlign: 'center',
                                }}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView style={{flex: 1,
                backgroundColor: '#fff',}}>
                {renderTravelRoute()}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    center_row: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    /* */
    box: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
    },
    selectedBox: {
        borderColor: 'blue',
        backgroundColor: 'lightblue',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: '#FAFAFA',
    },

    /* 상단바 */
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        paddingTop: '10%',
        paddingBottom: '2%',

    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'red'
    },
    headerIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    headerIcon: {
        width: 26,
        height: 26,
        marginRight: '12%',
    },

    /* 하단 바 */
    tabBar: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    tabItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
})
