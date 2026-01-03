import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { useNotifications } from '../../application/notification/notification_context';
import { NotificationType } from '../../domain/dtos';

const { width } = Dimensions.get('window');

// Purity: Presentational Component only. No logic or side-effects.
interface NotificationItemProps {
    type: 'critical' | 'success' | 'warning' | 'info';
    title: string;
    message: string;
    richMessage?: React.ReactNode;
    time: string;
    isRead?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ type, title, message, richMessage, time, isRead }) => {

    const getIcon = () => {
        switch (type) {
            case 'critical': return '⚠️';
            case 'success': return '💰'; // Currency exchange fallback
            case 'warning': return '⏰'; // Schedule fallback
            case 'info': return '👥'; // Group add fallback
            default: return '🔔';
        }
    };

    const getColors = () => {
        switch (type) {
            case 'critical':
                return {
                    bg: '#1c1f27',
                    iconBg: 'rgba(239, 68, 68, 0.1)', // red-500/10
                    iconColor: '#ef4444',
                    border: 'rgba(239, 68, 68, 0.2)',
                    glow: 'rgba(239, 68, 68, 0.6)'
                };
            case 'success':
                return {
                    bg: '#1c1f27',
                    iconBg: 'rgba(43, 108, 238, 0.1)', // primary/10
                    iconColor: '#2b6cee',
                    border: 'rgba(43, 108, 238, 0.2)',
                    glow: 'rgba(43, 108, 238, 0.6)'
                };
            case 'warning':
                return {
                    bg: '#1c1f27',
                    iconBg: 'rgba(249, 115, 22, 0.1)', // orange-500/10
                    iconColor: '#f97316',
                    border: 'rgba(249, 115, 22, 0.2)',
                    glow: undefined
                };
            case 'info':
                return {
                    bg: '#1c1f27',
                    iconBg: 'rgba(100, 116, 139, 0.3)', // slate-700/30
                    iconColor: '#94a3b8',
                    border: 'rgba(255, 255, 255, 0.05)',
                    glow: undefined
                };
            default: return { bg: '#1c1f27', iconBg: '#334155', iconColor: '#94a3b8', border: '#334155', glow: undefined };
        }
    };

    const stylesConfig = getColors();

    return (
        <TouchableOpacity style={styles.notificationItem} activeOpacity={0.98}>
            <View style={[styles.card, { backgroundColor: stylesConfig.bg, borderColor: stylesConfig.border }]}>
                {/* Unread Indicator */}
                {!isRead && stylesConfig.glow && (
                    <View style={[styles.unreadDot, { backgroundColor: stylesConfig.iconColor, shadowColor: stylesConfig.glow }]} />
                )}

                <View style={[styles.iconBox, { backgroundColor: stylesConfig.iconBg, borderColor: stylesConfig.border }]}>
                    <Text style={{ fontSize: 24, color: stylesConfig.iconColor }}>{getIcon()}</Text>
                </View>

                <View style={styles.contentCol}>
                    <View style={styles.headerRow}>
                        <Text style={styles.titleText}>{title}</Text>
                    </View>
                    <Text style={styles.messageText} numberOfLines={2}>
                        {richMessage ? richMessage : message}
                    </Text>
                    <Text style={styles.timeText}>{time}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};


export const NotificationCenterScreen = ({ navigation }: { navigation: any }) => {
    const { notifications, loading, refresh } = useNotifications();
    const [filter, setFilter] = useState('All');

    const filters = ['All', 'Reminders', 'Alerts', 'Payouts'];

    const getFilteredNotifications = () => {
        if (filter === 'All') return notifications;
        if (filter === 'Reminders') return notifications.filter(n => n.type === NotificationType.CONTRIBUTION_PENDING);
        if (filter === 'Alerts') return notifications.filter(n => n.type === NotificationType.AUDIT_ALERT || n.type === NotificationType.EQUB_COMPLETED);
        if (filter === 'Payouts') return notifications.filter(n => n.type === NotificationType.PAYOUT_RECEIVED);
        return notifications;
    };

    const getNotificationTypeEmoji = (type: NotificationType): 'critical' | 'success' | 'warning' | 'info' => {
        switch (type) {
            case NotificationType.CONTRIBUTION_PENDING: return 'warning';
            case NotificationType.PAYOUT_RECEIVED: return 'success';
            case NotificationType.EQUB_COMPLETED: return 'success';
            case NotificationType.ROUND_COMPLETE: return 'info';
            case NotificationType.AUDIT_ALERT: return 'critical';
            default: return 'info';
        }
    };

    const filtered = getFilteredNotifications();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity onPress={refresh}>
                        <Text style={styles.markReadText}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {filters.map((f) => {
                            const isActive = filter === f;
                            return (
                                <TouchableOpacity
                                    key={f}
                                    style={[styles.filterChip, isActive ? styles.activeFilter : styles.inactiveFilter]}
                                    onPress={() => setFilter(f)}
                                >
                                    <Text style={[styles.filterText, isActive ? styles.activeFilterText : styles.inactiveFilterText]}>{f}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Content */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <ActivityIndicator color={Theme.colors.primary} />
                    </View>
                ) : (
                    <ScrollView style={styles.contentList} contentContainerStyle={styles.listContainer}>
                        {filtered.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No notifications found for this filter.</Text>
                            </View>
                        ) : (
                            filtered.map((item) => (
                                <NotificationItem
                                    key={item.id}
                                    type={getNotificationTypeEmoji(item.type)}
                                    title={item.type.replace(/_/g, ' ')}
                                    message={item.message}
                                    time={new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    isRead={true}
                                />
                            ))
                        )}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#101622',
    },
    container: {
        flex: 1,
        backgroundColor: '#101622',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(16, 22, 34, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
    },
    markReadText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2b6cee',
    },
    filterContainer: {
        paddingVertical: 12,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterChip: {
        height: 36,
        paddingHorizontal: 20,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    activeFilter: {
        backgroundColor: '#2b6cee',
        borderColor: '#2b6cee',
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    inactiveFilter: {
        backgroundColor: '#1c1f27', // surface-dark
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeFilterText: {
        color: '#ffffff',
    },
    inactiveFilterText: {
        color: '#94a3b8', // slate-400
    },
    contentList: {
        flex: 1,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionHeader: {
        marginTop: 8,
        marginBottom: 12,
        paddingLeft: 4,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        letterSpacing: 1,
    },
    notificationItem: {
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'flex-start',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        position: 'relative',
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 10,
        height: 10,
        borderRadius: 5,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 4,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    contentCol: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    titleText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
    },
    messageText: {
        fontSize: 13,
        color: '#cbd5e1', // slate-300
        lineHeight: 20,
        marginBottom: 8,
    },
    highlight: {
        color: '#e2e8f0', // slate-200
        fontWeight: '600',
    },
    primaryHighlight: {
        color: '#2b6cee',
        fontWeight: '700',
    },
    timeText: {
        fontSize: 11,
        color: '#64748b', // slate-500
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
    },
});
