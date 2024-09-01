import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, Modal, TextInput, Alert} from 'react-native';
import { AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import axios from "axios";
import { Share } from 'react-native';

const Calculate = ({ route }) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    // 일정 식별자
    const plan_seq = route.params.plan_seq;
    const planInfo = route.params.planInfo;
    const routeList = route.params.routeList;
    const isLeader = route.params.isLeader;

    const localhost = "54.180.146.203";

    const [modalVisible, setModalVisible] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');

    const [calculateModalVisible, setCalculateModalVisible] = useState(false);
    const [memCount, setMemCount] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [price, setPrice] = useState(0);
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');

    const [items, setItems] = useState([]);


    const getCalculate = async () =>{
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getCalculate`, {
                plan_seq: plan_seq,
            });
            setItems(response.data)
        } catch (e) {
            console.error(e)
        }
    }

    useFocusEffect(
        useCallback(() => {
            getCalculate();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [])
    );


    useFocusEffect(
        useCallback(() => {
            const getMemCount = async () =>{
                try {
                    const response = await axios.post(`http://${localhost}:8090/nuvida/getMemCount`, {
                        plan_seq: plan_seq,
                    });
                    setMemCount(response.data)
                } catch (e) {
                    console.error(e)
                }
            }

            getMemCount();

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [])
    );


    useFocusEffect(
        useCallback(() => {
            let add = 0;
            if(items){
                items.map((item=>{
                    add += item.price;
                }))
            }
            setTotalPrice(add)

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [items])
    );


    useFocusEffect(
        useCallback(() => {
            setPrice(totalPrice/memCount);

            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [totalPrice])
    );

    const handleCancel = () => {
        setNewItemTitle('');
        setNewItemPrice('');
        setModalVisible(false);
    }

    const handleAddItem = async () => {
        if (newItemTitle && newItemPrice) {
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/addCalculate`, {
                    plan_seq: plan_seq,
                    title:newItemTitle,
                    price: parseInt(newItemPrice)
                });
                getCalculate();
            } catch (e) {
                console.error(e)
            }finally {
                setNewItemTitle('');
                setNewItemPrice('');
                setModalVisible(false);
            }

        } else {
            alert("제목과 금액을 입력하세요.");
        }
    };

    const handleDelItem = async (cal_seq) => {
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/delCalculate`, {
                cal_seq: cal_seq
            });
            getCalculate();
        } catch (e) {
            console.error(e)
        }
    };

    const handleDelete = (cal_seq) => {
        console.log(cal_seq);
        Alert.alert(
            "삭제 확인",
            "삭제하시겠습니까?",
            [
                { text: "아니요", style: "cancel" },
                { text: "예", onPress: () => handleDelItem(cal_seq)}
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
        const formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(date);
        return formattedDate.replace(/\./g, '. ');
    };

    const handleCalculate = async () =>{
        console.log("정산하기 1인당 금액 : ", price);
        console.log(items)
        console.log(planInfo.plan_name)

        if (!bankName || !accountNumber) {
            Alert.alert('입력 오류', '은행명과 계좌번호를 모두 입력해주세요.');
            return;
        }

        // 항목별 정산 내역을 구성
        let itemDetails = '';
        items.forEach(item => {
            itemDetails += `${item.title} ${item.price.toLocaleString()}원\n`;
        });

        // 메시지 구성
        const msg = `${planInfo.plan_name} 일정 정산\n` +
            `${itemDetails}` +
            `총합 ${totalPrice.toLocaleString()}원\n` +
            `1인당 ${price.toLocaleString()}원\n\n` +
            `은행명 : ${bankName}\n` +
            `계좌 : ${accountNumber}`;
        try {
            const result = await Share.share({
                message: msg,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type: ', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing message: ', error);
        } finally {
            setBankName('');
            setAccountNumber('');
            setCalculateModalVisible(false);
        }
    }

    const cancelCalculate = () => {
        setBankName('');
        setAccountNumber('');
        setCalculateModalVisible(false);
    }

    const openCalculateModal = () => {
        setCalculateModalVisible(true);
    }

    const checkDeletePlan = () =>{
        Alert.alert(
            "삭제 확인",
            "삭제하시겠습니까?",
            [
                { text: "아니요", style: "cancel" },
                { text: "예", onPress: () => deletePlan()}
            ]
        );
    }


    const deletePlan = async () =>{

        if(isLeader){
            console.log("리더 플랜 삭제")
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/delPlanLeader`, {
                    plan_seq: plan_seq
                });
                navigation.navigate("TripCalendar", {userInfo:userInfo});
            } catch (e) {
                console.error(e)
            }
        }else{
            console.log("멤버 플랜 삭제")
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/delPlanMem`, {
                    plan_seq: plan_seq,
                    user_id:userInfo.user_id
                });
                navigation.navigate("TripCalendar", {userInfo:userInfo});
            } catch (e) {
                console.error(e)
            }
        }
    }
    
    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("TripCalendar", {userInfo})}>
                    <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => checkDeletePlan()}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
            </View>

                <View style={styles.header}>
                    {planInfo?(<Text style={styles.location}>{planInfo.plan_name}</Text>):
                        (<Text style={styles.location}>광주 여행</Text>)}

                    {planInfo?(<Text style={styles.date}>{formatDate(planInfo.start_date)} - {formatDate(planInfo.end_date)}</Text>):
                        (<Text style={styles.date}>2024. 05. 21 (토) - 2024. 05. 23 (월)</Text>)}
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("TripSchedule", {userInfo:userInfo, plan_seq:plan_seq, routeList:routeList})}>
                        <Text style={styles.tabText}>여행일정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("ReservationInfo", {userInfo:userInfo, plan_seq:plan_seq, planInfo:planInfo, routeList:routeList, isLeader:isLeader})}>
                        <Text style={styles.tabText}>예약정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("MemberList", {userInfo:userInfo, plan_seq:plan_seq, planInfo:planInfo, routeList:routeList, isLeader:isLeader})}>
                        <Text style={styles.tabText}>멤버목록</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButtonActive} onPress={()=>navigation.navigate("Calculate", {userInfo:userInfo, plan_seq:plan_seq, planInfo:planInfo, routeList:routeList, isLeader:isLeader})}>
                        <Text style={styles.tabTextActive}>정산하기</Text>
                    </TouchableOpacity>
                </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.boxContainer}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.totalAmountLabel}>총액</Text>
                        <Text style={styles.totalAmount}>{totalPrice}원</Text>
                        <View style={styles.itemList}>
                            {items.map((item, index) => (
                                <View key={item.cal_seq} style={styles.item}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '90%'}}>
                                    <Text style={styles.itemName}>{item.title}</Text>
                                    <Text style={styles.itemPrice}>{item.price.toLocaleString()}원</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteIcon}
                                        onPress={() => handleDelete(item.cal_seq)}
                                    >
                                        <Entypo name="cross" size={24} color="red" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.addItemButton} onPress={() => setModalVisible(true)}>
                            <Text style={styles.addItemText}>목록 추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>총 멤버 : {memCount}명</Text>
                        <Button title="정산하기" onPress={openCalculateModal} />
                    </View>
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>1인당금액</Text>
                        <Text style={styles.perPersonAmount}>{price}원</Text>
                    </View>
                </View>
            </ScrollView>

            {/*정산 목록 추가 모달*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>목록 추가</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="제목을 입력하세요"
                            value={newItemTitle}
                            onChangeText={setNewItemTitle}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="금액을 입력하세요"
                            value={newItemPrice}
                            onChangeText={setNewItemPrice}
                            keyboardType="numeric"
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={handleCancel}
                            >
                                <Text style={styles.textStyle}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonAdd]}
                                onPress={handleAddItem}
                            >
                                <Text style={styles.textStyle}>추가</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/*은행명과 계좌번호 입력 모달*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={calculateModalVisible}
                onRequestClose={() => {
                    setCalculateModalVisible(!calculateModalVisible);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>정산하기</Text>
                        <TextInput
                            placeholder="은행명 입력"
                            value={bankName}
                            onChangeText={setBankName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="계좌번호 입력"
                            value={accountNumber}
                            onChangeText={setAccountNumber}
                            keyboardType="numeric"
                            style={styles.input}
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={cancelCalculate}
                            >
                                <Text style={styles.textStyle}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonAdd]}
                                onPress={handleCalculate}
                            >
                                <Text style={styles.textStyle}>정산하기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    backButton: {
        paddingVertical: 10,
    },
    backButtonText: {
        color: '#000',
        fontSize: 16,
    },
    deleteButton: {
        paddingVertical: 10,
    },
    deleteButtonText: {
        color: 'red',
        fontSize: 16,
    },
    scrollContainer: {
        paddingBottom: 80, // Ensure there's space for the tabBar
    },
    header: {
        alignItems: 'center',
        marginVertical: 20,
    },
    location: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: '#666',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingBottom: 10,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    tabButtonActive: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderColor: '#000',
    },
    tabText: {
        fontSize: 16,
        color: '#999',
    },
    tabTextActive: {
        fontSize: 16,
        color: '#000',
    },
    boxContainer: {
        backgroundColor: '#f0f0f0', // 밝은 회색 배경색
        padding: 15,
        margin: 20,
        borderRadius: 10,
    },
    contentContainer: {
        padding: 20,
    },
    totalAmountLabel: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    itemList: {
        marginBottom: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    itemName: {
        fontSize: 18,
    },
    itemPrice: {
        fontSize: 18,
    },
    addItemButton: {
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#838383',
        borderRadius: 5,
    },
    addItemText: {
        fontSize: 16,
        color: '#000',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    footerText: {
        fontSize: 16,
    },
    perPersonAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        marginBottom:20
    },
    tabItem: {
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: 300,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 18,
        marginBottom: 15,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#959595',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal:20
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        width:100
    },
    buttonClose: {
        backgroundColor: '#f35353',
    },
    buttonAdd: {
        backgroundColor: '#000000',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deleteIcon: {
        top: 5,
    },
});

export default Calculate;
