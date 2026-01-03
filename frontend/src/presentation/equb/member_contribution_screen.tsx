import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { Ionicons } from '@expo/vector-icons';

/**
 * MEMBER CONTRIBUTION EXECUTION SCREEN
 * 
 * DESIGN CONSTRAINTS:
 * 1. Strictly respects backend truth; no derived calculations or heuristics.
 * 2. Role permissions (MEMBER) come implicitly from backend DTOs.
 * 3. Financial amounts displayed as immutable facts.
 * 4. At most one action: submitting a contribution for the current round.
 * 5. Mutations disabled if Equb is not ACTIVE or system is DEGRADED.
 * 6. High-contrast, industrial design — no decorative effects.
 * 
 * // Intentionally no financial truth derived in UI. Fact-only projection.
 * // Financial truth belongs exclusively to ledger views.
 */

interface ContributionState {
    roundNumber: number;
    requiredAmount: number;
    hasContributed: boolean;
    contributionId: string | null;
    status: string | null;
    submittedAt: string | null;
    isEqubActive: boolean;
    isSystemDegraded?: boolean;
}

export const MemberContributionScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { equbId } = route.params;

    const [loading, setLoading] = useState(true);
    const [state, setState] = useState<ContributionState | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await ApiClient.get<ContributionState>(`/equbs/${equbId}/my-contribution-status`);
            setState(data);
        } catch (error) {
            console.error('[MemberContributionScreen] Sync Error:', error);
            Alert.alert('SYSTEM SYNC ERROR', 'Immutable state could not be verified. Operation aborted.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [equbId]);

    const handleSubmit = async () => {
        setShowConfirm(false);
        setSubmitting(true);
        try {
            if (!state) return;

            await ApiClient.post(`/equbs/${equbId}/contributions`, {
                roundNumber: state.roundNumber,
                amount: state.requiredAmount
            });

            await fetchData();
            Alert.alert('EXECUTION SUCCESS', 'Contribution has been recorded in the immutable ledger.');
        } catch (error: any) {
            Alert.alert('EXECUTION FAILED', error.message || 'The financial operation was rejected by the server.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !state) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            </SafeAreaView>
        );
    }

    const mutationDisabled = !state.isEqubActive || state.hasContributed || state.isSystemDegraded;
    const disabledReason = !state.isEqubActive
        ? 'EQUB INACTIVE'
        : (state.hasContributed ? 'CONTRIBUTION ALREADY RECORDED' : (state.isSystemDegraded ? 'SYSTEM DEGRADED' : ''));

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>TERMINATE SESSION</Text>
                </TouchableOpacity>
                <View style={styles.statusBadge}>
                    <Text style={[styles.statusBadgeText, { color: state.isEqubActive ? '#10b981' : '#ef4444' }]}>
                        {state.isEqubActive ? 'STATUS: ACTIVE' : 'STATUS: INACTIVE'}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Member Execution</Text>
                <Text style={styles.subtitle}>Round Reference: #{state.roundNumber}</Text>

                <View style={styles.factPanel}>
                    <View style={styles.factItem}>
                        <Text style={styles.factLabel}>OPERATION TYPE</Text>
                        <Text style={styles.factValue}>CONTRIBUTION_SETTLEMENT</Text>
                    </View>
                    <View style={styles.factItem}>
                        <Text style={styles.factLabel}>SETTLEMENT AMOUNT</Text>
                        <Text style={styles.factAmount}>ETB {state.requiredAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.factItem}>
                        <Text style={styles.factLabel}>LEDGER STATUS</Text>
                        <Text style={[
                            styles.factValue,
                            { color: state.hasContributed ? '#10b981' : '#f59e0b' }
                        ]}>
                            {state.hasContributed ? `RECORDED (${state.status})` : 'PENDING_SUBMISSION'}
                        </Text>
                    </View>
                    {state.submittedAt && (
                        <View style={styles.factItem}>
                            <Text style={styles.factLabel}>RECORDED AT</Text>
                            <Text style={styles.factValue}>{new Date(state.submittedAt).toISOString()}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.executionZone}>
                    {mutationDisabled ? (
                        <View style={styles.disabledContainer}>
                            <Ionicons name="lock-closed" size={20} color="#6b7280" />
                            <Text style={styles.disabledText}>MUTATION_LOCK: {disabledReason}</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.executeButton}
                            onPress={() => setShowConfirm(true)}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#030712" />
                            ) : (
                                <Text style={styles.executeButtonText}>EXECUTE CONTRIBUTION</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.governancePanel}>
                    <Text style={styles.governanceText}>
                        ATTENTION: This is a direct financial instrument. Submission triggers an immutable ledger entry.
                        No reversals are permitted once confirmed.
                    </Text>
                </View>
            </View>

            <Modal visible={showConfirm} transparent animationType="none">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>AUTHORIZE TRANSACTION</Text>
                        <Text style={styles.modalText}>
                            Authorize the immediate transfer of ETB {state.requiredAmount.toLocaleString()} to Equb Round #{state.roundNumber}?
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowConfirm(false)}>
                                <Text style={styles.modalCancelText}>ABORT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirm} onPress={handleSubmit}>
                                <Text style={styles.modalConfirmText}>AUTHORIZE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#030712' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937'
    },
    backBtn: { padding: 4 },
    backText: { color: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    statusBadge: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#1f2937' },
    statusBadgeText: { fontSize: 10, fontWeight: 'bold' },

    content: { flex: 1, padding: 24 },
    title: { fontSize: 28, fontWeight: '900', color: '#f9fafb', letterSpacing: -1, marginBottom: 4 },
    subtitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 32, textTransform: 'uppercase', letterSpacing: 1 },

    factPanel: {
        backgroundColor: '#0f172a',
        padding: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#1e293b',
        marginBottom: 32
    },
    factItem: { marginBottom: 20 },
    factLabel: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 1.5, marginBottom: 6 },
    factValue: { fontSize: 13, fontWeight: '700', color: '#f1f5f9', fontFamily: 'monospace' },
    factAmount: { fontSize: 24, fontWeight: '900', color: '#f9fafb' },

    executionZone: { marginBottom: 32 },
    executeButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 18,
        borderRadius: 4,
        alignItems: 'center'
    },
    executeButtonText: { color: '#030712', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
    disabledContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
        paddingVertical: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#1f2937',
        gap: 12
    },
    disabledText: { color: '#64748b', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

    governancePanel: {
        padding: 16,
        backgroundColor: '#111827',
        borderLeftWidth: 3,
        borderLeftColor: '#3b82f6'
    },
    governanceText: { fontSize: 12, color: '#94a3b8', lineHeight: 18, fontWeight: '500' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 24 },
    modalContent: {
        backgroundColor: '#0f172a',
        padding: 24,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#1f2937'
    },
    modalTitle: { fontSize: 18, fontWeight: '900', color: '#f9fafb', marginBottom: 16, letterSpacing: 1 },
    modalText: { fontSize: 14, color: '#94a3b8', lineHeight: 22, marginBottom: 32 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
    modalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
    modalCancelText: { color: '#ef4444', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
    modalConfirm: { backgroundColor: '#10b981', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 2 },
    modalConfirmText: { color: '#030712', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
});
