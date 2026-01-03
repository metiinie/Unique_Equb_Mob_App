import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../application/auth/auth_context';
import { ApiClient } from '../services/api_client';

export const EditProfileScreen = () => {
    const { user, setUser } = useAuth();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const hasChanges = fullName !== user?.fullName || email !== user?.email;

    const handleSave = async () => {
        if (!hasChanges) return;

        if (!fullName.trim() || !email.trim()) {
            Alert.alert("Validation Error", "Please fill in all fields.");
            return;
        }

        setSaving(true);
        try {
            const updatedUser = await ApiClient.patch<any>('/users/me', {
                fullName,
                email
            });
            setUser(updatedUser);
            Alert.alert("Success", "Profile updated successfully.");
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Personal Information</Text>
                <Text style={styles.headerSubtitle}>Keep your profile details up to date</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, (!hasChanges || saving) && styles.saveBtnDisabled]}
                    onPress={handleSave}
                    disabled={!hasChanges || saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
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
    form: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
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
    saveBtn: {
        height: 55,
        backgroundColor: '#2b6cee',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnDisabled: {
        backgroundColor: '#a0c0ff',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
