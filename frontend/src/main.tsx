import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import { AuthProvider, useAuth } from './application/auth/auth_context';
import { EqubProvider } from './application/equb/equb_context';
import { LoginScreen } from './presentation/auth/login_screen';
import { SessionBootstrapScreen } from './presentation/auth/session_bootstrap_screen';
import { MainTabs } from './presentation/navigation/MainTabs';
import { EqubOverviewScreen } from './presentation/equb/equb_overview_screen';
import { ContributionCaptureScreen } from './presentation/equb/contribution_capture_screen';
import { ContributionManagementScreen } from './presentation/equb/contribution_management_screen';
import { PayoutInitiationScreen } from './presentation/equb/payout_initiation_screen';
import { AuditTrailScreen } from './presentation/equb/audit_trail_screen';
import { FinalPayoutScreen } from './presentation/equb/final_payout_screen';
import { EqubCompletionScreen } from './presentation/equb/equb_completion_screen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
    const { isAuthenticated, isInitialCheckDone } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isInitialCheckDone ? (
                <Stack.Screen name="Bootstrap" component={SessionBootstrapScreen} />
            ) : !isAuthenticated ? (
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ animation: 'fade' }}
                />
            ) : (
                <>
                    <Stack.Screen
                        name="MainTabs"
                        component={MainTabs}
                        options={{ animation: 'fade' }}
                    />
                    <Stack.Screen
                        name="EqubOverview"
                        component={EqubOverviewScreen}
                        options={{ headerShown: true, title: 'Equb Details' }}
                    />
                    <Stack.Screen
                        name="ContributionCapture"
                        component={ContributionCaptureScreen}
                        options={{ headerShown: true, title: 'Make Contribution' }}
                    />
                    <Stack.Screen
                        name="ContributionManagement"
                        component={ContributionManagementScreen}
                        options={{ headerShown: true, title: 'Manage Approvals' }}
                    />
                    <Stack.Screen
                        name="PayoutInitiation"
                        component={PayoutInitiationScreen}
                        options={{ headerShown: true, title: 'Execute Payout' }}
                    />
                    <Stack.Screen
                        name="AuditTrail"
                        component={AuditTrailScreen}
                        options={{ headerShown: true, title: 'Audit Trail' }}
                    />
                    <Stack.Screen
                        name="FinalPayout"
                        component={FinalPayoutScreen}
                        options={{ headerShown: true, title: 'Latest Payout' }}
                    />
                    <Stack.Screen
                        name="EqubCompletion"
                        component={EqubCompletionScreen}
                        options={{ headerShown: true, title: 'Completion Record' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <EqubProvider>
                <NavigationContainer>
                    <StatusBar barStyle="light-content" />
                    <RootNavigator />
                </NavigationContainer>
            </EqubProvider>
        </AuthProvider>
    );
}
