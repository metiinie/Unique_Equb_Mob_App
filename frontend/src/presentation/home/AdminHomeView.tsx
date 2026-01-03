import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';
import { OPS_THEME } from '../../core/theme/ops_theme';
import { ManagedSummaryDto, SystemHealthDto } from '../../domain/dtos';

export const AdminHomeView = ({ navigation }: { navigation: any }) => {
    const { user } = useAuth();
    const [summary, setSummary] = useState<ManagedSummaryDto | null>(null);
    const [health, setHealth] = useState<SystemHealthDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [summaryData, healthData] = await Promise.all([
                ApiClient.get<ManagedSummaryDto>('/equbs/managed/summary'),
                ApiClient.get<SystemHealthDto>('/system/financial-health')
            ]);
            setSummary(summaryData);
            setHealth(healthData);
        } catch (error) {
            console.error('[AdminHomeView] Error:', error);
            // Fallback mock data if endpoint fails (for dev resilience)
            if (!summary) setSummary({ totalVolume: 1000, totalMembers: 0, managedCount: 0, activeCircles: 0, todayCollected: 0, todayPending: 0 } as any);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const isSystemDegraded = health?.isDegraded || false;
    const statusColor = isSystemDegraded ? OPS_THEME.colors.status.critical : OPS_THEME.colors.status.success;
    const statusText = isSystemDegraded ? 'SYSTEM DEGRADED' : 'SYSTEM OPERATIONAL';

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={OPS_THEME.colors.text.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            {/* 1. Header Section */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* Placeholder Avatar */}
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'A'}</Text>
                    </View>
                    <View>
                        <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0] || 'Admin'}</Text>
                        <Text style={styles.roleLabel}>Admin Access</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('NotificationCenter')}>
                    <Text style={styles.bellIcon}>🔔</Text>
                    <View style={styles.redDot} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={OPS_THEME.colors.text.primary} />}
            >
                {/* 2. System Status Badge */}
                <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                </View>

                {/* 3. Summary Cards Section */}
                <View style={styles.summaryRow}>
                    <SummaryCard label="TOTAL EQUBS" value={summary?.managedCount || 0} />
                    <SummaryCard label="TOTAL USERS" value={summary?.totalMembers || 0} />
                    <SummaryCard label="ACTIVE CIRCLES" value={summary?.activeCircles || 0} />
                </View>

                <View style={styles.spacer} />

                <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

                {/* 4. Quick Actions (Manage Equbs) */}
                <TouchableOpacity style={styles.quickActionCard} onPress={() => navigation.navigate('ManagedEqubs')}>
                    <View style={styles.quickActionHeader}>
                        <View style={styles.quickActionIconBg}>
                            <Text style={styles.quickActionIcon}>👥</Text>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                    </View>
                    <Text style={styles.quickActionTitle}>Manage Equbs</Text>
                    <Text style={styles.quickActionDesc}>Review ongoing circles, member status, and transaction history.</Text>
                    <TouchableOpacity style={styles.openManagerBtn} onPress={() => navigation.navigate('ManagedEqubs')}>
                        <Text style={styles.openManagerText}>Open Manager</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* 5. Primary Action Button (Create) */}
                <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateEqub')}>
                    <Text style={styles.plusIcon}>+</Text>
                    <Text style={styles.createBtnText}>Create New Equb</Text>
                </TouchableOpacity>

                {/* 6. System Tools Section */}
                <Text style={[styles.sectionTitle, { marginTop: 32 }]}>SYSTEM TOOLS</Text>

                <TouchableOpacity style={styles.toolCard} onPress={() => navigation.navigate('AdvancedAnalytics')}>
                    <View style={styles.toolIconBg}>
                        <Text style={styles.toolIcon}>📊</Text>
                    </View>
                    <View style={styles.toolContent}>
                        <Text style={styles.toolTitle}>More Tools & Reports</Text>
                        <Text style={styles.toolSub}>Analytics, Health, Payouts</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const SummaryCard = ({ label, value }: { label: string, value: number }) => (
    <View style={styles.summaryCard}>
        <Text style={styles.summaryValue}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F111A' // Dark theme background
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F111A'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    roleLabel: {
        fontSize: 12,
        color: '#3B82F6', // Blue font
        fontWeight: '600',
    },
    bellBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 20,
    },
    bellIcon: {
        fontSize: 20,
    },
    redDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    statusSection: {
        marginBottom: 24,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 32,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#1f2937', // Card bg
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 10,
        color: '#94A3B8',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    spacer: {
        height: 8,
    },
    quickActionCard: {
        backgroundColor: '#1f2937',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    quickActionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    quickActionIconBg: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1E3A8A', // Dark blue bg for icon
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionIcon: {
        fontSize: 24,
    },
    quickActionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 8,
    },
    quickActionDesc: {
        fontSize: 14,
        color: '#94A3B8',
        lineHeight: 20,
        marginBottom: 20,
    },
    openManagerBtn: {
        backgroundColor: '#334155',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    openManagerText: {
        color: '#F8FAFC',
        fontWeight: 'bold',
        fontSize: 14,
    },
    createBtn: {
        backgroundColor: '#2563EB', // Primary Blue
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        elevation: 2,
    },
    plusIcon: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    createBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    toolCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    toolIconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    toolIcon: {
        fontSize: 20,
    },
    toolContent: {
        flex: 1,
    },
    toolTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F8FAFC',
    },
    toolSub: {
        fontSize: 12,
        color: '#94A3B8',
    },
    chevron: {
        fontSize: 24,
        color: '#64748b',
    },
});
