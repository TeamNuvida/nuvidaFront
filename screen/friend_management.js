import * as React from "react";
import {Image, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView} from "react-native";
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {FontAwesome, Entypo, Ionicons, Feather, AntDesign, MaterialCommunityIcons} from '@expo/vector-icons';
import {useState} from 'react';

// 상단 바 컴포넌트
const topHeader = ({navigation, handleNoticeIconPress}) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.flexRow}>
                <View style={{flex: 1}}></View>
                <Text style={styles.headerText}>NUVIDA</Text>
                <View style={styles.headerIconContainer}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('baseballSchedule')}>
                        <AntDesign name="calendar" size={24} color="black"/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={handleNoticeIconPress}>
                        <MaterialCommunityIcons name="bell-plus" size={24} color="black"/>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

// 하단 바 컴포넌트
const bottomHeader = ({navigation, handleNoticeIconPress}) => {
    return (
        <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem}>
                <Entypo name="home" size={24} color="black"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
                <FontAwesome name="calendar-check-o" size={24} color="black"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
                <FontAwesome name="calendar-check-o" size={24} color="black"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
                <Ionicons name="chatbubbles-outline" size={24} color="black"/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
                <Feather name="user" size={24} color="black"/>
            </TouchableOpacity>
        </View>
    );
};

const handleNoticeIconPress = () => {
    console.log("Notice icon pressed");
};

const FriendList = ({navigation}) => {
    const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'

    const renderFriendsList = () => (
        <>
            <TextInput
                style={styles.searchBar}
                placeholder="친구 검색"
                placeholderTextColor="#B7B7B7"
            />
            <ScrollView style={styles.scrollView}>
                {Array.from({length: 5}).map((_, index) => (
                    <View key={index} style={styles.friendItem}>
                        <Image
                            style={styles.profileIcon}
                            source={require("../assets/profile.png")}
                        />
                        <View style={styles.friendInfo}>
                            <Text style={styles.username}>jinyu990055</Text>
                            <Text style={styles.name}>박지뉴</Text>
                        </View>
                        <TouchableOpacity style={styles.deleteFriendButton}>
                            <Text style={styles.deleteFriendText}>친구 삭제</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </>
    );

    const renderFriendRequests = () => (
        <>
            <TextInput
                style={styles.searchBar}
                placeholder="친구 요청"
                placeholderTextColor="#B7B7B7"
            />
            <View style={{alignItems: "center"}}>
                <TouchableOpacity style={styles.requestButton}>
                    <Text style={styles.requestButtonText}>요청</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollView}>
                {Array.from({length: 5}).map((_, index) => (
                    <View key={index} style={styles.friendItem}>
                        <Image
                            style={styles.profileIcon}
                            source={require("../assets/profile.png")}
                        />
                        <View style={styles.friendInfo}>
                            <Text style={styles.username}>jinyu990055</Text>
                            <Text style={styles.name}>박지뉴</Text>
                        </View>
                        <View style={styles.acceptButtons}>
                            <TouchableOpacity style={styles.acceptButton}>
                                <Text style={styles.acceptButtonText}>확인</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.acceptButton}>
                                <Text style={styles.acceptButtonText}>취소</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </>
    );

    return (
        <View style={styles.container}>
            {topHeader({navigation, handleNoticeIconPress})}
            <View style={styles.menuContainer}>
                <View style={styles.menuBackground}>
                    <TouchableOpacity
                        style={[styles.menu, activeTab === 'friends' && styles.activeMenu]}
                        onPress={() => setActiveTab('friends')}
                    >
                        <Text style={styles.menuText}>친구 목록</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.menu, activeTab === 'requests' && styles.activeMenu]}
                        onPress={() => setActiveTab('requests')}
                    >
                        <Text style={styles.menuText}>친구 요청</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {activeTab === 'friends' ? renderFriendsList() : renderFriendRequests()}
            {bottomHeader({navigation, handleNoticeIconPress})}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 16,
    },
    searchBar: {
        height: 40,
        borderRadius: 20,
        borderColor: "#B7B7B7",
        borderWidth: 1,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    friendItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    profileIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    friendInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: "bold",
    },
    name: {
        fontSize: 14,
        color: "#757575",
    },
    deleteFriendButton: {
        backgroundColor: "#DCDCDC",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    deleteFriendText: {
        fontSize: 12,
        color: "#000000",
        fontWeight: "bold",
    },
    /* 하단바 */
    tabBar: {
        height: 50,
        flexDirection: 'row',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    /* 상단바 */
    headerContainer: {
        flexDirection: 'row',
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
    menuContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    menuBackground: {
        flexDirection: 'row',
        width: '60%',
        height: 40,
        backgroundColor: '#DCDCDC', // Color.colorGainsboro
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 2,
    },
    menu: {
        flex: 1,
        height: 35,
        backgroundColor: '#DCDCDC',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    activeMenu: {
        backgroundColor: '#FFFFFF', // Color.colorWhite
    },
    menuText: {
        color: '#000000', // Color.colorBlack
        lineHeight: 20,
        fontSize: 14, // FontSize.size_sm
        textAlign: 'center',
        fontWeight: '500',
    },
    acceptButtons: {
        flexDirection: "row",
    },
    acceptButton: {
        backgroundColor: "#000000",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginRight: 8,
    },
    acceptButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    requestButton: {
        backgroundColor: "#000000",
        borderRadius: 6,
        width: 50,
        height: 30,
    },
    requestButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 5,
    }
});

export default FriendList;
