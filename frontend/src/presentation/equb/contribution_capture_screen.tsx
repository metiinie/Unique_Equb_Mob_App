import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { EqubDto } from '../../domain/dtos';
import { PrimaryButton } from '../components/PrimaryButton';
import { GlassCard } from '../components/GlassCard';

export const ContributionCaptureScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;
    const [equb, setEqub] = useState<EqubDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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

    const handleContribute = async () => {
        setSubmitting(true);
        try {
            // HUMBLE: Send intent to backend. Backend validates amount/round.
            await ApiClient.post(`/equbs/${equbId}/contribute`, {
                amount: equb?.amount
            });

            Alert.alert('Success', 'Contribution created successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            // Surface backend business rule violation (e.g. 409 already contributed)
            Alert.alert('Contribution Failed', error.message);
        } finally {
            setSubmitting(false);
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
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>New Contribution</Text>
                    <Text style={styles.subtitle}>{equb.name}</Text>
                </View>

                <GlassCard padding="lg">
                    <Text style={styles.label}>Active Round</Text>
                    <Text style={styles.value}>Round {equb.currentRound}</Text>

                    <View style={styles.divider} />

                    <Text style={styles.label}>Contribution Amount</Text>
                    <Text style={styles.amountText}>{equb.amount} {equb.currency}</Text>

                    <Text style={styles.hint}>
                        By submitting, you are committing to this round's contribution.
                    </Text>

                    <PrimaryButton
                        label="Submit Contribution"
                        onPress={handleContribute}
                        loading={submitting}
                        disabled={submitting}
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
    value: { ...Theme.typography.h3, color: Theme.colors.text.primary, marginBottom: 16 },
    divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 16 },
    amountText: { ...Theme.typography.h1, color: Theme.colors.primary, fontSize: 36, marginBottom: 24 },
    hint: { ...Theme.typography.caption, color: Theme.colors.text.muted, textAlign: 'center', marginBottom: 24, fontStyle: 'italic' },
});
