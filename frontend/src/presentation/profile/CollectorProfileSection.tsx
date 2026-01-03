import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useProfileHandler } from './useProfileHandler';
import { ApiClient } from '../services/api_client';
import { ManagedEqubDto, ManagedSummaryDto } from '../../domain/dtos';

interface CollectorProfileSectionProps { }

export const CollectorProfileSection: React.FC<CollectorProfileSectionProps> = () => {
    const { handleAction } = useProfileHandler();
    const [equbs, setEqubs] = useState<ManagedEqubDto[]>([]);
    const [summary, setSummary] = useState<ManagedSummaryDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [equbsData, summaryData] = await Promise.all([
                    ApiClient.get<ManagedEqubDto[]>('/equbs/managed'),
                    ApiClient.get<any>('/equbs/managed/summary')
                ]);
                setEqubs(equbsData);
                setSummary(summaryData);
                setError(null);
            } catch (err: any) {
                console.error('[CollectorProfileSection] Fetch failed:', err);
                setError('Failed to load management data');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .filter(Boolean)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const mapStatus = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { label: 'Active', badgeColor: '#22c55e' };
            case 'DRAFT': return { label: 'Draft', badgeColor: '#3b82f6' };
            case 'ON_HOLD': return { label: 'Hold', badgeColor: '#eab308' };
            default: return { label: status, badgeColor: '#94a3b8' };
        }
    };

    return (
        <>
            {/* Today's Summary */}
            <View style={styles.sectionContainer}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Text style={styles.summaryTitle}>Today's Summary</Text>
                        <View style={styles.dateChip}>
                            <Text style={styles.dateText}>
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Collected</Text>
                            <Text style={styles.statValueSuccess}>ETB {summary?.todayCollected?.toLocaleString() || '0'}</Text>
                        </View>
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Pending</Text>
                            <Text style={styles.statValueWarning}>ETB {summary?.todayPending?.toLocaleString() || '0'}</Text>
                        </View>
                    </View>

                    {summary && (summary.todayCollected + summary.todayPending) > 0 ? (
                        <>
                            <View style={styles.progressContainer}>
                                <View style={[
                                    styles.progressBar,
                                    { width: `${Math.min(100, (summary.todayCollected / (summary.todayCollected + summary.todayPending)) * 100)}%` }
                                ]} />
                            </View>
                            <Text style={styles.progressText}>
                                {Math.round((summary.todayCollected / (summary.todayCollected + summary.todayPending)) * 100)}% collection rate today
                            </Text>
                        </>
                    ) : (
                        <Text style={styles.progressText}>No collections scheduled for today</Text>
                    )}
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionContainer}>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity
                        style={styles.actionScan}
                        onPress={() => handleAction('SCAN_COLLECT')}
                    >
                        <Text style={styles.actionIconScan}>📷</Text>
                        <Text style={styles.actionTextScan}>Scan & Collect</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionManual}
                        onPress={() => handleAction('MARK_MANUAL')}
                    >
                        <Text style={styles.actionIconManual}>📝</Text>
                        <Text style={styles.actionTextManual}>Mark Manually</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Assigned Equbs */}
            <View style={styles.sectionContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Assigned Equbs</Text>
                    <TouchableOpacity onPress={() => handleAction('MANAGED_EQUBS', { managedOnly: true })}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.equbList}>
                    {loading ? (
                        <View style={styles.centerContent}>
                            <ActivityIndicator size="small" color="#2b6cee" />
                            <Text style={styles.infoText}>Loading assigned equbs...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centerContent}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : equbs.length === 0 ? (
                        <View style={styles.centerContent}>
                            <Text style={styles.emptyText}>No assigned equbs found.</Text>
                        </View>
                    ) : (
                        equbs.map((equb) => {
                            const { label, badgeColor } = mapStatus(equb.status);
                            const initials = getInitials(equb.name);
                            return (
                                <View key={equb.id} style={styles.equbCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardLeft}>
                                            <View style={[styles.initialsBox, styles.bgBlue]}>
                                                <Text style={[styles.initialsText, styles.textBlue]}>
                                                    {initials}
                                                </Text>
                                            </View>
                                            <View>
                                                <View style={styles.nameRow}>
                                                    <Text style={styles.equbName}>{equb.name}</Text>
                                                    {equb.memberships?.[0]?.role && (
                                                        <View style={styles.roleBadge}>
                                                            <Text style={styles.roleText}>{equb.memberships[0].role}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={styles.equbMeta}>
                                                    Rnd {equb.currentRound} • {equb.frequency}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: `${badgeColor}22` }]}>
                                            <Text style={[styles.statusText, { color: badgeColor }]}>{label}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.cardFooter}>
                                        <View>
                                            <Text style={styles.collectLabel}>Members</Text>
                                            <Text style={styles.collectValue}>{equb._count?.memberships || 0} Members</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.viewBtn, styles.viewBtnPrimary]}
                                            onPress={() => handleAction('EQUB_DETAILS', { equbId: equb.id })}
                                        >
                                            <Text style={styles.viewBtnText}>View List</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    /* Summary Card */
    sectionContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    summaryCard: {
        backgroundColor: '#1c2431',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    dateChip: {
        backgroundColor: '#2d3748',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    dateText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCol: {
        flex: 1,
        gap: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statValueSuccess: {
        fontSize: 20,
        fontWeight: '700',
        color: '#22c55e',
    },
    statValueWarning: {
        fontSize: 20,
        fontWeight: '700',
        color: '#eab308',
    },
    progressContainer: {
        height: 8,
        backgroundColor: '#2d3748',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2b6cee',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
    },
    /* Actions */
    actionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionScan: {
        flex: 1,
        backgroundColor: '#2b6cee',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionManual: {
        flex: 1,
        backgroundColor: '#1c2431',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    actionIconScan: {
        fontSize: 28,
        color: '#ffffff',
    },
    actionTextScan: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    actionIconManual: {
        fontSize: 28,
        color: '#2b6cee',
    },
    actionTextManual: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '700',
    },
    /* Assigned Equbs */
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2b6cee',
    },
    equbList: {
        gap: 12,
    },
    equbCard: {
        backgroundColor: '#1c2431',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2d3748',
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardLeft: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    initialsBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgBlue: { backgroundColor: 'rgba(30, 58, 138, 0.3)' },
    bgPurple: { backgroundColor: 'rgba(88, 28, 135, 0.3)' },
    initialsText: {
        fontWeight: '700',
        fontSize: 14,
    },
    textBlue: { color: '#60a5fa' },
    textPurple: { color: '#c084fc' },
    equbName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    equbMeta: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statusBadge: {
        backgroundColor: 'rgba(22, 101, 52, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        color: '#4ade80',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#2d3748',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    collectLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    collectValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    viewBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewBtnPrimary: {
        backgroundColor: '#ffffff',
    },
    viewBtnOutline: {
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    viewBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    textWhite: {
        color: '#101622',
    },
    textGray: {
        color: '#cbd5e1',
    },
    centerContent: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    infoText: {
        color: '#94a3b8',
        fontSize: 14,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 14,
        fontStyle: 'italic',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    roleBadge: {
        backgroundColor: 'rgba(51, 65, 85, 0.4)',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#334155',
    },
    roleText: {
        fontSize: 8,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
});
