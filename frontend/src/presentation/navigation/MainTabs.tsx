import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Theme } from '../theme';
import { HomeScreen } from '../home/home_screen';
import { MyEqubTabScreen } from '../my_equb/MyEqubTabScreen';
import { ActivitiesTabScreen } from '../activities/ActivitiesTabScreen';
import { ProfileStack } from './ProfileStack';
import { TabIcon } from '../components/TabIcon';

const Tab = createBottomTabNavigator();

export const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false, // We render label in TabIcon
                tabBarStyle: {
                    backgroundColor: Theme.colors.surface,
                    borderTopColor: Theme.colors.borderLight,
                    height: 64, // Sufficient height for icon + label + padding
                    paddingTop: 8,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="dashboard" label="Dashboard" focused={focused} />
                }}
            />

            <Tab.Screen
                name="My Equb"
                component={MyEqubTabScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="savings" label="My Equb" focused={focused} />
                }}
            />

            <Tab.Screen
                name="Activities"
                component={ActivitiesTabScreen}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="swap-horiz" label="Activities" focused={focused} />
                }}
            />

            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    tabBarIcon: ({ focused }) => <TabIcon name="person" label="Profile" focused={focused} />
                }}
            />
        </Tab.Navigator>
    );
};
