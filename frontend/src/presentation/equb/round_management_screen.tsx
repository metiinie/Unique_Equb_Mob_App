import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { GlobalRole } from '../../core/constants/enums';

export const RoundManagementScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;
    const [info, setInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchRoundInfo();
    }, [equbId]);

    const fetchRoundInfo = async () => {
        setLoading(true);
        try {
            const data = await ApiClient.get(`/equbs/${equbId}/rounds/current`);
            setInfo(data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdvanceRound = async () => {
        setProcessing(true);
        try {
            await ApiClient.post(`/equbs/${equbId}/advance-round`, {});
            Alert.alert('Success', 'Round advanced successfully');
            fetchRoundInfo();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCompleteEqub = async () => {
        setProcessing(true);
        try {
            await ApiClient.post(`/equbs/${equbId}/complete`, {});
            Alert.alert('Success', 'Equb completed successfully');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    const allPaid = info.contributions.length > 0; // Simple check for demo
    const payoutExecuted = !!info.payout;
    const isLastRound = info.roundNumber === info.totalRounds;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Round {info.roundNumber} of {info.totalRounds}</Text>
                    <Text style={styles.subtitle}>Derived Round Management Dashboard</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Round Checklist</Text>

                    <CheckItem
                        label="Contributions Collected"
                        status={allPaid ? 'COMPLETE' : 'PENDING'}
                        color={allPaid ? '#22c55e' : '#eab308'}
                    />
                    <CheckItem
                        label="Payout Executed"
                        status={payoutExecuted ? 'COMPLETE' : 'PENDING'}
                        color={payoutExecuted ? '#22c55e' : '#eab308'}
                    />
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Contributions ({info.contributions.length})</Text>
                    {info.contributions.map((c: any) => (
                        <View key={c.id} style={styles.listItem}>
                            <Text style={styles.memberName}>{c.member.fullName}</Text>
                            <Text style={styles.amount}>{c.amount.toLocaleString()} ETB</Text>
                        </View>
                    ))}
                </View>

                {payoutExecuted && (
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Payout Record</Text>
                        <View style={styles.payoutCard}>
                            <Text style={styles.payoutLabel}>Recipient</Text>
                            <Text style={styles.payoutValue}>{info.payout.recipient.fullName}</Text>
                            <Text style={styles.payoutLabel}>Amount</Text>
                            <Text style={styles.payoutValue}>{info.payout.amount.toLocaleString()} ETB</Text>
                        </View>
                    </View>
                )}

                <View style={styles.actions}>
                    {processing ? (
                        <ActivityIndicator color={Theme.colors.primary} />
                    ) : (
                        <>
                            {!payoutExecuted && (
                                <TouchableOpacity
                                    style={[styles.primaryBtn, { backgroundColor: '#eab308' }]}
                                    onPress={() => navigation.navigate('PayoutInitiation', { equbId })}
                                >
                                    <Text style={styles.btnText}>Initiate Payout</Text>
                                </TouchableOpacity>
                            )}

                            {payoutExecuted && !isLastRound && (
                                <TouchableOpacity
                                    style={styles.primaryBtn}
                                    onPress={handleAdvanceRound}
                                >
                                    <Text style={styles.btnText}>Advance to Round {info.roundNumber + 1}</Text>
                                </TouchableOpacity>
                            )}

                            {payoutExecuted && isLastRound && (
                                <TouchableOpacity
                                    style={[styles.primaryBtn, { backgroundColor: '#22c55e' }]}
                                    onPress={handleCompleteEqub}
                                >
                                    <Text style={styles.btnText}>Complete Equb</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const CheckItem: React.FC<{ label: string, status: string, color: string }> = ({ label, status, color }) => (
    <View style={styles.checkRow}>
        <Text style={styles.checkLabel}>{label}</Text>
        <View style={[styles.checkBadge, { backgroundColor: color + '22' }]}>
            <Text style={[styles.checkText, { color }]}>{status}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#101622' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#101622' },
    container: { padding: 20 },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
    subtitle: { fontSize: 12, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
    card: { backgroundColor: '#1c2333', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2d3748' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 16 },
    checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    checkLabel: { fontSize: 14, color: '#94a3b8' },
    checkBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    checkText: { fontSize: 10, fontWeight: '800' },
    infoSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 12 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2d3748' },
    memberName: { fontSize: 14, color: '#ffffff' },
    amount: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
    payoutCard: { backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
    payoutLabel: { fontSize: 12, color: '#3b82f6', marginBottom: 2 },
    payoutValue: { fontSize: 16, fontWeight: '800', color: '#ffffff', marginBottom: 8 },
    actions: { marginTop: 10 },
    primaryBtn: { backgroundColor: '#2b6cee', padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
});
