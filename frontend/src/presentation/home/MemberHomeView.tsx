import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';
import { useNotifications } from '../../application/notification/notification_context';
import { HomeHeader } from '../components/HomeHeader';
import { Theme } from '../theme';

export const MemberHomeView = ({ navigation }: { navigation: any }) => {
    const { user } = useAuth();
    const { pendingContributions } = useNotifications();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const result = await ApiClient.get('/reports/member/dashboard');
                setData(result);
            } catch (error) {
                console.error('[MemberHomeView] Dash fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading || !user) return (
        <View style={styles.loadingContainer}>
            <Text style={{ color: '#fff' }}>Hydrating your experience...</Text>
        </View>
    );

    const hasEqubs = data?.myEqubs && data.myEqubs.length > 0;
    const primaryEqub = hasEqubs ? data.myEqubs[0] : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <HomeHeader
                    userName={user.fullName}
                    roleLabel={user.role}
                    greeting="Your Personal Savings Hub"
                    onNotificationPress={() => navigation.navigate('NotificationCenter')}
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Truthful Identity Hero - Matching Profile Standard */}
                    <View style={styles.heroSection}>
                        <LinearGradient
                            colors={['#1e293b', '#101622']}
                            style={styles.identityCard}
                        >
                            <View style={styles.identityInfo}>
                                <Text style={styles.memberSince}>Member Since {new Date(user.createdAt).toLocaleDateString()}</Text>
                                <Text style={styles.heroGreeting}>Welcome back, {user.fullName.split(' ')[0]}</Text>
                            </View>
                            <View style={styles.identityStatus}>
                                <View style={styles.statusChip}>
                                    <Text style={styles.statusChipText}>ACTIVE POSITION</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {pendingContributions.length > 0 && (
                        <View style={styles.alertSection}>
                            <TouchableOpacity
                                style={styles.alertCard}
                                onPress={() => navigation.navigate('ContributionCapture', { equbId: pendingContributions[0].equbId })}
                            >
                                <View style={styles.alertIconWrapper}>
                                    <Text style={styles.alertIcon}>⚠️</Text>
                                </View>
                                <View style={styles.alertContent}>
                                    <Text style={styles.alertTitle}>Action Required</Text>
                                    <Text style={styles.alertMessage}>
                                        Contribution for {pendingContributions[0].equbName} is due.
                                    </Text>
                                </View>
                                <Text style={styles.alertAction}>PAY NOW</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!hasEqubs ? (
                        <View style={styles.emptyStateContainer}>
                            <View style={styles.emptyIconWrapper}>
                                <Text style={styles.emptyStateIcon}>🌱</Text>
                            </View>
                            <Text style={styles.emptyStateTitle}>No Active Equbs Found</Text>
                            <Text style={styles.emptyStateText}>
                                You are not part of any Equb yet. Join an Equb to start saving and participating in rotating payouts with your community.
                            </Text>
                            <TouchableOpacity style={styles.exploreBtn} onPress={() => { }}>
                                <Text style={styles.exploreBtnText}>Explore Circles</Text>
                                <Text style={styles.btnIcon}>🔍</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.dashboardContent}>
                            {/* Primary Equb Card */}
                            <Text style={styles.sectionTitle}>Your Active Equb</Text>
                            <TouchableOpacity
                                style={styles.equbCard}
                                activeOpacity={0.9}
                                onPress={() => navigation.navigate('My Equb')}
                            >
                                <LinearGradient
                                    colors={['#2b6cee', '#1e3a8a']}
                                    style={styles.equbCardGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={styles.cardEqubName}>{primaryEqub.name}</Text>
                                            <Text style={styles.cardEqubMeta}>{primaryEqub.frequency} • {primaryEqub.amount.toLocaleString()} ETB</Text>
                                        </View>
                                        <View style={styles.cardStatusBadge}>
                                            <Text style={styles.cardStatusText}>{primaryEqub.status}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.cardProgress}>
                                        <View style={styles.progressLabelRow}>
                                            <Text style={styles.progressLabel}>Round {primaryEqub.currentRound} of {primaryEqub.totalRounds}</Text>
                                            <Text style={styles.progressPercent}>{Math.round((primaryEqub.currentRound / primaryEqub.totalRounds) * 100)}%</Text>
                                        </View>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${(primaryEqub.currentRound / primaryEqub.totalRounds) * 100}%` }]} />
                                        </View>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Recent Activity */}
                            <View style={styles.activitySection}>
                                <View style={styles.activityHeader}>
                                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('Activities')}>
                                        <Text style={styles.seeAllText}>See All</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.activityList}>
                                    {data.recentContributions.length === 0 && data.executedPayouts.length === 0 ? (
                                        <Text style={styles.emptyActivityText}>Your financial activity will appear here.</Text>
                                    ) : (
                                        <>
                                            {data.recentContributions.slice(0, 3).map((c: any) => (
                                                <View key={c.id} style={styles.activityItem}>
                                                    <View style={[styles.activityIcon, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                                                        <Text style={styles.activityEmoji}>💰</Text>
                                                    </View>
                                                    <View style={styles.activityInfo}>
                                                        <Text style={styles.activityTitle}>Contribution {c.status}</Text>
                                                        <Text style={styles.activityMeta}>Round {c.roundNumber} • {new Date(c.createdAt).toLocaleDateString()}</Text>
                                                    </View>
                                                    <View style={styles.activityAction}>
                                                        <Text style={styles.activityAmount}>{c.amount.toLocaleString()} ETB</Text>
                                                    </View>
                                                </View>
                                            ))}
                                            {data.executedPayouts.slice(0, 2).map((p: any, idx: number) => (
                                                <View key={`p-${idx}`} style={styles.activityItem}>
                                                    <View style={[styles.activityIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                                        <Text style={styles.activityEmoji}>🏆</Text>
                                                    </View>
                                                    <View style={styles.activityInfo}>
                                                        <Text style={styles.activityTitle}>Payout Received</Text>
                                                        <Text style={styles.activityMeta}>{p.equbName} • {new Date(p.date).toLocaleDateString()}</Text>
                                                    </View>
                                                    <View style={styles.activityAction}>
                                                        <Text style={[styles.activityAmount, { color: '#3b82f6' }]}>{p.amount.toLocaleString()} ETB</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#101622' },
    container: { flex: 1 },
    loadingContainer: { flex: 1, backgroundColor: '#101622', justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 20 },
    /* Hero Identity */
    heroSection: {
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 24,
    },
    identityCard: {
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    identityInfo: {
        gap: 6,
    },
    memberSince: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    heroGreeting: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    identityStatus: {
        alignItems: 'flex-end',
    },
    statusChip: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    statusChipText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#22c55e',
    },
    /* Alerts */
    alertSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(249, 115, 22, 0.2)',
        gap: 12,
    },
    alertIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIcon: { fontSize: 20 },
    alertContent: { flex: 1, gap: 2 },
    alertTitle: { fontSize: 14, fontWeight: '800', color: '#f97316' },
    alertMessage: { fontSize: 12, color: '#f97316', opacity: 0.9 },
    alertAction: { fontSize: 12, fontWeight: '900', color: '#f97316', letterSpacing: 0.5 },
    /* Dashboard Content */
    dashboardContent: {
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    /* Equb Card */
    equbCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 32,
        elevation: 10,
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    equbCardGradient: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    cardEqubName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    cardEqubMeta: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 4,
    },
    cardStatusBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    cardStatusText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#ffffff',
        textTransform: 'uppercase',
    },
    cardProgress: {
        gap: 12,
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: '800',
        color: '#ffffff',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 5,
    },
    /* Activity Section */
    activitySection: {
        gap: 16,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2b6cee',
    },
    activityList: {
        gap: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1c2333',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2d3748',
        gap: 16,
    },
    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityEmoji: { fontSize: 20 },
    activityInfo: { flex: 1, gap: 2 },
    activityTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff'
    },
    activityMeta: {
        fontSize: 12,
        color: '#64748b'
    },
    activityAction: { alignItems: 'flex-end' },
    activityAmount: {
        fontSize: 14,
        fontWeight: '800',
        color: '#ffffff'
    },
    /* Empty State */
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 20,
    },
    emptyIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    emptyStateIcon: { fontSize: 48 },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    emptyStateText: {
        fontSize: 15,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    exploreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#2b6cee',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 16,
        elevation: 4,
    },
    exploreBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
    btnIcon: { fontSize: 18 },
    emptyActivityText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        paddingTop: 20,
    },
});
