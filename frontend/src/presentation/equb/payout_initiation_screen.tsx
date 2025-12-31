import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { EqubDto } from '../../domain/dtos';
import { PrimaryButton } from '../components/PrimaryButton';
import { GlassCard } from '../components/GlassCard';

export const PayoutInitiationScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;
    const [equb, setEqub] = useState<EqubDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);

    useEffect(() => {
        fetchEqub();
    }, [equbId]);

    const fetchEqub = async () => {
        setLoading(true);
        try {
            const data = await ApiClient.get<EqubDto>(`/equbs/${equbId}`);
            setEqub(data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        Alert.alert(
            'Confirm Payout',
            `Are you sure you want to execute the payout for Round ${equb?.currentRound}? This action is immutable and will increment the round.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Execute',
                    onPress: async () => {
                        setExecuting(true);
                        try {
                            // HUMBLE: Sending atomic execution intent to backend.
                            await ApiClient.post(`/equbs/${equbId}/payouts/execute`, {});
                            Alert.alert('Success', 'Payout executed and round finalized.', [
                                { text: 'OK', onPress: () => navigation.goBack() }
                            ]);
                        } catch (error: any) {
                            // Backend enforces all rules (e.g. contributions not complete)
                            Alert.alert('Execution Failed', error.message);
                        } finally {
                            setExecuting(false);
                        }
                    }
                }
            ]
        );
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
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Initiate Payout</Text>
                    <Text style={styles.subtitle}>{equb.name}</Text>
                </View>

                <GlassCard padding="lg">
                    <Text style={styles.label}>Current State</Text>
                    <Text style={styles.value}>Round {equb.currentRound} / {equb.totalRounds}</Text>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Base Amount</Text>
                        <Text style={styles.value}>{equb.amount} {equb.currency}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Total Pool (Expected)</Text>
                        <Text style={styles.amountText}>{(equb.totalRounds - 1) * equb.amount} {equb.currency}</Text>
                    </View>

                    <Text style={styles.warning}>
                        ⚠️ Payout can only be executed if all active members have confirmed contributions for this round.
                    </Text>

                    <PrimaryButton
                        label="Execute Round Payout"
                        onPress={handleExecute}
                        loading={executing}
                        disabled={executing}
                    />
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
    value: { ...Theme.typography.body, color: Theme.colors.text.primary, fontWeight: 'bold', fontSize: 18 },
    divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 16 },
    infoRow: { marginBottom: 16 },
    amountText: { ...Theme.typography.h1, color: '#22c55e', fontSize: 32, marginTop: 4 },
    warning: { ...Theme.typography.caption, color: '#eab308', textAlign: 'center', marginBottom: 24, padding: 10, backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: 8 },
});
