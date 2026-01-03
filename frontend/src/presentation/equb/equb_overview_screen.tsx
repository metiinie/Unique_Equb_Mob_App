import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { EqubDto, ContributionDto, PayoutDto } from '../../domain/dtos';
import { GlobalRole, EqubStatus, ContributionStatus } from '../../core/constants/enums';
import { useAuth } from '../../application/auth/auth_context';
import { GlassCard } from '../components/GlassCard';

export const EqubOverviewScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;
    const { user } = useAuth();

    const [equb, setEqub] = useState<EqubDto | null>(null);
    const [contributions, setContributions] = useState<ContributionDto[]>([]);
    const [payouts, setPayouts] = useState<PayoutDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEqubDetails();
    }, [equbId]);

    const fetchEqubDetails = async () => {
        setLoading(true);
        try {
            // HUMBLE: Multiple fetches to build the overview
            const [equbData, contributionsData, payoutsData] = await Promise.all([
                ApiClient.get<EqubDto>(`/equbs/${equbId}`),
                ApiClient.get<ContributionDto[]>(`/equbs/${equbId}/contributions`),
                ApiClient.get<PayoutDto[]>(`/equbs/${equbId}/payouts`),
            ]);

            setEqub(equbData);
            setContributions(contributionsData);
            setPayouts(payoutsData);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !equb) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    const isAdmin = user?.role === GlobalRole.ADMIN;
    const isCollector = user?.role === GlobalRole.COLLECTOR;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Equb Header */}
                <View style={styles.header}>
                    <Text style={styles.equbName}>{equb.name}</Text>
                    <Text style={styles.equbMeta}>
                        Round {equb.currentRound} of {equb.totalRounds} • {equb.status}
                    </Text>
                </View>

                {/* Role Specific Sections */}
                {isAdmin && (
                    <GlassCard padding="md" style={styles.section}>
                        <Text style={styles.sectionTitle}>Administrative Summary</Text>
                        <View style={styles.statsRow}>
                            <Stat label="Total Payout" value={`${equb.amount * (equb.totalRounds - 1)} ${equb.currency}`} />
                            <Stat label="Status" value={equb.status} />
                        </View>
                    </GlassCard>
                )}

                {/* Contributions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {isCollector || isAdmin ? 'Recent Contributions' : 'Your Contributions'}
                    </Text>
                    {contributions.length === 0 ? (
                        <Text style={styles.emptyText}>No contributions found.</Text>
                    ) : (
                        contributions.map((c) => (
                            <View key={c.id} style={styles.listItem}>
                                <View>
                                    <Text style={styles.itemTitle}>Round {c.roundNumber}</Text>
                                    <Text style={styles.itemSubtitle}>{new Date(c.createdAt).toLocaleDateString()}</Text>
                                </View>
                                <View style={styles.rightAlign}>
                                    <Text style={styles.itemValue}>{c.amount}</Text>
                                    <Text style={[styles.statusText, c.status === ContributionStatus.CONFIRMED ? styles.success : styles.pending]}>
                                        {c.status}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Payouts Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payout Schedule</Text>
                    {payouts.length === 0 ? (
                        <Text style={styles.emptyText}>No payouts scheduled.</Text>
                    ) : (
                        payouts.map((p) => (
                            <View key={p.id} style={styles.listItem}>
                                <View>
                                    <Text style={styles.itemTitle}>Round {p.roundNumber}</Text>
                                    <Text style={styles.itemSubtitle}>Recipient ID: {p.recipientUserId}</Text>
                                </View>
                                <View style={styles.rightAlign}>
                                    <Text style={styles.itemValue}>{p.amount}</Text>
                                    <Text style={styles.statusText}>{p.status}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    {equb.status === EqubStatus.ACTIVE ? (
                        <>
                            {!isAdmin && !isCollector && (
                                <TouchableOpacity
                                    style={styles.primaryAction}
                                    onPress={() => navigation.navigate('MemberContribution', { equbId: equb.id })}
                                >
                                    <Text style={styles.actionText}>Make Contribution</Text>
                                </TouchableOpacity>
                            )}

                            {(isCollector || isAdmin) && (
                                <TouchableOpacity
                                    style={[styles.primaryAction, { marginBottom: 12, backgroundColor: '#eab308' }]}
                                    onPress={() => navigation.navigate('AdminContributionOversight', {
                                        equbId: equb.id,
                                        roundNumber: equb.currentRound
                                    })}
                                >
                                    <Text style={styles.actionText}>Round Oversight</Text>
                                </TouchableOpacity>
                            )}

                            {isAdmin && (
                                <TouchableOpacity
                                    style={[styles.primaryAction, { marginBottom: 12, backgroundColor: '#22c55e' }]}
                                    onPress={() => navigation.navigate('PayoutInitiation', { equbId: equb.id })}
                                >
                                    <Text style={styles.actionText}>Execute Payout</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : equb.status === EqubStatus.COMPLETED ? (
                        <TouchableOpacity
                            style={[styles.primaryAction, { backgroundColor: '#22c55e' }]}
                            onPress={() => navigation.navigate('EqubCompletion', { equbId: equb.id })}
                        >
                            <Text style={styles.actionText}>View Completion Record</Text>
                        </TouchableOpacity>
                    ) : null}

                    {/* Secondary Utility Actions */}
                    <View style={styles.utilityActions}>
                        <TouchableOpacity
                            style={styles.secondaryAction}
                            onPress={() => navigation.navigate('AuditTrail', { equbId: equb.id })}
                        >
                            <Text style={styles.secondaryActionText}>📜 Audit Trail</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.secondaryAction}
                            onPress={() => navigation.navigate('FinalPayout', { equbId: equb.id })}
                        >
                            <Text style={styles.secondaryActionText}>💰 Latest Payout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const Stat: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <View style={styles.statBox}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Theme.colors.background },
    container: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background },
    header: { marginBottom: 24 },
    equbName: { ...Theme.typography.h1, color: Theme.colors.text.primary },
    equbMeta: { ...Theme.typography.caption, color: Theme.colors.text.secondary, marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitle: { ...Theme.typography.h3, color: Theme.colors.text.primary, marginBottom: 12 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statBox: { flex: 1 },
    statLabel: { ...Theme.typography.caption, color: Theme.colors.text.secondary },
    statValue: { ...Theme.typography.h3, color: Theme.colors.primary },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    itemTitle: { ...Theme.typography.body, color: Theme.colors.text.primary, fontWeight: 'bold' },
    itemSubtitle: { ...Theme.typography.caption, color: Theme.colors.text.secondary },
    rightAlign: { alignItems: 'flex-end' },
    itemValue: { ...Theme.typography.body, color: Theme.colors.text.primary, fontWeight: 'bold' },
    statusText: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
    success: { color: '#22c55e' },
    pending: { color: '#eab308' },
    emptyText: { ...Theme.typography.body, color: Theme.colors.text.secondary, fontStyle: 'italic' },
    actions: { marginTop: 20 },
    primaryAction: {
        backgroundColor: Theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    utilityActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 12,
    },
    secondaryAction: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    secondaryActionText: {
        color: Theme.colors.text.secondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
});
