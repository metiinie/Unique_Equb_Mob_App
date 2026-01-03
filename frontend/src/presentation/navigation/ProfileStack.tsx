import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../profile/UnifiedProfileScreen';
import { SettingsScreen } from '../profile/SettingsScreen';
import { EditProfileScreen } from '../profile/EditProfileScreen';
import { SecurityScreen } from '../profile/SecurityScreen';
import { NotificationSettingsScreen } from '../profile/NotificationSettingsScreen';
import { LanguageScreen } from '../profile/LanguageScreen';
import { AboutScreen } from '../profile/AboutScreen';
import { Theme } from '../theme';

const Stack = createNativeStackNavigator();

export const ProfileStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTintColor: '#1a1a1a',
                headerTitleStyle: {
                    fontWeight: '700',
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="ProfileMain"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: 'Edit Profile' }}
            />
            <Stack.Screen
                name="Security"
                component={SecurityScreen}
                options={{ title: 'Security' }}
            />
            <Stack.Screen
                name="NotificationSettings"
                component={NotificationSettingsScreen}
                options={{ title: 'Notifications' }}
            />
            <Stack.Screen
                name="Language"
                component={LanguageScreen}
                options={{ title: 'Language' }}
            />
            <Stack.Screen
                name="About"
                component={AboutScreen}
                options={{ title: 'About' }}
            />
        </Stack.Navigator>
    );
};
