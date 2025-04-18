import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from 'sonner-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Layout = () => {
    return (
        <SafeAreaProvider style={styles.container}>
            <Toaster />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopWidth: 0,
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    },
                    tabBarActiveTintColor: '#2D3436',
                    tabBarInactiveTintColor: '#95A5A6',
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="home" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="send"
                    options={{
                        title: "Send",
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="send" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="history"
                    options={{
                        title: "Activity",
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="clock-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "Settings",
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="cog" size={size} color={color} />
                        ),
                    }}
                />
            </Tabs>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
});

export default Layout;
