import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { LinearGradient } from 'expo-linear-gradient';

export const AdvancedAnalyticsScreen: React.FC = () => {
    const [summary, setSummary] = useState<any>(null);
    const [contributions, setContributions] = useState<any>(null);
    const [payouts, setPayouts] = useState<any>(null);
    const [engagement, setEngagement] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [sum, con, pay, eng] = await Promise.all([
                ApiClient.get('/analytics/equbs/summary'),
                ApiClient.get('/analytics/contributions/history'),
                ApiClient.get('/analytics/payouts/history'),
                ApiClient.get('/analytics/member/engagement'),
            ]);
            setSummary(sum);
            setContributions(con);
            setPayouts(pay);
            setEngagement(eng);
        } catch (error) {
            console.error('[AdvancedAnalyticsScreen] Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleExport = async () => {
        const reportText = `
SYSTEM ANALYTICS REPORT
Generated: ${new Date().toLocaleString()}

EQUB SUMMARY:
Total Equbs: ${summary?.overview.totalEqubs}
Active: ${summary?.overview.activeEqubs}
Completed: ${summary?.overview.completedEqubs}
Completion Rate: ${summary?.overview.completionRate.toFixed(2)}%

FINANCIALS:
Total Contribution Volume: ${contributions?.totalVolume.toLocaleString()} ETB
Total Payout Volume: ${payouts?.totalPayoutVolume.toLocaleString()} ETB

ENGAGEMENT:
Global Participation Rate: ${engagement?.globalParticipationRate.toFixed(2)}%
Total Memberships: ${engagement?.memberships}
        `;
        await Share.share({ message: reportText, title: 'Export Analytics' });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator color={Theme.colors.primary} style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Network Insights</Text>
                    <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                        <Text style={styles.exportText}>Export Report</Text>
                    </TouchableOpacity>
                </View>

                {/* KPI Overview */}
                <View style={styles.kpiGrid}>
                    <KPICard label="Completion Rate" value={`${summary?.overview.completionRate.toFixed(1)}%`} subValue="Avg success" color="#2b6cee" />
                    <KPICard label="Participation" value={`${engagement?.globalParticipationRate.toFixed(1)}%`} subValue="Active engagement" color="#22c55e" />
                </View>

                {/* Volume Summary */}
                <LinearGradient colors={['#1c2333', '#111827']} style={styles.volumeCard}>
                    <Text style={styles.cardTitle}>Financial Velocity</Text>
                    <View style={styles.volumeRow}>
                        <View>
                            <Text style={styles.volumeLabel}>Contributions</Text>
                            <Text style={styles.volumeValue}>{contributions?.totalVolume.toLocaleString()} ETB</Text>
                        </View>
                        <View style={styles.divider} />
                        <View>
                            <Text style={styles.volumeLabel}>Payouts</Text>
                            <Text style={styles.volumeValue}>{payouts?.totalPayoutVolume.toLocaleString()} ETB</Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Recent History / Trends List */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Daily Contribution Trend</Text>
                </View>
                <View style={styles.trendList}>
                    {contributions?.history.slice(0, 5).map((item: any, idx: number) => (
                        <View key={idx} style={styles.trendItem}>
                            <Text style={styles.trendDate}>{item.date}</Text>
                            <Text style={styles.trendAmount}>{item.amount.toLocaleString()} ETB</Text>
                        </View>
                    ))}
                    {contributions?.history.length === 0 && <Text style={styles.emptyText}>No historical data yet.</Text>}
                </View>

                {/* Engagement Metrics */}
                <View style={styles.statsCard}>
                    <Text style={styles.cardTitle}>Member Reach</Text>
                    <HealthRow label="Total Memberships" value={engagement?.memberships} />
                    <HealthRow label="Confirmed Contributions" value={engagement?.contributionDensity} />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const KPICard: React.FC<{ label: string, value: string, subValue: string, color: string }> = ({ label, value, subValue, color }) => (
    <View style={styles.kpiCard}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={[styles.kpiValue, { color }]}>{value}</Text>
        <Text style={styles.kpiSubValue}>{subValue}</Text>
    </View>
);

const HealthRow: React.FC<{ label: string, value: any }> = ({ label, value }) => (
    <View style={styles.healthRow}>
        <Text style={styles.healthLabel}>{label}</Text>
        <Text style={styles.healthValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#101622' },
    container: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
    exportBtn: { backgroundColor: 'rgba(43, 108, 238, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    exportText: { fontSize: 12, fontWeight: '700', color: '#2b6cee' },
    kpiGrid: { flexDirection: 'row', gap: 16, marginBottom: 20 },
    kpiCard: { flex: 1, backgroundColor: '#1c2333', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#2d3748' },
    kpiLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: '600' },
    kpiValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
    kpiSubValue: { fontSize: 10, color: '#64748b' },
    volumeCard: { padding: 20, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#2d3748' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#94a3b8', marginBottom: 16 },
    volumeRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    volumeLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    volumeValue: { fontSize: 18, fontWeight: '800', color: '#ffffff' },
    divider: { width: 1, height: 40, backgroundColor: '#2d3748' },
    sectionHeader: { marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
    trendList: { backgroundColor: '#1c2333', borderRadius: 16, overflow: 'hidden', padding: 16, marginBottom: 24 },
    trendItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2d3748' },
    trendDate: { fontSize: 14, color: '#cbd5e1' },
    trendAmount: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
    statsCard: { backgroundColor: '#1c2333', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2d3748' },
    healthRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    healthLabel: { fontSize: 14, color: '#64748b' },
    healthValue: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
    emptyText: { color: '#64748b', textAlign: 'center', fontStyle: 'italic' },
});
