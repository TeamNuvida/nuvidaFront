import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const NoticeList = ({ route }) => {
    const navigation = useNavigation();
    const NotiList = [
        { "message": "박지뉴님의 친구 요청이 도착했습니다.", "nt_at": "2024-06-27", "nt_type": "1" },
        { "message": "박지뉴님이 여행일정에 초대했습니다.", "nt_at": "2024-06-27", "nt_type": "2" },
        { "message": "2024-07-02 광주 여행 3일전입니다", "nt_at": "2024-06-27", "nt_type": "0" },
    ];

    const handleAccept = (noti) => {
        // 수락 버튼 클릭 처리
        console.log("Accepted:", noti);
    };

    const handleReject = (noti) => {
        // 거절 버튼 클릭 처리
        console.log("Rejected:", noti);
    };

    // Header 컴포넌트
    const Header = () => {
        return (
            <View>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>NUVIDA</Text>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />

            {/* 알림 목록 출력 */}
            {NotiList.length > 0 ? (
                <ScrollView>
                    {NotiList.map((noti, index) => (
                        <View key={index} style={styles.notiItem}>
                            <Text style={styles.notiText}>{noti.message}</Text>
                            {(noti.nt_type === "1" || noti.nt_type === "2") && (
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.acceptButton]}
                                        onPress={() => handleAccept(noti)}
                                    >
                                        <Text style={styles.buttonText}>수락</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.rejectButton]}
                                        onPress={() => handleReject(noti)}
                                    >
                                        <Text style={styles.rejectbuttonText}>거절</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.noNoti}>
                    <Text style={styles.noNotiText}>알림이 없습니다.</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FCFCFC", // SafeAreaView 색상을 배경색과 일치시키기
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        marginBottom: 20,
        paddingTop: 50
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color:"red"
    },
    notiItem: {
        padding: 10,
        borderWidth: 2,
        borderColor: "white",
        borderRadius: 10,
        margin: 10,
        backgroundColor: 'white', // 그림자가 보이려면 배경색이 있어야 합니다.
        shadowColor: '#000', // 그림자 색
        shadowOffset: { width: 0, height: 2 }, // 그림자 방향 (이 경우 아래로)
        shadowOpacity: 0.25, // 그림자 투명도
        shadowRadius: 3.84, // 그림자 블러 반경
        elevation: 5, // Android에서는 elevation으로 그림자를 조절
    },
    notiText: {
        fontSize: 15,
        margin: 5,
        textAlign:"center"
    },
    notiAt: {
        fontSize: 10,
        textAlign: "right",
        paddingBottom: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginHorizontal: 5,
    },
    acceptButton: {
        backgroundColor: "#000000",
        borderColor:"#000000",
        borderWidth: 1
    },
    rejectButton: {
        backgroundColor: "#ffffff",
        borderColor:"#000000",
        borderWidth: 1
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
    rejectbuttonText: {
        color: "#000000",
        fontWeight: "bold",
    },
    noNoti: {
        alignItems: 'center',
    },
    noNotiText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default NoticeList;
