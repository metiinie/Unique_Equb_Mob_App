import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { useAuth } from '../../application/auth/auth_context';
import { ApiClient } from '../services/api_client';

export const NotificationSettingsScreen = () => {
    const { user, setUser } = useAuth();
    const [stats, setStats] = useState<any>(user?.notificationPreferences || {
        push: true,
        email: true,
        sms: false
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const togglePreference = async (key: string, value: boolean) => {
        const newStats = { ...stats, [key]: value };
        setStats(newStats);

        try {
            const updatedUser = await ApiClient.patch<any>('/users/me', {
                notificationPreferences: newStats
            });
            setUser(updatedUser);
        } catch (error: any) {
            // Revert on failure
            setStats(stats);
            Alert.alert("Error", error.message || "Failed to update preference.");
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Text style={styles.headerSubtitle}>Choose how you want to be notified</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Push Notifications</Text>
                        <Text style={styles.settingDesc}>Receive alerts for contributions and payouts</Text>
                    </View>
                    <Switch
                        value={stats.push}
                        onValueChange={(val) => togglePreference('push', val)}
                        trackColor={{ false: '#ddd', true: '#2b6cee' }}
                        thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
                    />
                </View>

                <View style={[styles.settingItem, styles.borderTop]}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>Email Alerts</Text>
                        <Text style={styles.settingDesc}>Get summaries and reports via email</Text>
                    </View>
                    <Switch
                        value={stats.email}
                        onValueChange={(val) => togglePreference('email', val)}
                        trackColor={{ false: '#ddd', true: '#2b6cee' }}
                        thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
                    />
                </View>

                <View style={[styles.settingItem, styles.borderTop]}>
                    <View style={styles.settingInfo}>
                        <Text style={styles.settingTitle}>SMS Notifications</Text>
                        <Text style={styles.settingDesc}>Important security alerts via SMS</Text>
                    </View>
                    <Switch
                        value={stats.sms}
                        onValueChange={(val) => togglePreference('sms', val)}
                        trackColor={{ false: '#ddd', true: '#2b6cee' }}
                        thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
                    />
                </View>
            </View>

            <View style={styles.footerInfo}>
                <Text style={styles.footerText}>Note: Mandatory system alerts (e.g. security codes) cannot be disabled.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        justifyContent: 'space-between',
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    settingInfo: {
        flex: 1,
        paddingRight: 20,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    settingDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    footerInfo: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    footerText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        lineHeight: 18,
    },
});
