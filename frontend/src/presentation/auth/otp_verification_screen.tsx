import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

interface OtpVerificationScreenProps {
    phoneNumberEnding: string;
    onBack: () => void;
    onVerify: (otp: string) => void;
    onResend: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
    phoneNumberEnding,
    onBack,
    onVerify,
    onResend
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Top Navigation */}
                <View style={styles.topBar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    <View style={{ width: 40 }} />
                </View>

                {/* Main Content */}
                <ScrollView contentContainerStyle={styles.content} bounces={false}>
                    {/* Icon Section */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.lockIcon}>👤</Text>
                        </View>
                    </View>

                    {/* Headline Section */}
                    <Text style={styles.title}>Verification Code</Text>
                    <Text style={styles.description}>
                        We have sent the code verification to your mobile number ending in {' '}
                        <Text style={styles.boldText}>**{phoneNumberEnding}</Text>.
                    </Text>

                    {/* OTP Input Group */}
                    <View style={styles.otpOuterContainer}>
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={ref => { inputs.current[index] = ref; }}
                                    style={[
                                        styles.otpInput,
                                        digit ? styles.otpInputActive : null
                                    ]}
                                    value={digit}
                                    onChangeText={(v) => handleOtpChange(v, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    textAlign="center"
                                    placeholderTextColor={Theme.colors.text.muted}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Resend Timer */}
                    <View style={styles.timerSection}>
                        <Text style={styles.timerText}>
                            Resend code in <Text style={styles.timerHighlight}>00:59</Text>
                        </Text>
                        <TouchableOpacity onPress={onResend} disabled style={styles.resendButton}>
                            <Text style={styles.resendText}>Didn't receive code?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Action Area */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity
                            style={[styles.button, !isComplete && styles.buttonDisabled]}
                            onPress={() => onVerify(otp.join(''))}
                            activeOpacity={0.8}
                            disabled={!isComplete}
                        >
                            <Text style={styles.buttonText}>Verify</Text>
                            <Text style={styles.buttonIcon}>✓</Text>
                        </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 32,
        color: '#ffffff',
        fontWeight: '200',
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockIcon: {
        fontSize: 40,
        color: Theme.colors.primary,
    },
    title: {
        ...Theme.typography.h1,
        fontSize: 30,
        color: Theme.colors.text.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        ...Theme.typography.body,
        color: Theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 280,
        marginBottom: 32,
    },
    boldText: {
        fontWeight: '700',
        color: '#ffffff',
    },
    otpOuterContainer: {
        width: '100%',
        marginBottom: 32,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    otpInput: {
        width: 44,
        height: 56,
        borderRadius: 8,
        backgroundColor: '#1a212e',
        borderWidth: 1,
        borderColor: '#3b4354',
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '700',
    },
    otpInputActive: {
        borderColor: Theme.colors.primary,
    },
    timerSection: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-start',
    },
    timerText: {
        ...Theme.typography.caption,
        fontSize: 14,
        color: Theme.colors.text.secondary,
        fontWeight: '500',
    },
    timerHighlight: {
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    resendButton: {
        marginTop: 8,
    },
    resendText: {
        ...Theme.typography.caption,
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    actionSection: {
        width: '100%',
        marginTop: 32,
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: Theme.colors.primary,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        ...Theme.typography.button,
        fontSize: 16,
        color: '#ffffff',
    },
    buttonIcon: {
        fontSize: 20,
        color: '#ffffff',
    },
});
