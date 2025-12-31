import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Purity: Presentational Component only. Hardcoded data for pixel-perfect admin reports translation.

export const AdminReportScreen = ({ navigation }: { navigation: any }) => {
    // Local state for timeframe toggle
    const [timeframe, setTimeframe] = useState<'month' | '6months' | 'all'>('month');

    const recentPayouts = [
        { id: 1, initials: 'AK', name: 'Abebe Kebede', date: 'Oct 12, 2023', amount: 'ETB 50,000', status: 'Completed', color: 'primary' },
        { id: 2, initials: 'ST', name: 'Sara Tadesse', date: 'Oct 05, 2023', amount: 'ETB 50,000', status: 'Completed', color: 'purple' },
        { id: 3, initials: 'DY', name: 'Dawit Yilma', date: 'Sep 28, 2023', amount: 'ETB 50,000', status: 'Pending', color: 'amber' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Admin Reports</Text>
                    <TouchableOpacity style={styles.exportBtn}>
                        <Text style={styles.exportText}>Export</Text>
                        <Text style={styles.downloadIcon}>⬇</Text>
                    </TouchableOpacity>
                </View>

                {/* Timeframe Selector */}
                <View style={styles.timeframeContainer}>
                    <View style={styles.timeframeBar}>
                        <TouchableOpacity
                            style={[styles.tfOption, timeframe === 'month' && styles.tfActive]}
                            onPress={() => setTimeframe('month')}
                        >
                            <Text style={[styles.tfText, timeframe === 'month' && styles.tfTextActive]}>This Month</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tfOption, timeframe === '6months' && styles.tfActive]}
                            onPress={() => setTimeframe('6months')}
                        >
                            <Text style={[styles.tfText, timeframe === '6months' && styles.tfTextActive]}>Last 6 Months</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tfOption, timeframe === 'all' && styles.tfActive]}
                            onPress={() => setTimeframe('all')}
                        >
                            <Text style={[styles.tfText, timeframe === 'all' && styles.tfTextActive]}>All Time</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Hero Stat: Total Collected */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.heroCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardLabel}>Total Contributions Collected</Text>
                                <View style={styles.savingsIconBox}>
                                    <Text style={styles.savingsIcon}>💰</Text>
                                </View>
                            </View>
                            <Text style={styles.heroValue}>ETB 450,000</Text>
                            <View style={styles.trendRow}>
                                <Text style={styles.trendIcon}>📈</Text>
                                <Text style={styles.trendValue}>+5%</Text>
                                <Text style={styles.trendLabel}>vs last month</Text>
                            </View>
                        </View>
                    </View>

                    {/* Equb Health Trends */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Equb Health Trends</Text>
                        <View style={styles.healthCard}>
                            <View style={styles.healthHeader}>
                                <View>
                                    <Text style={styles.healthLabel}>Collection Rate</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                                        <Text style={styles.healthValue}>85%</Text>
                                        <Text style={styles.healthSub}>On-time</Text>
                                    </View>
                                </View>
                                <View style={styles.miniTrend}>
                                    <Text style={styles.miniTrendVal}>+2%</Text>
                                    <Text style={styles.miniTrendLabel}>Trend</Text>
                                </View>
                            </View>

                            <View style={styles.chartContainer}>
                                {/* On-Time Bar */}
                                <View style={styles.barGroup}>
                                    <View style={styles.barLabels}>
                                        <Text style={styles.barLabel}>On-time</Text>
                                        <Text style={styles.barLabel}>85%</Text>
                                    </View>
                                    <View style={styles.barTrack}>
                                        <View style={[styles.barFill, { width: '85%', backgroundColor: '#2b6cee' }]} />
                                    </View>
                                </View>
                                {/* Late Bar */}
                                <View style={styles.barGroup}>
                                    <View style={styles.barLabels}>
                                        <Text style={styles.barLabel}>Late</Text>
                                        <Text style={styles.barLabel}>15%</Text>
                                    </View>
                                    <View style={styles.barTrack}>
                                        <View style={[styles.barFill, { width: '15%', backgroundColor: '#f59e0b' }]} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Recent Payouts */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.listHeader}>
                            <Text style={styles.sectionTitle}>Recent Payouts</Text>
                            <TouchableOpacity>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.payoutList}>
                            {recentPayouts.map((item) => (
                                <View key={item.id} style={styles.payoutCard}>
                                    <View style={styles.payoutLeft}>
                                        <View style={[
                                            styles.initialsBox,
                                            item.color === 'primary' && styles.bgPrimary,
                                            item.color === 'purple' && styles.bgPurple,
                                            item.color === 'amber' && styles.bgAmber
                                        ]}>
                                            <Text style={[
                                                styles.initialsText,
                                                item.color === 'primary' && styles.textPrimary,
                                                item.color === 'purple' && styles.textPurple,
                                                item.color === 'amber' && styles.textAmber
                                            ]}>
                                                {item.initials}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.payoutName}>{item.name}</Text>
                                            <Text style={styles.payoutDate}>{item.date}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.payoutRight}>
                                        <Text style={styles.payoutAmount}>{item.amount}</Text>
                                        <View style={[
                                            styles.statusChip,
                                            item.status === 'Completed' ? styles.bgGreenRef : styles.bgAmberRef
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                item.status === 'Completed' ? styles.textGreen : styles.textAmber
                                            ]}>
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#101622',
    },
    container: {
        flex: 1,
        backgroundColor: '#101622',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(16, 22, 34, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(241, 245, 249, 0.05)', // slate-200 equivalent opacity in dark
    },
    backIcon: {
        fontSize: 20,
        color: '#ffffff',
    },
    exportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    exportText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2b6cee',
    },
    downloadIcon: {
        fontSize: 16,
        color: '#2b6cee',
    },
    /* Timeframe */
    timeframeContainer: {
        padding: 16,
    },
    timeframeBar: {
        flexDirection: 'row',
        backgroundColor: '#282e39', // surface-highlight
        padding: 4,
        borderRadius: 8,
        height: 40,
    },
    tfOption: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    tfActive: {
        backgroundColor: '#1c232e', // surface-dark
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    tfText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
    },
    tfTextActive: {
        color: '#ffffff',
    },
    scrollContent: {

    },
    sectionContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    /* Hero Card */
    heroCard: {
        backgroundColor: '#282e39', // surface-highlight
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#cbd5e1',
    },
    savingsIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    savingsIcon: {
        fontSize: 18,
    },
    heroValue: {
        fontSize: 30,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    trendIcon: {
        fontSize: 14,
        color: '#0bda5e',
    },
    trendValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0bda5e',
    },
    trendLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94a3b8',
    },
    /* Health Trends */
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 16,
    },
    healthCard: {
        backgroundColor: '#282e39',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    healthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    healthLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#cbd5e1',
    },
    healthValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 4,
    },
    healthSub: {
        fontSize: 16,
        fontWeight: '400',
        color: '#94a3b8',
    },
    miniTrend: {
        alignItems: 'flex-end',
    },
    miniTrendVal: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0bda5e',
    },
    miniTrendLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    chartContainer: {
        gap: 12,
    },
    barGroup: {
        gap: 4,
    },
    barLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    barLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    barTrack: {
        height: 12,
        backgroundColor: '#1c232e', // surface-dark
        borderRadius: 6,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 6,
    },
    /* Recent Payouts */
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2b6cee',
    },
    payoutList: {
        gap: 12,
    },
    payoutCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#282e39',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    payoutLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    initialsBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgPrimary: { backgroundColor: 'rgba(43, 108, 238, 0.1)' },
    bgPurple: { backgroundColor: 'rgba(147, 51, 234, 0.1)' },
    bgAmber: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    initialsText: {
        fontSize: 14,
        fontWeight: '700',
    },
    textPrimary: { color: '#2b6cee' },
    textPurple: { color: '#c084fc' },
    textAmber: { color: '#f59e0b' },
    payoutName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    payoutDate: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94a3b8',
    },
    payoutRight: {
        alignItems: 'flex-end',
    },
    payoutAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    statusChip: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 4,
    },
    bgGreenRef: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
    bgAmberRef: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textGreen: { color: '#4ade80' },

});
