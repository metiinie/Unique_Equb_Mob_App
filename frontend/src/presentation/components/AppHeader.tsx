import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppHeaderProps {
    title: string;
    onBack?: () => void;
    rightElement?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, onBack, rightElement }) => {
    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.left}>
                    {onBack && (
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={[Theme.typography.h3, styles.title]}>{title}</Text>
                </View>
                <View style={styles.right}>
                    {rightElement}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: Theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    container: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.md,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: Theme.spacing.md,
        padding: Theme.spacing.xs,
    },
    backIcon: {
        fontSize: 24,
        color: Theme.colors.primary,
    },
    title: {
        color: Theme.colors.text.primary,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});
