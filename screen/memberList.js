import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { AntDesign, Entypo, FontAwesome, Ionicons, Feather } from '@expo/vector-icons';
import axios from "axios";

const MemberList = ({ route }) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    // 일정 식별자
    const plan_seq = route.params.plan_seq;

    console.log(plan_seq)

    const [modalVisible, setModalVisible] = useState(false);
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);
    const [members, setMembers] = useState([
        { name: '이건학' },
        { name: '박지뉴' },
        { name: '이태희' },
        { name: '지수빈' },
    ]);
    const [newMemberId, setNewMemberId] = useState('');

    const handleDeleteMember = (index) => {
        Alert.alert(
            "삭제 확인",
            "삭제하시겠습니까?",
            [
                { text: "아니요", style: "cancel" },
                { text: "예", onPress: () => {
                        const newMembers = members.filter((_, i) => i !== index);
                        setMembers(newMembers);
                    }}
            ]
        );
    };

    const handleAddMember = () => {
        if (newMemberId) {
            setMembers([...members, { name: newMemberId }]);
            setNewMemberId('');
            setModalVisible(false);
        } else {
            alert("아이디를 입력하세요.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => { /* Back button action */ }}>
                    <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteIcons(!showDeleteIcons)}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.location}>광 주</Text>
                    <Text style={styles.date}>2024. 05. 21 (토) - 2024. 05. 23 (월)</Text>
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("TripSchedule", {userInfo:userInfo, plan_seq:plan_seq})}>
                        <Text style={styles.tabTextActive}>여행일정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("ReservationInfo", {userInfo:userInfo, plan_seq:plan_seq})}>
                        <Text style={styles.tabText}>예약정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButtonActive} onPress={()=>navigation.navigate("MemberList", {userInfo:userInfo, plan_seq:plan_seq})}>
                        <Text style={styles.tabText}>멤버목록</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton} onPress={()=>navigation.navigate("Calculate", {userInfo:userInfo, plan_seq:plan_seq})}>
                        <Text style={styles.tabText}>정산하기</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.membersContainer}>
                    <TouchableOpacity style={styles.inviteButton} onPress={() => setModalVisible(true)}>
                        <AntDesign name="plus" size={24} color="black" />
                        <Text style={styles.inviteText}>초대</Text>
                    </TouchableOpacity>
                    {members.map((member, index) => (
                        <View key={index} style={styles.memberBox}>
                            {showDeleteIcons && (
                                <TouchableOpacity
                                    style={styles.deleteIcon}
                                    onPress={() => handleDeleteMember(index)}
                                >
                                    <Entypo name="cross" size={24} color="red" />
                                </TouchableOpacity>
                            )}
                            <FontAwesome name="user-circle" size={40} color="grey" />
                            <Text style={styles.memberName}>{member.name}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Entypo name="home" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Ionicons name="chatbubbles-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Feather name="user" size={24} color="black" />
                </TouchableOpacity>
            </View>
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
                        <Text style={styles.modalText}>멤버 추가</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="아이디를 입력하세요"
                            value={newMemberId}
                            onChangeText={setNewMemberId}
                        />
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(!modalVisible)}
                            >
                                <Text style={styles.textStyle}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonAdd]}
                                onPress={handleAddMember}
                            >
                                <Text style={styles.textStyle}>추가</Text>
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
    membersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Adjusted to evenly space the items
        paddingHorizontal: 10,
    },
    inviteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    inviteText: {
        marginTop: 5,
        fontSize: 16,
        color: '#000',
    },
    memberBox: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%', // Adjusted to fit 3 items per row
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 10,
    },
    memberName: {
        marginTop: 5,
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
    },
    deleteIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
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
        marginBottom: 20
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
        paddingHorizontal: 20,
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        width: 100,
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
});

export default MemberList;
