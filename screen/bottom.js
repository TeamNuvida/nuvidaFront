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
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

const Bottom = () => {
    return (
        <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem}>
                <Entypo name="home" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} >
                <FontAwesome name="calendar-check-o" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem} >
                <FontAwesome name="calendar-check-o" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity  style={styles.tabItem}>
                <Ionicons name="chatbubbles-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity  style={styles.tabItem}>
                <Feather name="user" size={24} color="black" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: 70,
        flexDirection: 'row',
        borderTopColor: '#ccc',
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Bottom;
