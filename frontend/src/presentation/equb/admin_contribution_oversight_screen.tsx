import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, FlatList, Modal, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ContributionStatus } from '../../core/constants/enums';

/**
 * ADMIN CONTRIBUTION OVERSIGHT SCREEN
 * 
 * DESIGN CONSTRAINTS:
 * 1. Operational view of immutable round state. All data is server-authoritative.
 * 2. Navigation: passing equbId and roundNumber only.
 * 3. Read-first: Clear situational awareness of all member statuses.
 * 4. Control-oriented: Mutation actions (Confirm/Reject) enabled only for PENDING items.
 * 5. Industrial design: High-contrast, tabular-style information display.
 * 
 * // Intentionally no financial truth derived in UI. Fact-only projection.
 */

interface RoundSummary {
    equbId: string;
    equbName: string;
    roundNumber: number;
    totalMembers: number;
    confirmedContributions: number;
    pendingContributions: number;
    rejectedContributions: number;
    totalExpected: number;
    totalCollected: number;
    collectionRate: number;
    contributions: any[];
    isSystemDegraded?: boolean;
}

export const AdminContributionOversightScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { equbId, roundNumber } = route.params;

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<RoundSummary | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await ApiClient.get<RoundSummary>(`/equbs/${equbId}/round-summary/${roundNumber}`);
            setSummary(data);
        } catch (error) {
            console.error('[AdminOversight] Sync Error:', error);
            Alert.alert('SYSTEM SYNC ERROR', 'Could not retrieve authoritative round summary.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [equbId, roundNumber]);

    const handleConfirm = async (contributionId: string) => {
        setProcessingId(contributionId);
        try {
            await ApiClient.post(`/contributions/${contributionId}/confirm`, {});
            await fetchData();
        } catch (error: any) {
            Alert.alert('ACTION FAILED', error.message || 'System rejected confirmation.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectId || rejectReason.length < 5) {
            Alert.alert('INVALID REASON', 'Reason must be at least 5 characters.');
            return;
        }

        setProcessingId(rejectId);
        try {
            await ApiClient.post(`/contributions/${rejectId}/reject`, { reason: rejectReason });
            setRejectId(null);
            setRejectReason('');
            await fetchData();
        } catch (error: any) {
            Alert.alert('ACTION FAILED', error.message || 'System rejected rejection.');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading || !summary) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            </SafeAreaView>
        );
    }

    const mutationBlocked = summary.isSystemDegraded;

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.contributionRow}>
            <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.member.fullName}</Text>
                <Text style={styles.memberId}>ID: {item.memberId.split('-')[0]}...</Text>
            </View>
            <View style={styles.statusInfo}>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
                <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
            <View style={styles.actions}>
                {item.status === 'PENDING' && !mutationBlocked ? (
                    <View style={styles.actionGroup}>
                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={() => handleConfirm(item.id)}
                            disabled={!!processingId}
                        >
                            {processingId === item.id ? (
                                <ActivityIndicator size="small" color="#030712" />
                            ) : (
                                <Ionicons name="checkmark" size={16} color="#030712" />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.rejectBtn}
                            onPress={() => setRejectId(item.id)}
                            disabled={!!processingId}
                        >
                            <Ionicons name="close" size={16} color="#f9fafb" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Ionicons name="lock-closed" size={14} color="#374151" />
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#f9fafb" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.equbName}>{summary.equbName}</Text>
                    <Text style={styles.roundLabel}>Round #{summary.roundNumber} Oversight</Text>
                </View>
            </View>

            <View style={styles.metricsBar}>
                <Metric label="COLLECTED" value={`${summary.confirmedContributions}/${summary.totalMembers}`} />
                <Metric label="RATE" value={`${summary.collectionRate.toFixed(1)}%`} />
                <Metric label="PENDING" value={summary.pendingContributions.toString()} color="#f59e0b" />
            </View>

            <View style={styles.listHeader}>
                <Text style={styles.listHeaderTitle}>Member Breakdown</Text>
                {mutationBlocked && (
                    <View style={styles.degradedBanner}>
                        <Text style={styles.degradedText}>SYSTEM_DEGRADED: WRITES_LOCKED</Text>
                    </View>
                )}
            </View>

            <FlatList
                data={summary.contributions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>NO DATA RECORDED FOR THIS ROUND</Text>
                    </View>
                }
            />

            {/* Reject Modal */}
            <Modal visible={!!rejectId} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>REJECTION REASON</Text>
                        <Text style={styles.modalLabel}>Provide justification for rejection (min 5 chars):</Text>
                        <TextInput
                            style={styles.input}
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            placeholder="e.g., Payment reference not found"
                            placeholderTextColor="#4b5563"
                            multiline
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => { setRejectId(null); setRejectReason(''); }}>
                                <Text style={styles.modalCancelText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleReject}>
                                <Text style={styles.modalConfirmText}>CONFIRM REJECTION</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const Metric = ({ label, value, color = '#f9fafb' }: { label: string, value: string, color?: string }) => (
    <View style={styles.metricItem}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
);

const getStatusStyle = (status: string) => {
    switch (status) {
        case 'CONFIRMED': return { backgroundColor: '#064e3b' };
        case 'REJECTED': return { backgroundColor: '#450a0a' };
        case 'PENDING': return { backgroundColor: '#451a03' };
        default: return { backgroundColor: '#111827' };
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'CONFIRMED': return '#10b981';
        case 'REJECTED': return '#ef4444';
        case 'PENDING': return '#f59e0b';
        default: return '#94a3b8';
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
    backBtn: { marginRight: 16 },
    headerInfo: { flex: 1 },
    equbName: { fontSize: 18, fontWeight: '900', color: '#f9fafb' },
    roundLabel: { fontSize: 12, color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' },

    metricsBar: { flexDirection: 'row', padding: 20, backgroundColor: '#0f172a', justifyContent: 'space-between' },
    metricItem: { flex: 1 },
    metricLabel: { fontSize: 9, fontWeight: '900', color: '#475569', letterSpacing: 1, marginBottom: 4 },
    metricValue: { fontSize: 18, fontWeight: '900', fontFamily: 'monospace' },

    listHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    listHeaderTitle: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 },
    degradedBanner: { backgroundColor: '#450a0a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 2 },
    degradedText: { color: '#ef4444', fontSize: 10, fontWeight: '900' },

    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    contributionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#111827'
    },
    memberInfo: { flex: 2 },
    memberName: { fontSize: 14, fontWeight: '700', color: '#f1f5f9' },
    memberId: { fontSize: 10, color: '#475569', marginTop: 2 },
    statusInfo: { flex: 1.5, alignItems: 'flex-start' },
    statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    statusText: { fontSize: 9, fontWeight: '900' },
    timestamp: { fontSize: 9, color: '#475569', marginTop: 4 },
    actions: { flex: 1, alignItems: 'flex-end' },
    actionGroup: { flexDirection: 'row', gap: 8 },
    confirmBtn: { backgroundColor: '#10b981', padding: 6, borderRadius: 4 },
    rejectBtn: { backgroundColor: '#ef4444', padding: 6, borderRadius: 4 },

    emptyContainer: { marginTop: 100, alignItems: 'center' },
    emptyText: { color: '#374151', fontSize: 12, fontWeight: '900', letterSpacing: 1 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: '#0f172a', padding: 24, borderRadius: 4, borderWidth: 1, borderColor: '#1f2937' },
    modalTitle: { fontSize: 16, fontWeight: '900', color: '#f9fafb', marginBottom: 16 },
    modalLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
    input: {
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
        borderRadius: 4,
        padding: 12,
        color: '#f9fafb',
        fontSize: 14,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 24
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
    modalCancel: { padding: 12 },
    modalCancelText: { color: '#94a3b8', fontWeight: '900', fontSize: 12 },
    modalConfirm: { backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 2 },
    modalConfirmText: { color: '#f9fafb', fontWeight: '900', fontSize: 12 },
});
