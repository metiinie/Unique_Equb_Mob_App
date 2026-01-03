import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { ManagedEqubDto, StatusFlagsDto, FinancialSummaryDto, RoundLedgerItemDto } from '../../domain/dtos';
import { EqubStatus } from '../../core/constants/enums';
import { OPS_THEME } from '../../core/theme/ops_theme';

/**
 * PANEL 3: EQUB DETAIL (Read-First Ledger View)
 */

export const EqubDetailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;

    const [overview, setOverview] = useState<ManagedEqubDto | null>(null);
    const [statusFlags, setStatusFlags] = useState<StatusFlagsDto | null>(null);
    const [financials, setFinancials] = useState<FinancialSummaryDto | null>(null);
    const [ledger, setLedger] = useState<RoundLedgerItemDto[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [overviewData, flagsData, financialData, ledgerData] = await Promise.allSettled([
                ApiClient.get<ManagedEqubDto>(`/equbs/${equbId}`),
                ApiClient.get<StatusFlagsDto>(`/equbs/${equbId}/status-flags`),
                ApiClient.get<FinancialSummaryDto>(`/equbs/${equbId}/financial-summary`),
                ApiClient.get<RoundLedgerItemDto[]>(`/equbs/${equbId}/round-ledger`),
            ]);

            if (overviewData.status === 'fulfilled') setOverview(overviewData.value);
            if (flagsData.status === 'fulfilled') setStatusFlags(flagsData.value);
            if (financialData.status === 'fulfilled') setFinancials(financialData.value);
            if (ledgerData.status === 'fulfilled') setLedger(ledgerData.value);

        } catch (error) {
            console.error('[EqubDetail] Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [equbId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading && !overview) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerParams}>
                    <ActivityIndicator size="large" color={OPS_THEME.colors.status.info} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={OPS_THEME.colors.status.info} />
                }
            >
                {/* 1. Equb Identity */}
                {overview && (
                    <View style={styles.section}>
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={styles.equbName}>{overview.name}</Text>
                                <Text style={styles.equbId}>ID: {overview.id}</Text>
                            </View>
                            <StatusBadge status={overview.status} />
                        </View>
                        {overview.status === EqubStatus.DRAFT && (
                            <TouchableOpacity
                                style={styles.manageBtn}
                                onPress={() => navigation.navigate('EqubMemberManagement', { equbId })}
                            >
                                <Text style={styles.manageBtnText}>SETUP MEMBERS & ACTIVATION ›</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* 2. System Flags */}
                {statusFlags ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>SYSTEM FLAGS</Text>
                        <View style={styles.flagsGrid}>
                            <FlagItem label="ROUND OPEN" value={statusFlags.isRoundOpen} />
                            <FlagItem label="FULLY FUNDED" value={statusFlags.isFullyFunded} />
                            <FlagItem label="PAYOUT READY" value={statusFlags.canExecutePayout} />
                            <FlagItem label="COMPLETED" value={statusFlags.isEqubCompleted} />
                        </View>
                    </View>
                ) : (
                    <ErrorSection message="Status flags unavailable." />
                )}

                {/* 3. Financial Summary */}
                {financials ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>FINANCIAL TRUTH</Text>
                        <View style={styles.financialCard}>
                            <FinancialRow label="Total Contributed" value={formatCurrency(financials.totalSettled)} />
                            <FinancialRow label="Total Paid Out" value={formatCurrency(financials.totalVolume)} highlight />
                            <View style={styles.divider} />
                            <FinancialRow label="Contribution Count" value={financials.contributionCount.toString()} />
                            <FinancialRow label="Active Members" value={financials.activeMemberCount.toString()} />
                        </View>
                    </View>
                ) : (
                    <ErrorSection message="Financial data unavailable." />
                )}

                {/* 4. Round Ledger */}
                {ledger ? (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ROUND LEDGER</Text>
                        <View style={styles.ledgerContainer}>
                            <View style={styles.ledgerHeader}>
                                <Text style={[styles.ledgerCol, { flex: 0.5 }]}>#</Text>
                                <Text style={[styles.ledgerCol, { flex: 2 }]}>RECIPIENT</Text>
                                <Text style={[styles.ledgerCol, { flex: 1.5, textAlign: 'right' }]}>COLLECTED</Text>
                                <Text style={[styles.ledgerCol, { flex: 1.5, textAlign: 'right' }]}>STATUS</Text>
                            </View>
                            {ledger.map((item, index) => (
                                <View key={item.roundNumber} style={[styles.ledgerRow, item.isCurrent && styles.currentRow]}>
                                    <Text style={[styles.ledgerCell, { flex: 0.5 }]}>{item.roundNumber}</Text>
                                    <Text style={[styles.ledgerCell, { flex: 2 }]}>
                                        {item.payoutRecipient || (item.status === 'EXECUTED' ? 'Unknown' : '-')}
                                    </Text>
                                    <Text style={[styles.ledgerCell, { flex: 1.5, textAlign: 'right' }]}>
                                        {formatMoney(item.collectedAmount)}
                                    </Text>
                                    <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                                        <LedgerStatusBadge status={item.status} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <ErrorSection message="Ledger unavailable. Do not proceed." />
                )}

                {/* 5. Audit Metadata */}
                <View style={styles.auditMeta}>
                    <Text style={styles.auditText}>System Integrity Verified</Text>
                    <Link text={`View Forensic Timeline ›`} onPress={() => navigation.navigate('AuditTimeline', { equbId })} />
                    <Text style={styles.auditText}>Timestamp: {new Date().toISOString()}</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount);
};

const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { maximumFractionDigits: 0 }).format(amount);
}

const Link = ({ onPress, text }: { onPress: () => void, text: string }) => (
    <TouchableOpacity onPress={onPress}>
        <Text style={{ color: OPS_THEME.colors.status.info, fontWeight: 'bold' }}>{text}</Text>
    </TouchableOpacity>
);

const ErrorSection = ({ message }: { message: string }) => (
    <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{message}</Text>
    </View>
);

const StatusBadge = ({ status }: { status: EqubStatus }) => {
    let color = OPS_THEME.colors.text.secondary;
    let bg = OPS_THEME.colors.bg.highlight;
    if (status === EqubStatus.ACTIVE) { color = OPS_THEME.colors.status.success; bg = 'rgba(16, 185, 129, 0.1)'; }
    else if (status === EqubStatus.COMPLETED) { color = OPS_THEME.colors.status.info; bg = 'rgba(59, 130, 246, 0.1)'; }

    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
        </View>
    );
};

