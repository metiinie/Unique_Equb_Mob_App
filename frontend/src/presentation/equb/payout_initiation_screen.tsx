import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { PrimaryButton } from '../components/PrimaryButton';
import { GlassCard } from '../components/GlassCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EligibilityResponse {
    canExecute: boolean;
    status: 'READY' | 'WARNING' | 'BLOCKED';
    reasons: string[];
    narrative: string;
    summary: {
        round: number;
        expectedAmount: number;
        memberCount: number;
        confirmedCount: number;
        nextRecipient?: { id: string, name: string };
    };
}

export const PayoutInitiationScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;
    const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);
    const [executionResult, setExecutionResult] = useState<any>(null);
    const [isDegraded, setIsDegraded] = useState(false);

    useEffect(() => {
        fetchEligibility();
        checkSystemHealth();
    }, [equbId]);

    const checkSystemHealth = async () => {
        try {
            const health = await ApiClient.get<any>('/system/version');
            if (health.isDegraded) {
                setIsDegraded(true);
            }
        } catch (e) {
            console.warn('Could not verify system health');
        }
    };

    const fetchEligibility = async () => {
        setLoading(true);
        try {
            const data = await ApiClient.get<EligibilityResponse>(`/equbs/${equbId}/payouts/eligibility`);
            setEligibility(data);
        } catch (error: any) {
            Alert.alert('System Error', 'Could not verify payout eligibility. ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        if (isDegraded) {
            Alert.alert('System Lock', 'Financial writes are disabled in DEGRADED mode.');
            return;
        }
        if (!acknowledged) {
            Alert.alert('Action Required', 'You must acknowledge the irreversibility of this action.');
            return;
        }

        Alert.alert(
            'FINAL CONFIRMATION',
            `Execute Payout of ${eligibility?.summary.expectedAmount} ETB to ${eligibility?.summary.nextRecipient?.name}?\n\nThis cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'EXECUTE NOW',
                    style: 'destructive',
                    onPress: async () => {
                        setExecuting(true);
                        try {
                            const result = await ApiClient.post(`/equbs/${equbId}/payouts/execute`, {
                                acknowledged: true,
                                clientTimestamp: new Date().toISOString()
                            });
                            setExecutionResult(result);
                        } catch (error: any) {
                            Alert.alert('EXECUTION BLOCKED', error.message);
                        } finally {
                            setExecuting(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
                <Text style={styles.loadingText}>Verifying Financial Invariants...</Text>
            </View>
        );
    }

    if (executionResult) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar style="light" />
                <View style={[styles.container, styles.center]}>
                    <MaterialCommunityIcons name="check-circle" size={80} color="#22c55e" />
                    <Text style={styles.successTitle}>PAYOUT EXECUTED</Text>

                    <View style={styles.nextActionBox}>
                        <Text style={styles.nextActionTitle}>NEXT ACTION REQUIRED</Text>
                        <Text style={styles.nextActionText}>Move to Round {executionResult.roundNumber + 1} to begin new contributions.</Text>
                    </View>
                    <GlassCard style={styles.resultCard}>
                        <View style={styles.proofRow}>
                            <Text style={styles.proofLabel}>Transaction ID</Text>
                            <Text style={styles.proofValue}>{executionResult.id}</Text>
                        </View>
                        <View style={styles.proofRow}>
                            <Text style={styles.proofLabel}>Recipient</Text>
                            <Text style={styles.proofValue}>{executionResult.recipient?.fullName}</Text>
                        </View>
                        <View style={styles.proofRow}>
                            <Text style={styles.proofLabel}>Settled Amount</Text>
                            <Text style={[styles.proofValue, { color: '#22c55e' }]}>{executionResult.amount} ETB</Text>
                        </View>
                        <View style={styles.proofRow}>
                            <Text style={styles.proofLabel}>Timestamp</Text>
                            <Text style={styles.proofValue}>{new Date(executionResult.executedAt).toLocaleString()}</Text>
                        </View>
                    </GlassCard>
                    <PrimaryButton
                        label="RETURN TO EQUB"
                        onPress={() => navigation.goBack()}
                        style={{ marginTop: 24, width: '100%' }}
                    />
                </View>
            </SafeAreaView>
        );
    }

    const { summary, status, canExecute, reasons, narrative } = eligibility!;
    const statusColor = status === 'READY' ? '#22c55e' : status === 'WARNING' ? '#eab308' : '#ef4444';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Round {summary.round}</Text>
                    <Text style={styles.subtitle}>Payout Verification & Execution</Text>
                </View>

                {isDegraded && (
                    <View style={styles.degradedBox}>
                        <MaterialCommunityIcons name="shield-lock" size={20} color="#ef4444" />
                        <Text style={styles.degradedText}>SYSTEM DEGRADED: Financial writes are locked for safety.</Text>
                    </View>
                )}

                <View style={[styles.statusBanner, { backgroundColor: statusColor + '15', borderColor: statusColor }]}>
                    <MaterialCommunityIcons
                        name={canExecute ? "check-circle" : "alert-circle"}
                        size={24}
                        color={statusColor}
                    />
                    <View style={styles.statusContent}>
                        <Text style={[styles.statusTitle, { color: statusColor }]}>{status} FOR PAYOUT</Text>
                        <Text style={styles.statusNarrative}>{narrative}</Text>
                    </View>
                </View>

                {reasons.length > 0 && (
                    <View style={styles.reasonsBox}>
                        {reasons.map((r, i) => (
                            <Text key={i} style={styles.reasonItem}>• {r}</Text>
                        ))}
                    </View>
                )}

                <GlassCard padding="lg" style={styles.previewCard}>
                    <Text style={styles.sectionTitle}>PAYOUT PREVIEW</Text>

                    <View style={styles.previewRow}>
                        <View>
                            <Text style={styles.previewLabel}>RECIPIENT</Text>
                            <Text style={styles.previewValue}>{summary.nextRecipient?.name || 'N/A'}</Text>
                        </View>
                        <MaterialCommunityIcons name="account-arrow-right" size={32} color={Theme.colors.primary} />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.previewRow}>
                        <View>
                            <Text style={styles.previewLabel}>AMOUNT TO SETTLE</Text>
                            <Text style={styles.amountValue}>{summary.expectedAmount} {Theme.colors.currency || 'ETB'}</Text>
                        </View>
                        <View style={styles.fundingStatus}>
                            <Text style={styles.fundingLabel}>FUNDING</Text>
                            <Text style={styles.fundingValue}>{summary.confirmedCount}/{summary.memberCount}</Text>
                        </View>
                    </View>
                </GlassCard>

                <TouchableOpacity
                    style={styles.ackRow}
                    onPress={() => setAcknowledged(!acknowledged)}
                    activeOpacity={0.7}
                    disabled={isDegraded}
                >
                    <MaterialCommunityIcons
                        name={acknowledged ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={24}
                        color={acknowledged ? Theme.colors.primary : Theme.colors.text.secondary}
                    />
                    <Text style={styles.ackText}>
                        I acknowledge that this payout is <Text style={{ fontWeight: 'bold', color: '#ef4444' }}>IRREVERSIBLE</Text>. I have verified the recipient and total amount.
                    </Text>
                </TouchableOpacity>

                <PrimaryButton
                    label={isDegraded ? "WRITES LOCKED" : "EXECUTE PAYOUT"}
                    onPress={handleExecute}
                    loading={executing}
                    disabled={!canExecute || executing || !acknowledged || isDegraded}
                    variant={canExecute && !isDegraded ? 'primary' : 'secondary'}
                    style={styles.executeButton}
                />

                <Text style={styles.footerNote}>
                    Only authorized Admins and Collectors can execute this financial bridge.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Theme.colors.background },
    container: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, ...Theme.typography.caption, color: Theme.colors.text.secondary },
    header: { marginBottom: 24 },
    title: { ...Theme.typography.h1, color: Theme.colors.text.primary, fontSize: 32 },
    subtitle: { ...Theme.typography.body, color: Theme.colors.text.secondary, textTransform: 'uppercase', letterSpacing: 1 },

    statusBanner: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        alignItems: 'center'
    },
    statusContent: { marginLeft: 12, flex: 1 },
    statusTitle: { fontWeight: '900', fontSize: 12, letterSpacing: 1 },
    statusNarrative: { ...Theme.typography.caption, color: Theme.colors.text.primary, marginTop: 2 },

    reasonsBox: { marginBottom: 20, paddingHorizontal: 4 },
    reasonItem: { ...Theme.typography.caption, color: '#ef4444', marginBottom: 4 },

    previewCard: { marginBottom: 24, borderLeftWidth: 4, borderLeftColor: Theme.colors.primary },
    sectionTitle: { fontSize: 10, fontWeight: '900', color: Theme.colors.text.secondary, marginBottom: 16, letterSpacing: 2 },
    previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    previewLabel: { fontSize: 9, color: Theme.colors.text.secondary, fontWeight: '700' },
    previewValue: { ...Theme.typography.h3, color: Theme.colors.text.primary, marginTop: 4 },
    divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 16, opacity: 0.5 },
    amountValue: { ...Theme.typography.h1, color: Theme.colors.text.primary, marginTop: 4 },
    fundingStatus: { alignItems: 'flex-end' },
    fundingLabel: { fontSize: 9, color: Theme.colors.text.secondary, fontWeight: '700' },
    fundingValue: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.text.primary, marginTop: 2 },

    ackRow: { flexDirection: 'row', marginBottom: 24, padding: 12, backgroundColor: '#0a0a0a', borderRadius: 8, alignItems: 'center' },
    ackText: { flex: 1, marginLeft: 12, fontSize: 12, color: Theme.colors.text.secondary, lineHeight: 18 },

    executeButton: { height: 60 },
    footerNote: { textAlign: 'center', fontSize: 10, color: '#444', marginTop: 16, textTransform: 'uppercase' },

    successTitle: { ...Theme.typography.h1, color: '#ffffff', marginTop: 16, marginBottom: 32 },
    resultCard: { width: '100%', padding: 20 },
    proofRow: { marginBottom: 16 },
    proofLabel: { fontSize: 10, color: Theme.colors.text.secondary, textTransform: 'uppercase', marginBottom: 4 },
    proofValue: { fontSize: 14, fontWeight: 'bold', color: Theme.colors.text.primary, fontFamily: 'monospace' },

    degradedBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#ef4444' },
    degradedText: { fontSize: 11, color: '#ef4444', fontWeight: 'bold', marginLeft: 8 },

    nextActionBox: { width: '100%', backgroundColor: '#0a0a0a', padding: 16, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: Theme.colors.primary, marginBottom: 24 },
    nextActionTitle: { fontSize: 10, fontWeight: '900', color: Theme.colors.primary, marginBottom: 4 },
    nextActionText: { fontSize: 12, color: '#ccc' },
});
