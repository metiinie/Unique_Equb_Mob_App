import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { ApiClient } from '../services/api_client';

export const SecurityScreen = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "New password must be at least 6 characters.");
            return;
        }

        setSaving(true);
        try {
            await ApiClient.post('/users/me/change-password', {
                currentPassword,
                newPassword
            });
            Alert.alert("Success", "Password updated successfully.");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update password.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Account Security</Text>
                <Text style={styles.headerSubtitle}>Manage your password and security settings</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Change Password</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Current Password</Text>
                    <TextInput
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        placeholder="••••••••"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        placeholder="••••••••"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="••••••••"
                        placeholderTextColor="#999"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.actionBtn, saving && styles.actionBtnDisabled]}
                    onPress={handleUpdatePassword}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.actionBtnText}>Update Password</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Password Requirements</Text>
                <Text style={styles.infoText}>• Minimum 6 characters</Text>
                <Text style={styles.infoText}>• Use a mix of letters and numbers for better security</Text>
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
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        height: 50,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#eee',
    },
    actionBtn: {
        height: 55,
        backgroundColor: '#2b6cee',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    actionBtnDisabled: {
        backgroundColor: '#a0c0ff',
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    infoBox: {
        marginTop: 30,
        backgroundColor: '#eef3ff',
        padding: 20,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2b6cee',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2b6cee',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 5,
        lineHeight: 20,
    },
});
