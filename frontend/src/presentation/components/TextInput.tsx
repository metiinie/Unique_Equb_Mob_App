import React from 'react';
import { View, Text, TextInput as RNTextInput, StyleSheet, TextInputProps as RNTextInputProps } from 'react-native';
import { Theme } from '../theme';

interface TextInputProps extends RNTextInputProps {
    label: string;
    error?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            <Text style={[Theme.typography.caption, styles.label]}>{label}</Text>
            <RNTextInput
                style={[
                    styles.input,
                    Theme.typography.body,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={Theme.colors.text.muted}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Theme.spacing.md,
    },
    label: {
        marginBottom: Theme.spacing.xs,
        color: Theme.colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        color: Theme.colors.text.primary,
    },
    inputError: {
        borderColor: Theme.colors.status.error,
    },
    errorText: {
        ...Theme.typography.caption,
        color: Theme.colors.status.error,
        marginTop: Theme.spacing.xs,
    }
});
