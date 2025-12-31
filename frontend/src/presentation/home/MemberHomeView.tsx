import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';
import { HomeHeader } from '../components/HomeHeader';
import { EqubHeadline } from '../components/EqubHeadline';

export const MemberHomeView = ({ navigation }: { navigation: any }) => {
    const { user } = useAuth();
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

    if (loading) return null;

    const hasEqubs = data?.myEqubs && data.myEqubs.length > 0;
    const primaryEqub = hasEqubs ? data.myEqubs[0] : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <HomeHeader
                    userName={user?.fullName || 'Member'}
                    greeting="Welcome to Unique Equb"
                    onNotificationPress={() => navigation.navigate('NotificationCenterScreen')}
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {!hasEqubs ? (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateIcon}>🌱</Text>
                            <Text style={styles.emptyStateTitle}>No Active Equbs</Text>
                            <Text style={styles.emptyStateText}>
                                You haven't joined any Equbs yet. Once you're added to an Equb by an administrator, your position and contributions will appear here.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <EqubHeadline metadata={`${primaryEqub.name} • Round ${primaryEqub.currentRound}`} />

                            <View style={styles.heroCardContainer}>
                                <View style={styles.heroCard}>
                                    <LinearGradient
                                        colors={['#1e293b', '#0f172a']}
                                        style={styles.heroOverlay}
                                    >
                                        <View style={styles.heroContent}>
                                            <View style={styles.heroTop}>
                                                <View style={styles.statusBadge}>
                                                    <View style={styles.statusPulse} />
                                                    <Text style={styles.statusText}>{primaryEqub.status}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.heroBottom}>
                                                <Text style={styles.contributionLabel}>Active Equb</Text>
                                                <Text style={styles.contributionAmount}>{primaryEqub.name}</Text>
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.activityHeader}>
                                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                                </View>
                                <View style={styles.activityList}>
                                    {data.recentContributions.length === 0 && data.executedPayouts.length === 0 ? (
                                        <Text style={styles.emptyActivityText}>No recent activity found.</Text>
                                    ) : (
                                        <>
                                            {data.recentContributions.map((c: any) => (
                                                <View key={c.id} style={styles.activityItem}>
                                                    <View style={[styles.activityIcon, styles.activityIconGreen]}>
                                                        <Text style={styles.activityIconText}>💰</Text>
                                                    </View>
                                                    <View style={styles.activityContent}>
                                                        <Text style={styles.activityTitle}>Contribution {c.status}</Text>
                                                        <Text style={styles.activityDesc}>Round {c.roundNumber} • {new Date(c.createdAt).toLocaleDateString()}</Text>
                                                    </View>
                                                    <View style={styles.activityAmount}>
                                                        <Text style={styles.activityAmountValue}>{c.amount}</Text>
                                                        <Text style={styles.activityAmountCurrency}>ETB</Text>
                                                    </View>
                                                </View>
                                            ))}
                                            {data.executedPayouts.map((p: any, idx: number) => (
                                                <View key={idx} style={styles.activityItem}>
                                                    <View style={[styles.activityIcon, styles.activityIconBlue]}>
                                                        <Text style={styles.activityIconText}>🏆</Text>
                                                    </View>
                                                    <View style={styles.activityContent}>
                                                        <Text style={styles.activityTitle}>Payout Disbursed</Text>
                                                        <Text style={styles.activityDesc}>{p.equbName} • Round {p.round}</Text>
                                                    </View>
                                                    <View style={styles.activityAmount}>
                                                        <Text style={styles.activityAmountValue}>{p.amount}</Text>
                                                        <Text style={styles.activityAmountCurrency}>ETB</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </>
                                    )}
                                </View>
                            </View>
                        </>
                    )}
                    <View style={{ height: 40 }} />
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
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: 'rgba(16, 22, 34, 0.9)',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2b6cee',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#101622',
    },
    greeting: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    timeGreeting: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94a3b8',
    },
    notificationBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    bellIcon: {
        fontSize: 20,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    /* Headline */
    headlineSection: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    equbTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    equbMeta: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    /* Hero Card */
    heroCardContainer: {
        padding: 16,
    },
    heroCard: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    heroBackground: {
        width: '100%',
        minHeight: 180,
    },
    heroBackgroundImage: {
        borderRadius: 12,
    },
    heroOverlay: {
        flex: 1,
        padding: 20,
    },
    heroContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    statusPulse: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#22c55e',
        letterSpacing: 1,
    },
    walletIcon: {
        fontSize: 20,
        opacity: 0.5,
    },
    heroBottom: {
        gap: 16,
    },
    contributionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#cbd5e1',
        marginBottom: 4,
    },
    contributionAmount: {
        fontSize: 30,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -1,
    },
    dueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    calendarIcon: {
        fontSize: 14,
    },
    dueText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    payNowBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        backgroundColor: '#2b6cee',
        borderRadius: 8,
    },
    payNowText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    arrowIcon: {
        fontSize: 18,
        color: '#ffffff',
    },
    /* Section */
    section: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
    },
    /* Position Card */
    positionCard: {
        backgroundColor: '#1a2230',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    positionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    positionRound: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2b6cee',
    },
    positionTotal: {
        fontSize: 14,
        fontWeight: '400',
        color: '#64748b',
    },
    groupIcon: {
        fontSize: 20,
        color: '#2b6cee',
    },
    progressBarContainer: {
        marginBottom: 12,
    },
    progressBarBg: {
        width: '100%',
        height: 12,
        backgroundColor: '#334155',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2b6cee',
        borderRadius: 6,
    },
    positionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    positionLabel: {
        fontSize: 14,
        color: '#94a3b8',
    },
    positionDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    /* Activity */
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllBtn: {
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
        gap: 16,
        backgroundColor: '#1a2230',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    activityItemFaded: {
        opacity: 0.6,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIconGreen: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    activityIconBlue: {
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
    },
    activityIconGray: {
        backgroundColor: '#334155',
    },
    activityIconText: {
        fontSize: 16,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 2,
    },
    activityDesc: {
        fontSize: 12,
        color: '#94a3b8',
    },
    activityAmount: {
        alignItems: 'flex-end',
    },
    activityAmountValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    activityAmountCurrency: {
        fontSize: 12,
        color: '#64748b',
    },
    chevronIcon: {
        fontSize: 20,
        color: '#64748b',
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
    },
    emptyActivityText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        paddingVertical: 20,
    },
});
