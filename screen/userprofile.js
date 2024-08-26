import * as React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {MaterialCommunityIcons, AntDesign} from '@expo/vector-icons';

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


const handleNoticeIconPress = () => {
    console.log("Notice icon pressed");
};

const Userprofile = ({navigation}) => {
    return (
        <View style={styles.container}>
            {topHeader({navigation, handleNoticeIconPress})}
            <View style={styles.logoBackgroundWrapper}>
                <View style={styles.logoBackground}/>
            </View>
            <View style={styles.profileContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>별명</Text>
                    <TextInput style={styles.inputBackground} placeholder="별명을 입력하세요" placeholderTextColor="gray"/>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>프로필사진</Text>
                    <TextInput style={styles.inputBackground} placeholder="프로필사진" placeholderTextColor="gray"/>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>비밀번호</Text>
                    <TextInput style={styles.inputBackground} placeholder="asdf123456" placeholderTextColor="gray"
                               secureTextEntry={true}/>
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>휴대폰 번호</Text>
                    <TextInput style={styles.inputBackground} placeholder="010-0000-0000" placeholderTextColor="gray"
                               keyboardType="phone-pad"/>
                </View>
            </View>
            <View style={styles.buttonContainer}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>취소</Text>
                </View>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>수정</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "white",
        justifyContent: "space-between",
    },
    logoText: {
        fontSize: 15,
        lineHeight: 20,
        color: "black",
        fontWeight: "500",
        textAlign: "center",
    },
    logoBackgroundWrapper: {
        alignItems: "center",
        marginBottom: 16,
    },
    logoBackground: {
        width: 58,
        height: 58,
        backgroundColor: "white",
        borderRadius: 15,
        shadowColor: "rgba(0, 0, 0, 0.25)",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 4,
        elevation: 4,
        shadowOpacity: 1,
    },
    profileContainer: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        lineHeight: 21,
        color: "black",
        fontWeight: "400",
        marginBottom: 8,
    },
    inputBackground: {
        height: 33,
        backgroundColor: "whitesmoke",
        borderRadius: 15,
        borderColor: "lightgray",
        borderWidth: 0.5,
        justifyContent: "center",
        paddingLeft: 16,
        fontSize: 15,
        color: "black",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
    },
    button: {
        height: 36,
        width: 79,
        backgroundColor: "black",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "400",
        lineHeight: 22,
        fontSize: 15,
    },
    profileIconWrapper: {
        alignItems: "center",
        marginTop: 16,
    },
    profileIcon: {
        width: 48,
        height: 46,
    },
    /* 상단바 */
    headerContainer: {
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
});

export default Userprofile;
