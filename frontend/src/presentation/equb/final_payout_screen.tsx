import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { PayoutDto } from '../../domain/dtos';
import { GlassCard } from '../components/GlassCard';

export const FinalPayoutScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;
    const [payout, setPayout] = useState<PayoutDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLatestPayout();
    }, [equbId]);

    const fetchLatestPayout = async () => {
        setLoading(true);
        try {
            // HUMBLE: Fetching latest payout summary from backend
            const data = await ApiClient.get<PayoutDto | null>(`/equbs/${equbId}/payouts/latest`);
            setPayout(data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    if (!payout) {
        return (
            <View style={styles.center}>
                <Text style={styles.emptyText}>No payouts executed yet.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Latest Payout</Text>
                    <Text style={styles.subtitle}>Round {payout.roundNumber} Summary</Text>
                </View>

                <GlassCard padding="lg">
                    <Text style={styles.label}>Recipient</Text>
                    <Text style={styles.value}>{payout.recipientUserId}</Text>

                    <View style={styles.divider} />

                    <View style={styles.amountBox}>
                        <Text style={styles.label}>Amount Distributed</Text>
                        <Text style={styles.amountText}>{payout.amount} ETB</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Status</Text>
                        <Text style={styles.statusText}>{payout.status}</Text>
                    </View>

                    {payout.executedAt && (
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Executed At</Text>
                            <Text style={styles.dateText}>{new Date(payout.executedAt).toLocaleString()}</Text>
                        </View>
                    )}
                </GlassCard>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Theme.colors.background },
    container: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background },
    header: { marginBottom: 32 },
    title: { ...Theme.typography.h1, color: Theme.colors.text.primary },
    subtitle: { ...Theme.typography.body, color: Theme.colors.text.secondary },
    label: { ...Theme.typography.caption, color: Theme.colors.text.secondary, textTransform: 'uppercase' },
    value: { ...Theme.typography.h3, color: Theme.colors.text.primary, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 16 },
    amountBox: { paddingVertical: 8 },
    amountText: { ...Theme.typography.h1, color: '#22c55e', fontSize: 32 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    statusText: { color: Theme.colors.primary, fontWeight: 'bold' },
    dateText: { color: Theme.colors.text.secondary },
    emptyText: { ...Theme.typography.body, color: Theme.colors.text.secondary, fontStyle: 'italic' },
});
