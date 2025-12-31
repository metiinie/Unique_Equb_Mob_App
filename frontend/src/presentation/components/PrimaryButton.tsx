import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Theme } from '../theme';

interface PrimaryButtonProps {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    label,
    onPress,
    loading,
    disabled,
    variant = 'primary',
    style
}) => {
    const getBgColor = () => {
        if (disabled) return Theme.colors.border;
        switch (variant) {
            case 'secondary': return Theme.colors.secondary;
            case 'danger': return Theme.colors.status.error;
            default: return Theme.colors.primary;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: getBgColor() }, style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={Theme.colors.text.inverted} />
            ) : (
                <Text style={[Theme.typography.button, styles.text]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: Theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.lg,
        ...Theme.shadows.soft,
    },
    text: {
        color: Theme.colors.text.inverted,
    }
});
