import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiClient } from '../../presentation/services/api_client';
import { NotificationDto, ContributionNotificationDto } from '../../domain/dtos';
import { useAuth } from '../auth/auth_context';
import { GlobalRole } from '../../core/constants/enums';

interface NotificationContextData {
    notifications: NotificationDto[];
    pendingContributions: ContributionNotificationDto[];
    loading: boolean;
    refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [pendingContributions, setPendingContributions] = useState<ContributionNotificationDto[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [notifs, pending] = await Promise.all([
                ApiClient.get('/notifications'),
                user.role === GlobalRole.MEMBER
                    ? ApiClient.get('/notifications/contributions/pending')
                    : Promise.resolve([]),
            ]);
            setNotifications(notifs as NotificationDto[]);
            setPendingContributions(pending as ContributionNotificationDto[]);
        } catch (error) {
            console.error('[NotificationProvider] Refresh error:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refresh();
        // Optional: setup polling
        const interval = setInterval(refresh, 60000); // 1 minute polling
        return () => clearInterval(interval);
    }, [refresh]);

    return (
        <NotificationContext.Provider value={{ notifications, pendingContributions, loading, refresh }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
