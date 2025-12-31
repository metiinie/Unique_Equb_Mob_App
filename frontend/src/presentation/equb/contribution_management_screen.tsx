import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { ContributionDto, EqubDto } from '../../domain/dtos';
import { ContributionStatus } from '../../core/constants/enums';

export const ContributionManagementScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;
    const [contributions, setContributions] = useState<ContributionDto[]>([]);
    const [equb, setEqub] = useState<EqubDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [equbId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [equbData, contributionsData] = await Promise.all([
                ApiClient.get<EqubDto>(`/equbs/${equbId}`),
                ApiClient.get<ContributionDto[]>(`/equbs/${equbId}/contributions?status=${ContributionStatus.PENDING}`)
            ]);
            setEqub(equbData);
            setContributions(contributionsData);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (contributionId: string, action: 'confirm' | 'reject') => {
        setProcessingId(contributionId);
        try {
            await ApiClient.post(`/contributions/${contributionId}/${action}`, {});
            Alert.alert('Success', `Contribution ${action}ed successfully.`);
            // Refresh list
            setContributions(prev => prev.filter(c => c.id !== contributionId));
        } catch (error: any) {
            Alert.alert('Action Failed', error.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading || !equb) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Pending Approvals</Text>
                    <Text style={styles.subtitle}>{equb.name} - Round {equb.currentRound}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {contributions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No pending contributions.</Text>
                        </View>
                    ) : (
                        contributions.map((c) => (
                            <View key={c.id} style={styles.card}>
                                <View style={styles.cardRow}>
                                    <View>
                                        <Text style={styles.memberId}>Member: {c.memberId}</Text>
                                        <Text style={styles.amount}>{c.amount} {equb.currency}</Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={[styles.btn, styles.rejectBtn]}
                                            onPress={() => handleAction(c.id, 'reject')}
                                            disabled={!!processingId}
                                        >
                                            <Text style={styles.btnText}>Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.btn, styles.confirmBtn]}
                                            onPress={() => handleAction(c.id, 'confirm')}
                                            disabled={!!processingId}
                                        >
                                            {processingId === c.id ? (
                                                <ActivityIndicator size="small" color="#fff" />
                                            ) : (
                                                <Text style={styles.btnText}>Confirm</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Theme.colors.background },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
    title: { ...Theme.typography.h1, color: Theme.colors.text.primary },
    subtitle: { ...Theme.typography.body, color: Theme.colors.text.secondary },
    scrollContent: { padding: 20 },
    card: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    memberId: { ...Theme.typography.caption, color: Theme.colors.text.secondary },
    amount: { ...Theme.typography.h3, color: Theme.colors.text.primary },
    actions: { flexDirection: 'row', gap: 8 },
    btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, minWidth: 80, alignItems: 'center' },
    confirmBtn: { backgroundColor: '#22c55e' },
    rejectBtn: { backgroundColor: '#ef4444' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    emptyState: { padding: 40, alignItems: 'center' },
    emptyText: { ...Theme.typography.body, color: Theme.colors.text.secondary, fontStyle: 'italic' },
});
