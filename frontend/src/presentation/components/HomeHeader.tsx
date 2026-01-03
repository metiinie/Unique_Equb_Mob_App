import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeHeaderProps {
    userName: string;
    greeting: string;
    roleLabel: string;
    onNotificationPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    userName,
    greeting,
    roleLabel,
    onNotificationPress
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <View style={styles.avatarWrapper}>
                    <LinearGradient
                        colors={['#2b6cee', '#4f83f1']}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarInitial}>
                            {userName.charAt(0).toUpperCase()}
                        </Text>
                    </LinearGradient>
                    <View style={styles.activeDot} />
                </View>
                <View style={styles.textWrapper}>
                    <Text style={styles.roleLabel}>{roleLabel}</Text>
                    <Text style={styles.userName}>{userName}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.notificationBtn}
                onPress={onNotificationPress}
            >
                <View style={styles.notificationIndicator} />
                <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    avatarInitial: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '800',
    },
    activeDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#101622',
    },
    textWrapper: {
        gap: 2,
    },
    roleLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#2b6cee',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    userName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        position: 'relative',
    },
    notificationIndicator: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        zIndex: 1,
        borderWidth: 1.5,
        borderColor: '#101622',
    },
    bellIcon: {
        fontSize: 18,
    },
});
