import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';

import { AuthProvider, useAuth } from './application/auth/auth_context';
import { EqubProvider } from './application/equb/equb_context';
import { NotificationProvider } from './application/notification/notification_context';
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
import { CreateEqubScreen } from './presentation/equb/create_equb_screen';
import { ContributionReportsScreen } from './presentation/reports/contribution_reports_screen';
import { PayoutReportsScreen } from './presentation/reports/payout_reports_screen';
import { RoundManagementScreen } from './presentation/equb/round_management_screen';
import { EqubSelectionScreen } from './presentation/equb/equb_selection_screen';
import { SystemHealthScreen } from './presentation/admin/system_health_screen';
import { ManagedEqubsScreen } from './presentation/admin/managed_equbs_screen';
import { EqubDetailScreen } from './presentation/admin/equb_detail_screen';
import { AuditTimelineScreen } from './presentation/admin/audit_timeline_screen';
import { SystemVerificationScreen } from './presentation/admin/system_verification_screen';
import { EqubMemberManagementScreen } from './presentation/equb/equb_member_management_screen';
import { MemberContributionScreen } from './presentation/equb/member_contribution_screen';
import { AdminContributionOversightScreen } from './presentation/equb/admin_contribution_oversight_screen';
import { NotificationCenterScreen } from './presentation/equb/notification_center_screen';
import { AdvancedAnalyticsScreen } from './presentation/admin/advanced_analytics_screen';

const Stack = createNativeStackNavigator();

function RootNavigator() {
    const { status, user } = useAuth();

    console.log('[RootNavigator] Current Auth Status:', status);

    if (status === 'BOOTING') {
        return <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Bootstrap" component={SessionBootstrapScreen} />
        </Stack.Navigator>;
    }

    if (status === 'UNAUTHENTICATED') {
        return <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ animation: 'fade' }}
            />
        </Stack.Navigator>;
    }

    // AUTHENTICATED
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
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
            <Stack.Screen
                name="CreateEqub"
                component={CreateEqubScreen}
                options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
                name="ContributionReports"
                component={ContributionReportsScreen}
                options={{ headerShown: true, title: 'Contribution Reports' }}
            />
            <Stack.Screen
                name="PayoutReports"
                component={PayoutReportsScreen}
                options={{ headerShown: true, title: 'Payout Reports' }}
            />
            <Stack.Screen
                name="RoundManagement"
                component={RoundManagementScreen}
                options={{ headerShown: true, title: 'Round Management' }}
            />
            <Stack.Screen
                name="EqubSelection"
                component={EqubSelectionScreen}
                options={{ headerShown: true, title: 'Select Equb' }}
            />
            <Stack.Screen
                name="EqubDetail"
                component={EqubDetailScreen}
                options={{ headerShown: true, title: 'Equb Truth' }}
            />
            <Stack.Screen
                name="ManagedEqubs"
                component={ManagedEqubsScreen}
                options={{ headerShown: true, title: 'Control View' }}
            />
            <Stack.Screen
                name="SystemHealth"
                component={SystemHealthScreen}
                options={{ headerShown: true, title: 'System Health' }}
            />
            <Stack.Screen
                name="AuditTimeline"
                component={AuditTimelineScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SystemVerification"
                component={SystemVerificationScreen}
                options={{ headerShown: true, title: 'Control Console' }}
            />
            <Stack.Screen
                name="EqubMemberManagement"
                component={EqubMemberManagementScreen}
                options={{ headerShown: true, title: 'Member Setup' }}
            />
            <Stack.Screen
                name="NotificationCenter"
                component={NotificationCenterScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AdvancedAnalytics"
                component={AdvancedAnalyticsScreen}
                options={{ headerShown: true, title: 'Network Analytics' }}
            />
            <Stack.Screen
                name="MemberContribution"
                component={MemberContributionScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AdminContributionOversight"
                component={AdminContributionOversightScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <EqubProvider>
                <NotificationProvider>
                    <NavigationContainer>
                        <StatusBar barStyle="light-content" />
                        <RootNavigator />
                    </NavigationContainer>
                </NotificationProvider>
            </EqubProvider>
        </AuthProvider>
    );
}
