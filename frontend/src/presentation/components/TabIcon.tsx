import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // or react-native-vector-icons
import { Theme } from '../theme';

interface TabIconProps {
    name: keyof typeof MaterialIcons.glyphMap;
    label: string;
    focused: boolean;
}

export const TabIcon: React.FC<TabIconProps> = ({ name, label, focused }) => {
    // Styling constants
    const activeColor = Theme.colors.primary;
    const inactiveColor = Theme.colors.text.muted;

    // Specific visual emphasis for My Equb icon size
    const isSpecialIcon = label === 'My Equb';
    const iconSize = isSpecialIcon ? 26 : 24;

    return (
        <View style={styles.container}>
            <MaterialIcons
                name={name}
                size={iconSize}
                color={focused ? activeColor : inactiveColor}
            />
            <Text style={[
                styles.label,
                { color: focused ? activeColor : inactiveColor },
                focused && styles.labelFocused
            ]}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        // paddingTop handled by tab bar style
    },
    label: {
        fontSize: 10,
        marginTop: 4, // Tight gap ≈ 4px
        fontWeight: '500',
    },
    labelFocused: {
        fontWeight: '700',
    }
});
