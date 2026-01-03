import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Theme } from '../theme';
import { TextInput } from '../components/TextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { GlassCard } from '../components/GlassCard';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';
import { UserDto } from '../../domain/dtos';

/**
 * HUMBLE LOGIN SCREEN
 * Reflects Option A: Email/Password Authentication (Backend Reality).
 */
export const LoginScreen: React.FC = () => {
    const { setUser } = useAuth();
    // TASK A: Default screen = Sign Up
    const [isSignUp, setIsSignUp] = useState(true);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        if (!email || !password || (isSignUp && !fullName)) {
            Alert.alert('Missing Info', 'All fields are required.');
            return;
        }

        setLoading(true);
        console.log(`[LoginScreen] Starting ${isSignUp ? 'SignUp' : 'SignIn'}...`);

        try {
            const endpoint = isSignUp ? '/auth/signup' : '/auth/login';
            const payload = isSignUp
                ? { email: email.trim(), password, fullName: fullName.trim() }
                : { email: email.trim(), password };

            // 1. Authenticate (Ignore response body - strictly rely on cookie)
            console.log(`[LoginScreen] Calling ${endpoint} with:`, { email: payload.email, fullName: (payload as any).fullName });
            await ApiClient.post<any>(endpoint, payload);
            console.log('[LoginScreen] Auth mutation successful.');

            // 2. Success - Verify session via /auth/me (Single Source of Truth)
            console.log('[LoginScreen] Waiting for cookie propagation...');
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms defensive delay

            console.log('[LoginScreen] Verifying session via /auth/me...');
            const userData = await ApiClient.get<UserDto>('/auth/me');
            console.log('[LoginScreen] Session verified:', userData);

            // 3. Hydrate local session state
            setUser(userData);
        } catch (error: any) {
            console.error('[LoginScreen] Auth Error:', error);

            // AUTH HARDENING: Handle specific cases
            if (error.message === 'UNAUTHENTICATED') {
                Alert.alert('Authentication Failed', 'Invalid credentials or session expired.');
            } else {
                Alert.alert('Authentication Failed', error.message || 'Verification failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Unique Equb</Text>
                <Text style={styles.subtitle}>Institutional Grade Rotating Savings</Text>
            </View>

            <GlassCard padding="lg">
                {/* TASK A: Title varies by mode */}
                <Text style={[Theme.typography.h3, { marginBottom: Theme.spacing.lg }]}>
                    {isSignUp ? "Register now" : "Welcome Back"}
                </Text>

                {isSignUp && (
                    <TextInput
                        label="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="John Doe"
                        autoCapitalize="words"
                        editable={!loading}
                    />
                )}

                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                />

                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                    editable={!loading}
                />

                <View style={styles.spacer} />

                <PrimaryButton
                    label={isSignUp ? "Create Account" : "Sign In"}
                    onPress={handleAuth}
                    loading={loading}
                />

                {/* TASK A: Bottom switch (anchor-style) */}
                <View style={styles.switchContainer}>
                    <Text style={styles.switchText}>
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <Text
                            style={styles.switchLink}
                            onPress={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? "Sign in" : "Create one"}
                        </Text>
                    </Text>
                </View>
            </GlassCard>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Authorized access only. All activity is audited.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: Theme.colors.background,
        padding: Theme.spacing.lg,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl * 2,
    },
    title: {
        ...Theme.typography.h1,
        color: Theme.colors.primary,
        fontSize: 32,
    },
    subtitle: {
        ...Theme.typography.caption,
        color: Theme.colors.text.secondary,
        marginTop: Theme.spacing.xs,
    },
    switchContainer: {
        marginTop: Theme.spacing.lg,
        alignItems: 'center',
    },
    switchText: {
        ...Theme.typography.body,
        color: Theme.colors.text.secondary,
    },
    switchLink: {
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
    spacer: {
        height: Theme.spacing.md,
    },
    footer: {
        marginTop: Theme.spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        ...Theme.typography.caption,
        color: Theme.colors.text.secondary,
        fontStyle: 'italic',
    },
});
