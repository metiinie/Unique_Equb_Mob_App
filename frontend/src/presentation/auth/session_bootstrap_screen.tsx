import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';
import { UserDto } from '../../domain/dtos';
import { Theme } from '../theme';

export const SessionBootstrapScreen: React.FC = () => {
    const { setUser } = useAuth();

    useEffect(() => {
        const checkSession = async () => {
            try {
                // HUMBLE: Asking backend for "me"
                const user = await ApiClient.get<UserDto>('/auth/me');
                setUser(user);
            } catch (error) {
                // If 401/403 or network error, session is invalid
                setUser(null);
            }
        };

        checkSession();
    }, [setUser]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={styles.text}>Initializing Secure Session...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        ...Theme.typography.caption,
        color: Theme.colors.text.secondary,
        marginTop: Theme.spacing.md,
    },
});
