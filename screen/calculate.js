import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Ionicons, Feather } from '@expo/vector-icons';

const calculate = ({ navigation }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [items, setItems] = useState([
        { title: '광전제과', price: 128000 },
        { title: '광주패밀리랜드', price: 22000 }
    ]);

    const handleAddItem = () => {
        if (newItemTitle && newItemPrice) {
            setItems([...items, { title: newItemTitle, price: parseInt(newItemPrice) }]);
            setNewItemTitle('');
            setNewItemPrice('');
            setModalVisible(false);
        } else {
            alert("제목과 금액을 입력하세요.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => { /* Back button action */ }}>
                    <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => { /* Delete button action */ }}>
                    <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.location}>광 주</Text>
                    <Text style={styles.date}>2024. 05. 21 (화) - 2024. 05. 23 (목)</Text>
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={styles.tabButton}>
                        <Text style={styles.tabText}>여행일정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton}>
                        <Text style={styles.tabText}>예약정보</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButton}>
                        <Text style={styles.tabText}>멤버목록</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tabButtonActive}>
                        <Text style={styles.tabTextActive}>정산하기</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.boxContainer}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.totalAmountLabel}>총액</Text>
                        <Text style={styles.totalAmount}>150,000원</Text>
                        <View style={styles.itemList}>
                            {items.map((item, index) => (
                                <View key={index} style={styles.item}>
                                    <Text style={styles.itemName}>{item.title}</Text>
                                    <Text style={styles.itemPrice}>{item.price.toLocaleString()}원</Text>
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
                        <Text style={styles.footerText}>3명</Text>
                        <Button title="정산하기" onPress={() => { /* 정산하기 action */ }} />
                    </View>
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>1인당금액</Text>
                        <Text style={styles.perPersonAmount}>50,000원</Text>
                    </View>
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
                                onPress={() => setModalVisible(!modalVisible)}
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
});

export default calculate;
