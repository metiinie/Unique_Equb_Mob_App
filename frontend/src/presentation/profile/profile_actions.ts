import { GlobalRole } from '../../core/constants/enums';

export type ProfileActionType =
    | 'NEW_EQUB'
    | 'REQUESTS'
    | 'REPORTS'
    | 'ARCHIVE'
    | 'MANAGED_EQUBS'
    | 'SETTINGS'
    | 'SCAN_COLLECT'
    | 'MARK_MANUAL'
    | 'VIEW_HISTORY'
    | 'JOIN_EQUB'
    | 'EQUB_DETAILS'
    | 'EDIT_PROFILE'
    | 'SECURITY'
    | 'NOTIFICATIONS'
    | 'LANGUAGE'
    | 'ABOUT'
    | 'LOGOUT';

export interface ProfileActionContract {
    name: string;
    allowedRoles: GlobalRole[];
    target: string;
    params?: any;
    fallbackMessage?: string;
    isComingSoon?: boolean;
}

export const PROFILE_ACTIONS: Record<ProfileActionType, ProfileActionContract> = {
    NEW_EQUB: {
        name: 'New Equb',
        allowedRoles: [GlobalRole.ADMIN],
        target: 'CreateEqub',
    },
    REQUESTS: {
        name: 'Requests',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR],
        target: 'NotificationCenter',
    },
    REPORTS: {
        name: 'Reports',
        allowedRoles: [GlobalRole.ADMIN],
        target: 'ContributionReports', // Fallback for general reports
    },
    ARCHIVE: {
        name: 'Archive',
        allowedRoles: [GlobalRole.ADMIN],
        target: '',
        isComingSoon: true,
        fallbackMessage: 'Archive feature is coming soon!',
    },
    MANAGED_EQUBS: {
        name: 'Managed Equbs',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR],
        target: 'EqubSelection', // View all managed equbs
    },
    SETTINGS: {
        name: 'Settings',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER],
        target: 'Settings',
    },
    SCAN_COLLECT: {
        name: 'Scan & Collect',
        allowedRoles: [GlobalRole.COLLECTOR],
        target: 'ContributionCapture',
    },
    MARK_MANUAL: {
        name: 'Mark Manually',
        allowedRoles: [GlobalRole.COLLECTOR],
        target: 'ContributionCapture',
    },
    VIEW_HISTORY: {
        name: 'View History',
        allowedRoles: [GlobalRole.MEMBER],
        target: 'EqubSelection', // History view
    },
    JOIN_EQUB: {
        name: 'Join New Equb',
        allowedRoles: [GlobalRole.MEMBER],
        target: 'EqubSelection',
    },
    EQUB_DETAILS: {
        name: 'Equb Details',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER],
        target: 'EqubOverview',
    },
    EDIT_PROFILE: {
        name: 'Edit Profile',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER],
        target: 'EditProfile',
    },
    SECURITY: {
        name: 'Security',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER],
        target: 'Security',
    },
    NOTIFICATIONS: {
        name: 'Notifications',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER],
        target: 'NotificationSettings',
    },
    LANGUAGE: {
        name: 'Language',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER],
        target: 'Language',
    },
    ABOUT: {
        name: 'About',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER],
        target: 'About',
    },
    LOGOUT: {
        name: 'Logout',
        allowedRoles: [GlobalRole.ADMIN, GlobalRole.COLLECTOR, GlobalRole.MEMBER],
        target: '', // Handled as an action
    },
};
