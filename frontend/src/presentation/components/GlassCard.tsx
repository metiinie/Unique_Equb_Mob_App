import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Theme } from '../theme';

export const GlassCard: React.FC<ViewProps & { padding?: keyof typeof Theme.spacing }> = ({
    children,
    style,
    padding = 'md',
    ...props
}) => {
    return (
        <View style={[styles.card, { padding: Theme.spacing[padding] }, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: Theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        ...Theme.shadows.soft,
    }
});
