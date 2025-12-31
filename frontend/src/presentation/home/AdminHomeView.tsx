import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { HomeHeader } from '../components/HomeHeader';

// Pure View Component: Admin Home Dashboard
// Contains ONLY UI - no navigation, no role logic, no guards
// Rendered internally by HomeScreen when role === admin

export const AdminHomeView = ({ navigation }: { navigation: any }) => {
    // Mock data for Equb circles
    const equbs = [
        {
            id: '1',
            name: 'Addis Merkato Traders',
            frequency: 'Monthly',
            payout: '5,000 ETB',
            round: 4,
            total: 10,
            progress: 40,
            status: 'Healthy',
            statusColor: 'green',
            icon: '🏪',
            iconBg: '#6366f1',
        },
        {
            id: '2',
            name: 'Family Savings',
            frequency: 'Weekly',
            payout: '1,000 ETB',
            round: 8,
            total: 12,
            progress: 66,
            status: 'Action Needed',
            statusColor: 'red',
            icon: '👨‍👩‍👧',
            iconBg: '#f97316',
            warning: '2 Members overdue',
        },
        {
            id: '3',
            name: 'Office Colleagues',
            frequency: 'Bi-Weekly',
            payout: '2,500 ETB',
            round: 1,
            total: 12,
            progress: 8,
            status: 'Healthy',
            statusColor: 'green',
            icon: '💼',
            iconBg: '#3b82f6',
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <HomeHeader
                    userName="Selam, Abebe"
                    greeting="Welcome back"
                    onNotificationPress={() => navigation.navigate('NotificationCenterScreen')}
                />

                {/* Quick Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(43, 108, 238, 0.2)' }]}>
                                <Text style={styles.statIconText}>👥</Text>
                            </View>
                            <Text style={styles.statLabel}>Active Equbs</Text>
                        </View>
                        <Text style={styles.statValue}>3</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                                <Text style={styles.statIconText}>💳</Text>
                            </View>
                            <Text style={styles.statLabel}>Collected</Text>
                        </View>
                        <Text style={styles.statValue}>
                            45k <Text style={styles.statCurrency}>ETB</Text>
                        </Text>
                    </View>
                </View>

                {/* Create New CTA */}
                <View style={styles.ctaContainer}>
                    <TouchableOpacity style={styles.createBtn}>
                        <Text style={styles.createIcon}>➕</Text>
                        <Text style={styles.createText}>Create New Equb</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Circles</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllBtn}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Equb List */}
                <View style={styles.equbList}>
                    {equbs.map((equb) => (
                        <View key={equb.id} style={styles.equbCard}>
                            <View style={styles.equbHeader}>
                                <View style={styles.equbInfo}>
                                    <View style={[styles.equbIcon, { backgroundColor: `${equb.iconBg}1A` }]}>
                                        <Text style={styles.equbIconText}>{equb.icon}</Text>
                                    </View>
                                    <View style={styles.equbDetails}>
                                        <Text style={styles.equbName}>{equb.name}</Text>
                                        <Text style={styles.equbMeta}>
                                            {equb.frequency} • {equb.payout} Payout
                                        </Text>
                                    </View>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        equb.statusColor === 'green' && styles.statusBadgeGreen,
                                        equb.statusColor === 'red' && styles.statusBadgeRed,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.statusText,
                                            equb.statusColor === 'green' && styles.statusTextGreen,
                                            equb.statusColor === 'red' && styles.statusTextRed,
                                        ]}
                                    >
                                        {equb.status}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress */}
                            <View style={styles.progressSection}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressLabel}>
                                        Round {equb.round} of {equb.total}
                                    </Text>
                                    <Text style={styles.progressPercent}>{equb.progress}%</Text>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            { width: `${equb.progress}%` },
                                            equb.statusColor === 'red' && styles.progressBarOrange,
                                        ]}
                                    />
                                </View>
                                {equb.warning && (
                                    <View style={styles.warningRow}>
                                        <Text style={styles.warningIcon}>⚠️</Text>
                                        <Text style={styles.warningText}>{equb.warning}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 24,
    },
    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 32,
        paddingBottom: 16,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2b6cee',
        borderWidth: 2,
        borderColor: '#2b6cee',
    },
    statusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#101622',
    },
    welcomeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9da6b9',
    },
    nameText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.3,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bellIcon: {
        fontSize: 20,
    },
    /* Stats */
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1e2430',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIconText: {
        fontSize: 14,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9da6b9',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    statCurrency: {
        fontSize: 14,
        fontWeight: '400',
        color: '#64748b',
    },
    /* CTA */
    ctaContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2b6cee',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    createIcon: {
        fontSize: 18,
    },
    createText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    /* Section */
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.3,
    },
    viewAllBtn: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2b6cee',
    },
    /* Equb List */
    equbList: {
        paddingHorizontal: 16,
        gap: 16,
    },
    equbCard: {
        backgroundColor: '#1e2430',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
        gap: 12,
    },
    equbHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    equbInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    equbIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    equbIconText: {
        fontSize: 20,
    },
    equbDetails: {
        flex: 1,
    },
    equbName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 2,
    },
    equbMeta: {
        fontSize: 12,
        color: '#9da6b9',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        borderWidth: 1,
    },
    statusBadgeGreen: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    statusBadgeRed: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusTextGreen: {
        color: '#22c55e',
    },
    statusTextRed: {
        color: '#ef4444',
    },
    /* Progress */
    progressSection: {
        marginTop: 4,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    progressPercent: {
        fontSize: 12,
        fontWeight: '500',
        color: '#ffffff',
    },
    progressBarBg: {
        width: '100%',
        height: 8,
        backgroundColor: '#2c3442',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2b6cee',
        borderRadius: 4,
    },
    progressBarOrange: {
        backgroundColor: '#f97316',
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    warningIcon: {
        fontSize: 12,
    },
    warningText: {
        fontSize: 12,
        color: '#f87171',
    },
});
