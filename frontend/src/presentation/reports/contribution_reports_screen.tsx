import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { Theme } from '../theme';

export const ContributionReportsScreen: React.FC = () => {
    const [report, setReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const data = await ApiClient.get('/reports/contributions');
            setReport(data as any[]);
        } catch (error) {
            console.error('[ContributionReportsScreen] Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const csv = 'Equb,Round,Member,Amount,Status,Date\n' +
                report.map(r => `${r.equb.name},${r.roundNumber},${r.member.fullName},${r.amount},${r.status},${new Date(r.createdAt).toLocaleDateString()}`).join('\n');

            await Share.share({
                message: csv,
                title: 'Contribution Report Export',
            });
        } catch (error) {
            console.error('[ContributionReportsScreen] Export error:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.title}>Financial Reports</Text>
                <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
                    <Text style={styles.exportBtnText}>Export CSV</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.sectionTitle}>Contribution Ledger (Immutable)</Text>

                {report.map((item) => (
                    <View key={item.id} style={styles.reportCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.equbName}>{item.equb.name}</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{item.status}</Text>
                            </View>
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Member</Text>
                                <Text style={styles.value}>{item.member.fullName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Round</Text>
                                <Text style={styles.value}>{item.roundNumber}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Amount</Text>
                                <Text style={styles.value}>{item.amount.toLocaleString()} ETB</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Date</Text>
                                <Text style={styles.value}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </View>
                    </View>
                ))}

                {report.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No ledger entries found.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#101622' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#101622' },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#2d3748'
    },
    title: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
    exportBtn: { backgroundColor: '#2b6cee', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    exportBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
    container: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#94a3b8', marginBottom: 16 },
    reportCard: {
        backgroundColor: '#1c2333',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    equbName: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
    statusBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '800', color: '#22c55e' },
    cardBody: { gap: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 13, color: '#64748b' },
    value: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: '#64748b', fontSize: 14 },
});
