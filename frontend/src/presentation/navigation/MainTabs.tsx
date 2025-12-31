import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Theme } from '../theme';
import { HomeScreen } from '../home/home_screen';
import { MyEqubTabScreen } from '../my_equb/MyEqubTabScreen';
import { ActivitiesTabScreen } from '../activities/ActivitiesTabScreen';
import { ProfileScreen } from '../profile/UnifiedProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1c2333',
                    borderTopColor: '#2d3748',
                },
                tabBarActiveTintColor: '#2b6cee',
                tabBarInactiveTintColor: '#64748b',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
            />

            <Tab.Screen
                name="My Equb"
                component={MyEqubTabScreen}
            />

            <Tab.Screen
                name="Activities"
                component={ActivitiesTabScreen}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </Tab.Navigator>
    );
};
