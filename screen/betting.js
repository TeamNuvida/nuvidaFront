import React, { useState, useEffect  } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";

const Betting = () => {
    const navigation = useNavigation();
    const [currentTab, setCurrentTab] = useState('list');

    const [matchList, setMatchList] = useState([
        { bs_seq: 1, op_team: '롯데', logo_img: 6, match_date: '2024-08-13 18:30:00', kiaBtPoint: 10000, opBtPoint: 10000, team_name: 'kia', bt_point: 1000 },
        { bs_seq: 2, op_team: '롯데', logo_img: 6, match_date: '2024-08-14 18:30:00', kiaBtPoint: 0, opBtPoint: 0, team_name: null, bt_point: 0 },
        { bs_seq: 3, op_team: 'ssg', logo_img: 9, match_date: '2024-08-15 18:30:00', kiaBtPoint: 0, opBtPoint: 0, team_name: null, bt_point: 0 },
    ]);

    const [batList, setBatList] = useState([
        { bs_seq: 1, op_team: '롯데', logo_img: 6, match_date: '2024-08-13 18:30:00', kiaBtPoint: 10000, opBtPoint: 10000, team_name: 'kia', bt_point: 1000 },]);


    const [bettingPoints, setBettingPoints] = useState({});
    const [selectedTeams, setSelectedTeams] = useState({});

    const logo = [
        require("../assets/KIA.png"),
        require("../assets/doodan_bears.png"),
        require("../assets/hanwha.png"),
        require("../assets/kiwoom_heroes.png"),
        require("../assets/kt_wiz.png"),
        require("../assets/lgtwins.png") ,
        require("../assets/lotte_giants.png") ,
        require("../assets/nc_dinos.png"),
        require("../assets/samsung_lions.png") ,
        require("../assets/ssg_landers.png"),
    ];

    const userInfo = {user_id:'test', user_nick:'test', user_point:200}

    const localhost = '192.168.55.35';

    const [battingList, setBattingList] = useState(null);


    const getUserBattingList = async () => {
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getUserBattingList`, {user_id:userInfo.user_id});
            setBattingList(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }
    };

    const getBattingList = async () => {
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getBattingList`, {user_id:userInfo.user_id});
            setBattingList(response.data);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }
    };

    useEffect(() => {
        getBattingList();
    }, []);



    const toggleTab = (tab) => {
        setCurrentTab(tab);
        if(tab === 'list'){
            getBattingList();
        } else {
            getUserBattingList();
        }
    };



    const handleBet = async(bs_seq, op_seq, bt_point) => {
        const points = parseInt(bettingPoints[bs_seq]) || 0;
        const team_name = selectedTeams[bs_seq] || battingList.find(game => game.bs_seq === bs_seq)?.team_name;

        console.log(bs_seq, bt_point, points)

        if (isNaN(value)) {
            Alert.alert('숫자만 입력 가능합니다.');
            return;
        }

        if(points == 0){
            Alert.alert('포인트를 입력해주세요');
        }

        console.log(currentTab)

        if(op_seq == 0){
            if (!team_name) {
                Alert.alert('팀을 선택해주세요.');
                return;
            }
            console.log("배팅 전")
            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/setUserBT`, {user_id:userInfo.user_id, bs_seq:bs_seq, selectedTeam:team_name, betPoint:points});
                if(currentTab=='list'){
                    getBattingList();
                } else {
                    getUserBattingList();
                }
            } catch (error) {
                console.error('Error fetching plan data:', error);
            }

        }else {
            console.log("배팅")

            try {
                const response = await axios.post(`http://${localhost}:8090/nuvida/UpDateUserBT`, {user_id:userInfo.user_id, bs_seq:bs_seq, nowPoint:bt_point, betPoint:points});
                if(currentTab=='list'){
                    getBattingList();
                } else {
                    getUserBattingList();
                }
            } catch (error) {
                console.error('Error fetching plan data:', error);
            }
        }

        setBettingPoints({ ...bettingPoints, [bs_seq]: '' });
    };

    const handleInputChange = (bs_seq, value) => {
        setBettingPoints({ ...bettingPoints, [bs_seq]: value });
    };

    const selectTeam = (bs_seq, team) => {
        setSelectedTeams({ ...selectedTeams, [bs_seq]: team });
    };

    const calculateWinRate = (kiaBtPoint, opBtPoint) => {
        const totalPoints = kiaBtPoint + opBtPoint;
        const kiaRate = totalPoints === 0 ? 0 : (kiaBtPoint / totalPoints) * 100;
        const opRate = totalPoints === 0 ? 0 : (opBtPoint / totalPoints) * 100;
        return { kiaRate: kiaRate.toFixed(0), opRate: opRate.toFixed(0) };
    };

    const getPoint = async (bs_seq, bt_point) =>{
        try {
            const response = await axios.post(`http://${localhost}:8090/nuvida/getBtPoint`, {user_id:userInfo.user_id, bs_seq:bs_seq, getPoint:bt_point});
            if(currentTab=='list'){
                getBattingList();
            } else {
                getUserBattingList();
            }
        } catch (error) {
            console.error('Error fetching plan data:', error);
        }
    };

    const renderItem = ({ item }) => {
        const { kiaRate, opRate } = calculateWinRate(item.kiaBtPoint, item.opBtPoint);


        return (
            <View style={[styles.gameContainer, item.op_seq ? (item.op_seq === 1 ? styles.kiaBg : styles.opTeamBg) : null]}>
                <View style={styles.teamRow}>
                    <Image source={require('../assets/KIA.png')} style={{ width: 38, height: 28, marginTop: 5 }} />
                    <Text style={styles.teamName}>KIA</Text>

                    <Text style={styles.percentageText}>{item.kiaBtPoint}p ({kiaRate}%)</Text>
                    <Text style={styles.versus}>VS</Text>
                    <Text style={styles.percentageText}>{item.opBtPoint}p ({opRate}%)</Text>

                    <Image source={logo[Number(item.logo_img)]} style={{ width: 38, height: 28, marginTop: 5 }} />
                    <Text style={styles.teamName}>{item.op_team}</Text>
                </View>
                <Text style={styles.matchDate}>{item.match_date.split(' ')[0]}</Text>
                <Text>현재 보유한 포인트 : {userInfo.user_point}</Text>
                {item.op_seq > 0 && (<Text>베팅한 포인트 : {item.bt_point}</Text>)}

                {item.result == '4' ?
                    (
                        <Text>포인트 회수 완료</Text>
                    ):
                    item.result == '2' || item.result == '3' ?
                        (
                            <Text>예측 실패</Text>
                        ) :
                        item.result == '1' ?
                            (

                                <TouchableOpacity onPress={() => getPoint(item.bs_seq, item.bt_point)}>
                                    <View style={styles.getpoint}>
                                    <Text style={styles.getpointText}>포인트 받기</Text>
                                    </View>
                                </TouchableOpacity>
                            ):
                            (
                                <View style={styles.bettingArea}>
                                    {item.op_seq === 0 && (
                                        <View>
                                            <Text style={styles.selectTeamText}>팀을 선택하세요:</Text>
                                            <View style={styles.teamSelection}>
                                                <TouchableOpacity onPress={() => selectTeam(item.bs_seq, 'KIA')} style={[styles.teamButton, selectedTeams[item.bs_seq] === 'KIA' ? styles.selected : null]}>
                                                    <Text style={styles.buttonText}>KIA</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => selectTeam(item.bs_seq, item.op_team)} style={[styles.teamButton, selectedTeams[item.bs_seq] === item.op_team ? styles.selected : null]}>
                                                    <Text style={styles.buttonText}>{item.op_team}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                    <TextInput
                                        placeholder="포인트 입력"
                                        value={bettingPoints[item.bs_seq] || ''}
                                        onChangeText={(value) => handleInputChange(item.bs_seq, value)}
                                        keyboardType="numeric"
                                        style={styles.input}
                                    />
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity onPress={() => handleBet(item.bs_seq, item.op_seq, item.bt_point)} style={styles.betButton}>
                                            <Text style={styles.buttonText}>{item.team_name === null ? '베팅하기' : '추가 베팅하기'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )
                }


            </View>
        );
    };

    const filteredList = battingList;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>NUVIDA</Text>
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        onPress={() => toggleTab('list')}
                        style={[
                            styles.tabButton,
                            currentTab === 'list' ? styles.activeTabButton : styles.inactiveTabButton
                        ]}
                    >
                        <Text style={currentTab === 'list' ? styles.activeTabText : styles.inactiveTabText}>
                            배팅목록
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => toggleTab('myBets')}
                        style={[
                            styles.tabButton,
                            currentTab === 'myBets' ? styles.activeTabButton : styles.inactiveTabButton
                        ]}
                    >
                        <Text style={currentTab === 'myBets' ? styles.activeTabText : styles.inactiveTabText}>
                            내가 한 베팅
                        </Text>
                    </TouchableOpacity>
                </View>
                {filteredList?
                    (
                        <FlatList
                            data={filteredList}
                            renderItem={renderItem}
                            keyExtractor={item => item.bs_seq.toString()}
                            contentContainerStyle={{ paddingBottom: 100 }} // 키패드가 가리지 않도록 하단 여백 추가
                        />
                    ) : (
                        <View style={styles.nullItem}>
                            <Text >배팅 목록이 없습니다.</Text>
                        </View>

                    )
                }

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    tabButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    activeTabButton: {
        backgroundColor: '#f00',
    },
    inactiveTabButton: {
        backgroundColor: '#ddd',
    },
    activeTabText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    inactiveTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    gameContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
    },
    kiaBg: {
        backgroundColor: '#ffcccc',
    },
    opTeamBg: {
        backgroundColor: '#cce5ff',
    },
    teamRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    teamName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    percentageText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    versus: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
    },
    matchDate: {
        fontSize: 14,
        color: '#888',
        marginTop: 10,
        alignSelf: 'center',
    },
    bettingArea: {
        marginTop: 10,
        alignItems: 'center',
    },
    selectTeamText: {
        fontSize: 14,
        marginBottom: 10,
    },
    teamSelection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    teamButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 4,
        minWidth: '40%',
        alignItems: 'center',
    },
    selected: {
        backgroundColor: '#f00',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 4,
        width: '100%',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    betButton: {
        backgroundColor: '#f00',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginTop: 20,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'red',
        textAlign: 'center',
        flex: 1,
    },
    getpoint:{
        backgroundColor: '#000000',
        marginTop: 10,
        padding: 10,
        borderRadius: 4,
        minWidth: '40%',
        alignItems: 'center',
    },
    getpointText:{
        color:'white'

    },
    nullItem:{
        alignItems: 'center',
    }
});

export default Betting;