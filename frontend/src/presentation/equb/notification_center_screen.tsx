import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

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
    const [filter, setFilter] = useState('All');

    const filters = ['All', 'Reminders', 'Alerts', 'Payouts'];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <TouchableOpacity>
                        <Text style={styles.markReadText}>Mark all as read</Text>
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
                <ScrollView style={styles.contentList} contentContainerStyle={styles.listContainer}>
                    {/* Today Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>TODAY</Text>
                    </View>

                    <NotificationItem
                        type="critical"
                        title="Missed Payment"
                        message=""
                        richMessage={<Text>Your contribution for <Text style={styles.highlight}>Round 4</Text> is overdue. Please settle immediately.</Text>}
                        time="2m ago"
                        isRead={false}
                    />

                    <NotificationItem
                        type="success"
                        title="It's Your Turn!"
                        message=""
                        richMessage={<Text>You are the winner of this month's payout. Total amount: <Text style={styles.primaryHighlight}>25,000 ETB</Text>.</Text>}
                        time="5h ago"
                        isRead={false}
                    />

                    {/* Yesterday Section */}
                    <View style={[styles.sectionHeader, { marginTop: 12 }]}>
                        <Text style={styles.sectionTitle}>YESTERDAY</Text>
                    </View>

                    <NotificationItem
                        type="warning"
                        title="Contribution Due Soon"
                        message="Reminder: 500 ETB is due tomorrow for 'Addis Friends Equb'."
                        time="1d ago"
                        isRead={true}
                    />

                    <NotificationItem
                        type="info"
                        title="New Member Joined"
                        message="Selam has joined the 'Family Savings' group. Say hello!"
                        time="1d ago"
                        isRead={true}
                    />

                    <View style={{ height: 100 }} />
                </ScrollView>
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
});
