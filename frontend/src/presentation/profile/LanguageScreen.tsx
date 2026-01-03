import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert
} from 'react-native';
import { useAuth } from '../../application/auth/auth_context';
import { ApiClient } from '../services/api_client';

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
    { code: 'om', name: 'Oromo', native: 'Afaan Oromoo' },
    { code: 'fr', name: 'French', native: 'Français' },
];

export const LanguageScreen = () => {
    const { user, setUser } = useAuth();
    const [selectedLanguage, setSelectedLanguage] = useState(user?.language || 'en');
    const [saving, setSaving] = useState(false);

    const handleLanguageSelect = async (code: string) => {
        if (code === selectedLanguage) return;

        setSelectedLanguage(code);
        setSaving(true);
        try {
            const updatedUser = await ApiClient.patch<any>('/users/me', {
                language: code
            });
            setUser(updatedUser);
            Alert.alert("Success", "App language updated.");
        } catch (error: any) {
            setSelectedLanguage(selectedLanguage);
            Alert.alert("Error", error.message || "Failed to update language.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Language Selection</Text>
                <Text style={styles.headerSubtitle}>Choose your preferred language for the app</Text>
            </View>

            <View style={styles.list}>
                {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.langItem,
                            selectedLanguage === lang.code && styles.langItemActive
                        ]}
                        onPress={() => handleLanguageSelect(lang.code)}
                        disabled={saving}
                    >
                        <View style={styles.langInfo}>
                            <Text style={[
                                styles.langName,
                                selectedLanguage === lang.code && styles.textActive
                            ]}>{lang.name}</Text>
                            <Text style={styles.langNative}>{lang.native}</Text>
                        </View>
                        {selectedLanguage === lang.code && (
                            <Text style={styles.checkIcon}>✓</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    Note: Some features may still display in English as we continue to translate the platform.
                </Text>
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
    list: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        justifyContent: 'space-between',
    },
    langItemActive: {
        backgroundColor: '#f0f5ff',
    },
    langInfo: {
        flex: 1,
    },
    langName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    langNative: {
        fontSize: 13,
        color: '#888',
    },
    textActive: {
        color: '#2b6cee',
    },
    checkIcon: {
        fontSize: 20,
        color: '#2b6cee',
        fontWeight: '700',
    },
    infoBox: {
        marginTop: 30,
        paddingHorizontal: 10,
    },
    infoText: {
        fontSize: 13,
        color: '#888',
        lineHeight: 18,
        textAlign: 'center',
    },
});
