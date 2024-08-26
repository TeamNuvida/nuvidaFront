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

const CommunityCard = ({imageSource, title, subtitle, description, date}) => {
    return (
        <View style={{alignItems: "center"}}>
            <View style={styles.cardContainer}>
                <Image source={imageSource} style={styles.image}/>
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{title}</Text>
                    <Text style={styles.subtitleText}>{subtitle}</Text>
                    <Text style={styles.descriptionText}>{description}</Text>
                    <Text style={styles.dateText}>{date}</Text>
                </View>
            </View>
        </View>
    );
};
const CommentCard = ({imageSource, title, subtitle, description, date}) => {
    return (
        <View style={{alignItems: "center"}}>
            <View style={styles.cardContainer}>
                <Image source={imageSource} style={styles.image}/>
                <View style={styles.textContainer}>
                    <Text style={styles.titleText}>{title}</Text>
                    <Text style={styles.subtitleText}>{subtitle}</Text>
                    <Text style={styles.descriptionText}>{description}</Text>
                    <Text style={styles.dateText}>{date}</Text>
                </View>
            </View>
        </View>
    );
};

const MypostList = ({navigation}) => {
    const [activeTab, setActiveTab] = useState('community'); // 'community' or 'comment'

    const renderCommunityList = () => (
        <>
            <CommunityCard
                imageSource={require('../assets/profile.png')}
                title="축제"
                subtitle="함평 나비 축제"
                description="전라남도 함평 축제"
                date="2024.05.28~2024.05.30"
            />
        </>
    );

    const renderCommentList = () => (
        <>
            <CommentCard
                imageSource={require('../assets/profile.png')}
                title="커뮤니티"
                subtitle="ㅁㄴㅇㄹ"
                description="ㅁㅇㄹ"
                date="2024.05.28~2024.05.30"
            />
        </>
    );

    return (
        <View style={styles.container}>
            {topHeader({navigation, handleNoticeIconPress})}
            <ScrollView>
                <View style={styles.menuContainer}>
                    <View style={styles.menuBackground}>
                        <TouchableOpacity
                            style={[styles.menu, activeTab === 'community' && styles.activeMenu]}
                            onPress={() => setActiveTab('community')}
                        >

                            <Text style={styles.menuText}>커뮤니티글</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.menu, activeTab === 'comment' && styles.activeMenu]}
                            onPress={() => setActiveTab('comment')}
                        >
                            <Text style={styles.menuText}>작성한 댓글</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {activeTab === 'community' ? renderCommunityList() : renderCommentList()}
            </ScrollView>
            {bottomHeader({navigation, handleNoticeIconPress})}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
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
    cardContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 2},
        elevation: 3,
        width: '90%',
        marginVertical: 10,
        padding: 15,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitleText: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    descriptionText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },

});

export default MypostList;
