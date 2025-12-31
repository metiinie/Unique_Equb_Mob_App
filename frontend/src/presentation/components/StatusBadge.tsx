import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface StatusBadgeProps {
    status: string;
    type?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'neutral' }) => {
    const getColors = () => {
        switch (type) {
            case 'success':
                return { bg: Theme.colors.status.success + '20', text: Theme.colors.status.success };
            case 'warning':
                return { bg: Theme.colors.status.warning + '20', text: Theme.colors.status.warning };
            case 'error':
                return { bg: Theme.colors.status.error + '20', text: Theme.colors.status.error };
            case 'info':
                return { bg: Theme.colors.status.info + '20', text: Theme.colors.status.info };
            default:
                return { bg: Theme.colors.border, text: Theme.colors.text.secondary };
        }
    };

    const colors = getColors();

    return (
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <View style={[styles.dot, { backgroundColor: colors.text }]} />
            <Text style={[styles.text, { color: colors.text }]}>
                {status.toUpperCase()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.sm,
        paddingVertical: Theme.spacing.xs,
        borderRadius: Theme.borderRadius.full,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    text: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
