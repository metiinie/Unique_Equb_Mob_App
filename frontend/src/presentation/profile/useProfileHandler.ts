import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../application/auth/auth_context';
import { PROFILE_ACTIONS, ProfileActionType } from './profile_actions';

export const useProfileHandler = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation<any>();

    const handleAction = (actionType: ProfileActionType, params?: any) => {
        const action = PROFILE_ACTIONS[actionType];

        if (!action) {
            console.error(`[useProfileHandler] Action ${actionType} not found.`);
            return;
        }

        // 0. Special Handling: LOGOUT
        if (actionType === 'LOGOUT') {
            Alert.alert(
                "Logout",
                "Are you sure you want to exit the application?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Logout",
                        style: "destructive",
                        onPress: async () => {
                            await logout();
                        }
                    }
                ]
            );
            return;
        }

        // 1. Role Validation
        if (user && !action.allowedRoles.includes(user.role)) {
            Alert.alert("Access Denied", "You do not have permission to perform this action.");
            return;
        }

        // 2. "Coming Soon" Validation
        if (action.isComingSoon) {
            Alert.alert("Coming Soon", action.fallbackMessage || "This feature is currently under development.");
            return;
        }

        // 3. Target Navigation Validation
        if (!action.target) {
            console.warn(`[useProfileHandler] Action ${actionType} has no target.`);
            return;
        }

        // 4. Execution
        try {
            console.log(`[useProfileHandler] Navigating to ${action.target}`, params);
            navigation.navigate(action.target, params);
        } catch (error) {
            console.error(`[useProfileHandler] Navigation failed for ${action.target}:`, error);
            Alert.alert("Error", "Could not open the requested screen.");
        }
    };

    return { handleAction };
};
