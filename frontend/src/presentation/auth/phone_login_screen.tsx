import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

interface PhoneLoginScreenProps {
    onBack: () => void;
    onSendCode: (phoneNumber: string) => void;
}

export const PhoneLoginScreen: React.FC<PhoneLoginScreenProps> = ({ onBack, onSendCode }) => {
    const [phoneNumber, setPhoneNumber] = useState('');

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView contentContainerStyle={styles.content} bounces={false}>
                    <View style={styles.headerSection}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                        <Text style={styles.title}>Let's Get Started</Text>
                        <Text style={styles.description}>
                            Enter your phone number to continue. We'll send you a code to verify your account.
                        </Text>
                    </View>

                    {/* Phone Input Group */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputRow}>
                            {/* Country Code */}
                            <View style={styles.countryCodeContainer}>
                                <Text style={styles.flagText}>🇪🇹</Text>
                                <Text style={styles.plusCode}>+251</Text>
                            </View>
                            {/* Input Field */}
                            <View style={styles.inputFieldContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="911 000 000"
                                    placeholderTextColor="#64748b"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* Action Section */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => onSendCode(phoneNumber)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Send Verification Code</Text>
                        </TouchableOpacity>
                        <Text style={styles.footerText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.linkText}>Terms of Service</Text>
                            {' '}and{' '}
                            <Text style={styles.linkText}>Privacy Policy</Text>.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
    },
    topBar: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: '#ffffff',
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 24,
    },
    headerSection: {
        marginBottom: 32,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(43, 108, 238, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    lockIcon: {
        fontSize: 24,
        color: Theme.colors.primary,
    },
    title: {
        ...Theme.typography.h1,
        fontSize: 32,
        color: Theme.colors.text.primary,
        marginBottom: 12,
        textAlign: 'left',
    },
    description: {
        ...Theme.typography.body,
        color: Theme.colors.text.secondary,
        lineHeight: 24,
        textAlign: 'left',
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        ...Theme.typography.caption,
        fontSize: 14,
        fontWeight: '500',
        color: Theme.colors.text.primary,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    countryCodeContainer: {
        width: 110,
        height: 56,
        borderRadius: 8,
        backgroundColor: '#282e39',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    flagText: {
        fontSize: 20,
        marginRight: 8,
    },
    plusCode: {
        ...Theme.typography.body,
        color: Theme.colors.text.primary,
        fontWeight: '500',
    },
    inputFieldContainer: {
        flex: 1,
    },
    input: {
        height: 56,
        borderRadius: 8,
        backgroundColor: '#282e39',
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'Plus Jakarta Sans',
        fontWeight: '500',
        color: '#ffffff',
    },
    spacer: {
        flex: 1,
        minHeight: 40,
    },
    actionSection: {
        alignItems: 'center',
        gap: 16,
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: Theme.colors.primary,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        ...Theme.typography.button,
        fontSize: 16,
        color: '#ffffff',
    },
    footerText: {
        ...Theme.typography.caption,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 16,
    },
    linkText: {
        color: Theme.colors.primary,
        fontWeight: '500',
    },
});
