import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
    const { signOut, authData } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>
                
                <View style={styles.profileSection}>
                    <View style={styles.profileIcon}>
                        <MaterialCommunityIcons name="account-circle" size={80} color="#2D3436" />
                    </View>
                    <Text style={styles.profileName}>{authData?.userName || 'User'}</Text>
                    <Text style={styles.profileEmail}>{authData?.email || 'user@example.com'}</Text>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="account-edit" size={24} color="#2D3436" />
                        <Text style={styles.menuText}>Edit Profile</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="shield-lock" size={24} color="#2D3436" />
                        <Text style={styles.menuText}>Security</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color="#2D3436" />
                        <Text style={styles.menuText}>Notifications</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="theme-light-dark" size={24} color="#2D3436" />
                        <Text style={styles.menuText}>App Theme</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="translate" size={24} color="#2D3436" />
                        <Text style={styles.menuText}>Language</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Other</Text>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="help-circle-outline" size={24} color="#2D3436" />
                        <Text style={styles.menuText}>Help & Support</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="information-outline" size={24} color="#2D3436" />
                        <Text style={styles.menuText}>About</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#95A5A6" />
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                >
                    <MaterialCommunityIcons name="logout" size={20} color="white" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D3436',
    },
    profileSection: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
        marginHorizontal: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileIcon: {
        marginBottom: 10,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D3436',
    },
    profileEmail: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#7f8c8d',
        marginLeft: 20,
        marginBottom: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 8,
    },
    menuText: {
        fontSize: 16,
        color: '#2D3436',
        flex: 1,
        marginLeft: 15,
    },
    signOutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FF4757',
        padding: 15,
        marginHorizontal: 20,
        borderRadius: 10,
        marginBottom: 30,
    },
    signOutText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    }
});

export default Settings;
