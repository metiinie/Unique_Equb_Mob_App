import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEqubContext } from '../../application/equb/equb_context';

// Shared Home Header Component
// Used across Admin, Collector, and Member home dashboards
// Displays active Equb name from global context

interface HomeHeaderProps {
    userName: string;
    greeting: string;
    roleLabel?: string; // Optional: "COLLECTOR", "ADMIN", etc.
    onNotificationPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    userName,
    greeting,
    roleLabel,
    onNotificationPress
}) => {
    const { activeEqubName } = useEqubContext();

    return (
        <View style={styles.container}>
            {/* User Profile Section */}
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar} />
                    <View style={styles.statusDot} />
                </View>
                <View>
                    {roleLabel && <Text style={styles.roleLabel}>{roleLabel}</Text>}
                    <Text style={styles.userName}>{userName}</Text>
                    {!roleLabel && <Text style={styles.greeting}>{greeting}</Text>}
                </View>
            </View>

            {/* Notification Button */}
            <TouchableOpacity
                style={styles.notificationBtn}
                onPress={onNotificationPress}
            >
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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: 'rgba(16, 22, 34, 0.9)',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2b6cee',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#101622',
    },
    roleLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    greeting: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94a3b8',
    },
    notificationBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    bellIcon: {
        fontSize: 20,
    },
});
