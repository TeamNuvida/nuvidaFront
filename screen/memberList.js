import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Image } from 'react-native';
import {
    AntDesign,
    Entypo,
    FontAwesome,
    Ionicons,
    Feather,
    FontAwesome6,
    MaterialCommunityIcons
} from '@expo/vector-icons';
import axios from "axios";
import {backgroundColor} from "react-native-calendars/src/style";

const MemberList = ({ route }) => {
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

    // 상단 바
    const renderHeader = () => {
        return (
            <View style={[styles.center_row, styles.headerContainer]}>
                <View style={[{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-start'}]}>
                    <TouchableOpacity style={[styles.center_row, {marginLeft: '12%'}]} onPress={() => navigation.navigate("TripCalendar", {userInfo})}>
                        <Entypo name="chevron-thin-left" size={14} color="black" />
                        <Text style={{fontSize: 14, marginLeft: '5%'}}>이전</Text>
                    </TouchableOpacity>
                </View>
                <View style={{width: '40%', height: '100%'}}>
                </View>
                <View style={[{width: '30%', height: '100%', justifyContent: 'center', alignItems: 'flex-end',}]}>
                    <TouchableOpacity style={[styles.center_row, {marginRight: '12%'}]} onPress={() => checkDeletePlan()}>
                        <Text style={{fontSize: 14, marginRight: '5%', color: 'red'}}>삭제</Text>
                        <Entypo name="chevron-thin-right" size={14} color="red" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // 여행 상단바
    const renderTripHeader = () => {
        return (
            <View style={[{width: '100%', height: '10%'}]}>
                <View style={{width: '100%', height: '50%', flexDirection: 'row', alignItems: 'center'}}>
                    <View style={[styles.center, {width: '10%', height: '100%', marginLeft: '5%'}]}>
                        <Ionicons name="paper-plane-outline" size={28} color="black" />
                    </View>
                    <View style={[{width: '80%', height: '100%', marginRight: '5%', justifyContent: 'center'}]}>
                        {planInfo ? (
                            <Text style={{fontSize: 19, letterSpacing: 2}}>{planInfo.plan_name}</Text>
                        ) : (
                            <Text style={{fontSize: 19, letterSpacing: 2}}>광주 여행</Text>
                        )}
                    </View>
                </View>
                <View style={{width: '100%', height: '50%'}}>
                    <View style={{width: '70%', height: '100%', marginLeft: '13%', marginRight: '17%', }}>
                        {planInfo ? (
                            <Text style={{fontSize: 13}}>
                                {formatDate(planInfo.start_date)} - {formatDate(planInfo.end_date)}
                            </Text>
                        ) : (
                            <Text style={{fontSize: 13}}>2024. 05. 21 (토) - 2024. 05. 23 (월)</Text>
                        )}
                    </View>
                </View>
            </View>
        )
    }

    const goMypage = () =>{
        if(userInfo){
            navigation.navigate('Mypage', {userInfo:userInfo})
        }else{
            navigation.navigate('Signin')
        }
    }

    // 하단 바
    const renderTabBar = () => {
        return (
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Main')}>
                    <Entypo name="home" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={handlePlanCalendarIconPress}>
                    <FontAwesome name="calendar-check-o" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('PinBall')}>
                    <MaterialCommunityIcons name="billiards-rack" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('CommunityList', {userInfo:userInfo})}>
                    <Ionicons name="chatbubbles-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => goMypage()}>
                    <Feather name="user" size={24} color="black" />
                </TouchableOpacity>
            </View>
        );
    };

    // 하단바 일정관리 아이콘
    const handlePlanCalendarIconPress = () => {
        if (userInfo) {
            navigation.navigate("TripCalendar",{userInfo:userInfo});
        } else {
            navigation.navigate("Signin");
        }
    };

    return (
        <View style={styles.container}>
            {renderHeader()}
            {renderTripHeader()}
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
            <ScrollView contentContainerStyle={{backgroundColor: '#fff', flex: 1, alignItems: 'center'}}>
                <View style={{width: '95%', height: '100%'}}>
                    <View style={[styles.center_row, {flexWrap: 'wrap', justifyContent: members.length > 3 ? 'space-between' : 'flex-start', alignItems: 'flex-start'}]}>
                        {[
                            ...(isLeader ? [{
                                mem_seq: 'leader_button', // 고유한 키를 위해 설정
                                isLeaderButton: true
                            }] : []),
                            ...members
                        ].map((member, index) => (
                            <View
                                key={member.mem_seq}
                                style={{width: '27%', aspectRatio: 1, backgroundColor: '#fff', borderColor: '#e8e8e8', borderWidth: 1, borderRadius: 10, marginHorizontal: '3.1%', marginVertical: '2%', position: 'relative'}}
                            >
                                {isLeader && !member.isLeaderButton && member.user_id != userInfo.user_id && (
                                    <TouchableOpacity
                                        style={[styles.deleteIcon, {position: 'absolute', top: 5, right: 5, zIndex: 1}]}
                                        onPress={() => handleDeleteMember(member.mem_seq)}
                                    >
                                        <FontAwesome6 name="circle-minus" size={20} color="#FF7373" />
                                    </TouchableOpacity>
                                )}
                                <View style={[styles.center, {flex: 1}]}>
                                    <View style={[styles.center, {width: '100%', height: '60%', marginTop: '5%'}]}>
                                        {member.isLeaderButton ? (
                                            <TouchableOpacity
                                                onPress={() => setModalVisible(true)}
                                                style={[styles.center, {width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#535353'}]}>
                                                <Entypo name="plus" size={22} color="#fff" />
                                            </TouchableOpacity>
                                        ) : (
                                            member.profile_img ? (
                                                <Image
                                                    style={{width: 45, height: 45, borderRadius: 22.5}}
                                                    resizeMode="cover"
                                                    source={{ uri: member.profile_img }}
                                                />
                                            ) : (
                                                <FontAwesome name="user-circle" size={40} color="grey" />
                                            )
                                        )}
                                    </View>
                                    <View style={[styles.center, {width: '100%', height: '20%', marginTop: '1%'}]}>
                                        <Text style={{fontSize: 12, fontWeight: 'bold'}}>
                                            {member.isLeaderButton ? '초대' : member.user_nick}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
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
            {renderTabBar()}
        </View>
    );
};

const styles = StyleSheet.create({
    /* 상단바 */
    headerContainer: {
        backgroundColor: '#fff',
        height: 85,
        paddingTop: '10%',
        marginBottom: '2%',
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

    /* 하단바 */
    tabBar: {
        height: 60,
        flexDirection: 'row',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        borderBottomWidth: 0.7,
        borderColor: '#EAEAEA',
        marginBottom: '5%'
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
        fontSize: 15,
        fontWeight: 'bold',
        color: '#999',
    },
    tabTextActive: {
        fontSize: 15,
        fontWeight: 'bold',
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