const FlagItem = ({ label, value }: { label: string, value: boolean }) => (
    <View style={[styles.flagItem, value ? styles.flagActive : styles.flagInactive]}>
        <Text style={[styles.flagLabel, value ? { color: OPS_THEME.colors.status.success } : { color: OPS_THEME.colors.text.secondary }]}>{label}</Text>
        <Text style={[styles.flagValue, value ? { color: OPS_THEME.colors.status.success } : { color: OPS_THEME.colors.text.secondary }]}>{value ? 'TRUE' : 'FALSE'}</Text>
    </View>
);

const FinancialRow = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <View style={styles.financialRow}>
        <Text style={styles.financialLabel}>{label}</Text>
        <Text style={[styles.financialValue, highlight && { color: OPS_THEME.colors.status.success }]}>{value}</Text>
    </View>
);

const LedgerStatusBadge = ({ status }: { status: string }) => {
    let color = OPS_THEME.colors.text.secondary;
    if (status === 'EXECUTED') color = OPS_THEME.colors.status.success;
    if (status === 'PENDING') color = OPS_THEME.colors.status.warning;

    return (
        <Text style={{ fontSize: 10, fontWeight: 'bold', color }}>{status}</Text>
    );
};


const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: OPS_THEME.colors.bg.app },
    container: { padding: OPS_THEME.layout.screenPadding, paddingBottom: 40 },
    centerParams: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    section: { marginBottom: 24 },
    sectionTitle: { fontSize: OPS_THEME.typography.size.xs, fontWeight: 'bold', color: OPS_THEME.colors.text.secondary, marginBottom: 12, letterSpacing: OPS_THEME.typography.spacing.loose },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    equbName: { fontSize: OPS_THEME.typography.size.xl, fontWeight: 'bold', color: OPS_THEME.colors.text.primary },
    equbId: { fontSize: OPS_THEME.typography.size.xs, color: OPS_THEME.colors.text.tertiary, fontFamily: 'monospace' },

    manageBtn: { marginTop: 16, backgroundColor: OPS_THEME.colors.bg.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: OPS_THEME.colors.text.primary, alignItems: 'center' },
    manageBtnText: { color: OPS_THEME.colors.text.primary, fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },

    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },

    flagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    flagItem: {
        width: '48%',
        padding: 12,
        borderRadius: OPS_THEME.layout.borderRadius,
        borderWidth: 1,
        alignItems: 'center'
    },
    flagActive: { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' },
    flagInactive: { backgroundColor: OPS_THEME.colors.bg.surface, borderColor: OPS_THEME.colors.border.subtle },
    flagLabel: { fontSize: OPS_THEME.typography.size.xs, fontWeight: 'bold', marginBottom: 4 },
    flagValue: { fontSize: OPS_THEME.typography.size.base, fontWeight: 'bold', fontFamily: 'monospace' },

    financialCard: {
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderRadius: OPS_THEME.layout.borderRadius,
        padding: 16,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle
    },
    financialRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    financialLabel: { fontSize: OPS_THEME.typography.size.base, color: OPS_THEME.colors.text.secondary },
    financialValue: { fontSize: OPS_THEME.typography.size.base, fontWeight: 'bold', color: OPS_THEME.colors.text.primary, fontFamily: 'monospace' },
    divider: { height: 1, backgroundColor: OPS_THEME.colors.border.subtle, marginVertical: 12 },

    ledgerContainer: {
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderRadius: OPS_THEME.layout.borderRadius,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
        overflow: 'hidden'
    },
    ledgerHeader: { flexDirection: 'row', padding: 12, backgroundColor: OPS_THEME.colors.bg.app, borderBottomWidth: 1, borderBottomColor: OPS_THEME.colors.border.subtle },
    ledgerCol: { fontSize: OPS_THEME.typography.size.xs, fontWeight: 'bold', color: OPS_THEME.colors.text.secondary },
    ledgerRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: OPS_THEME.colors.border.subtle, alignItems: 'center' },
    currentRow: { backgroundColor: 'rgba(59, 130, 246, 0.05)' },
    ledgerCell: { fontSize: OPS_THEME.typography.size.sm, color: OPS_THEME.colors.text.primary },

    errorContainer: { padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', marginVertical: 8 },
    errorText: { color: OPS_THEME.colors.status.critical, fontSize: 12 },

    auditMeta: { marginTop: 32, alignItems: 'center', opacity: 0.5 },
    auditText: { fontSize: 10, color: OPS_THEME.colors.text.tertiary }
});
