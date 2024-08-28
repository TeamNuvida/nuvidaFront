import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image } from 'react-native';
import { AntDesign, Entypo, FontAwesome } from '@expo/vector-icons';
import axios from "axios";

const MemberList = ({ route }) => {
    const navigation = useNavigation();

    // 로그인 정보
    const [userInfo, setUserInfo] = useState(route.params.userInfo);

    // 일정 식별자
    const plan_seq = route.params.plan_seq;
    const planInfo = route.params.planInfo;
    const routeList = route.params.routeList;
    const isLeader = route.params.isLeader;
    const localhost = "192.168.55.35";

    const [modalVisible, setModalVisible] = useState(false);
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);
    const [members, setMembers] = useState([]);
    const [newMemberId, setNewMemberId] = useState('');
    const [friends, setFriends] = useState([]);
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const getMember = async () => {
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getMember`, {
                plan_seq: plan_seq,
            });
            setMembers(response.data)
        } catch (e) {
            console.error(e)
        }
    }

    const getFriend = async () => {
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getFriend`, {
                user_id: userInfo.user_id,
            });
            setFriends(response.data)
        } catch (e) {
            console.error(e)
        }
    }

    useFocusEffect(
        useCallback(() => {
            getMember();
            getFriend();
            return () => {
                // Cleanup 함수: 이 페이지를 떠날 때 실행됩니다.
            };
        }, [])
    );

    useEffect(() => {
        filterFriends(searchQuery);
    }, [friends, members]);

    const filterFriends = (query) => {
        const memberIds = members.map(member => member.user_id);
        const filtered = friends.filter(friend => !memberIds.includes(friend.user_id) && friend.user_nick.includes(query));
        setFilteredFriends(filtered);
    };

    const deleteMember = async (mem_seq) =>{
        try{
            const response = await axios.post(`http://${localhost}:8090/nuvida/deleteMember`, {
                mem_seq:mem_seq
            });
            getMember();

        }catch (e) {
            console.error(e)
        }
    }

    const handleDeleteMember = (index) => {
        Alert.alert(
            "삭제 확인",
            "삭제하시겠습니까?",
            [
                { text: "아니요", style: "cancel" },
                { text: "예", onPress: () => deleteMember(index)}
            ]
        );
    };

    const cancelAddMember = () => {
        setSearchQuery('');
        setNewMemberId('');
        setModalVisible(false);
    }

    const handleAddMember = async () => {
        if (newMemberId) {
            const selectedFriend = filteredFriends.find(friend => friend.user_id === newMemberId);
            console.log(selectedFriend.user_id)
            console.log(plan_seq)
            console.log(planInfo.plan_name)


            try{
                const response = await axios.post(`http://${localhost}:8090/nuvida/setMember`, {
                    plan_seq: plan_seq,
                    plan_name:planInfo.plan_name,
                    user_id:selectedFriend.user_id
                });
                getMember();
            }catch (e) {
                console.error(e)
            }finally {
                setSearchQuery('');
                setNewMemberId('');
                setModalVisible(false);
            }


        } else {
            Alert.alert('',"친구를 선택하세요.");
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        filterFriends(query);
    };

    const handleDropdownSelect = (friend) => {
        setNewMemberId(friend.user_id);
        setSearchQuery(friend.user_nick);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
        const formattedDate = new Intl.DateTimeFormat('ko-KR', options).format(date);
        return formattedDate.replace(/\./g, '. ');
    };

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
                navigation.navigate("Mypage", {userInfo:userInfo});
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
                navigation.navigate("Mypage", {userInfo:userInfo});
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Mypage", { userInfo })}>
                    <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => checkDeletePlan()}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                {planInfo ? (
                    <Text style={styles.location}>{planInfo.plan_name}</Text>
                ) : (
                    <Text style={styles.location}>광주 여행</Text>
                )}

                {planInfo ? (
                    <Text style={styles.date}>
                        {formatDate(planInfo.start_date)} - {formatDate(planInfo.end_date)}
                    </Text>
                ) : (
                    <Text style={styles.date}>2024. 05. 21 (토) - 2024. 05. 23 (월)</Text>
                )}
            </View>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("TripSchedule", { userInfo: userInfo, plan_seq: plan_seq })}>
                    <Text style={styles.tabText}>여행일정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("ReservationInfo", { userInfo: userInfo, plan_seq: plan_seq, planInfo: planInfo, routeList: routeList, isLeader: isLeader })}>
                    <Text style={styles.tabText}>예약정보</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButtonActive} onPress={() => navigation.navigate("MemberList", { userInfo: userInfo, plan_seq: plan_seq, planInfo: planInfo, routeList: routeList, isLeader: isLeader })}>
                    <Text style={styles.tabTextActive}>멤버목록</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate("Calculate", { userInfo: userInfo, plan_seq: plan_seq, planInfo: planInfo, routeList: routeList, isLeader: isLeader })}>
                    <Text style={styles.tabText}>정산하기</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.membersContainer}>
                    {isLeader && (
                        <TouchableOpacity style={styles.inviteButton} onPress={() => setModalVisible(true)}>
                            <AntDesign name="plus" size={24} color="black" />
                            <Text style={styles.inviteText}>초대</Text>
                        </TouchableOpacity>
                    )}
                    {members.map((member, index) => (
                        <View key={member.mem_seq} style={styles.memberBox}>
                            {isLeader && member.user_id!=userInfo.user_id&&(
                                <TouchableOpacity
                                    style={styles.deleteIcon}
                                    onPress={() => handleDeleteMember(member.mem_seq)}
                                >
                                    <Entypo name="cross" size={24} color="red" />
                                </TouchableOpacity>
                            )}
                            {member.profile_img ? (
                                <Image
                                    style={styles.profileIcon}
                                    resizeMode="cover"
                                    source={{ uri: member.profile_img }}
                                />
                            ) : (
                                <FontAwesome name="user-circle" size={40} color="grey" />
                            )}

                            <Text style={styles.memberName}>{member.user_nick}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
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
                        <View style={{ position: 'relative', width: '100%' }}>
                            <TextInput
                                style={styles.input}
                                placeholder="아이디를 입력하세요"
                                value={searchQuery}
                                onChangeText={(text) => handleSearch(text)}
                            />
                            {filteredFriends.length > 0 && (
                                <ScrollView style={styles.dropdown}>
                                    {filteredFriends.map((friend) => (
                                        <TouchableOpacity
                                            key={friend.user_id}
                                            style={styles.dropdownItem}
                                            onPress={() => handleDropdownSelect(friend)}
                                        >
                                            <Text>{friend.user_nick}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={cancelAddMember}
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
    dropdown: {
        maxHeight: 150,
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    profileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
});

export default MemberList;
