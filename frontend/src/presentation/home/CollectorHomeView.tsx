import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeHeader } from '../components/HomeHeader';

// Pure View Component: Collector Home Dashboard
// Contains ONLY UI - no navigation, no role logic, no guards
// Rendered internally by HomeScreen when role === collector

export const CollectorHomeView = ({ navigation }: { navigation: any }) => {
    // Mock data for collections
    const collections = [
        {
            id: '1',
            name: 'Kebede T.',
            amount: '5,000 ETB',
            status: 'Pending',
            statusColor: 'yellow',
            statusIcon: '⏰',
            time: 'Tap to remind',
            statusDot: '#eab308',
        },
        {
            id: '2',
            name: 'Sara M.',
            amount: '5,000 ETB',
            status: 'Paid',
            statusColor: 'green',
            statusIcon: '✓',
            time: 'Paid at 10:30 AM',
            statusDot: '#22c55e',
            isPaid: true,
        },
        {
            id: '3',
            name: 'Dawit K.',
            amount: '10,000 ETB',
            status: 'Overdue',
            statusColor: 'red',
            statusIcon: '⚠️',
            time: 'Action Needed',
            statusDot: '#ef4444',
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <HomeHeader
                    userName="Good Morning, Abebe"
                    greeting=""
                    roleLabel="COLLECTOR"
                    onNotificationPress={() => navigation.navigate('NotificationCenterScreen')}
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Quick Stats */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <Text style={styles.statIcon}>🎯</Text>
                                <Text style={styles.statLabel}>Today's Target</Text>
                            </View>
                            <Text style={styles.statValue}>50,000 ETB</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardHighlight]}>
                            <View style={styles.statWatermark}>
                                <Text style={styles.watermarkIcon}>💳</Text>
                            </View>
                            <View style={styles.statHeader}>
                                <Text style={styles.statIconGreen}>✓</Text>
                                <Text style={styles.statLabel}>Collected</Text>
                            </View>
                            <Text style={styles.statValue}>35,000 ETB</Text>
                        </View>
                    </View>

                    {/* Progress Card */}
                    <LinearGradient
                        colors={['#1b232e', '#161b24']}
                        style={styles.progressCard}
                    >
                        <View style={styles.progressHeader}>
                            <View>
                                <Text style={styles.progressTitle}>Daily Goal Progress</Text>
                                <Text style={styles.progressSubtitle}>15,000 ETB remaining to reach target</Text>
                            </View>
                            <Text style={styles.progressPercent}>70%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '70%' }]} />
                        </View>
                    </LinearGradient>

                    {/* Action Buttons */}
                    <View style={styles.actionGrid}>
                        <TouchableOpacity style={styles.actionBtnPrimary}>
                            <Text style={styles.actionIconPrimary}>📷</Text>
                            <Text style={styles.actionTextPrimary}>Scan QR Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtnSecondary}>
                            <Text style={styles.actionIconSecondary}>💳</Text>
                            <Text style={styles.actionTextSecondary}>Record Payment</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Collections List */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Today's Collections</Text>
                            <TouchableOpacity>
                                <Text style={styles.viewAllBtn}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.collectionsList}>
                            {collections.map((item) => (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.collectionItem,
                                        item.isPaid && styles.collectionItemPaid,
                                    ]}
                                >
                                    <View style={styles.collectionLeft}>
                                        <View style={styles.collectionAvatarContainer}>
                                            <View style={[styles.collectionAvatar, item.isPaid && styles.avatarGrayscale]} />
                                            <View style={[styles.collectionStatusDot, { backgroundColor: item.statusDot }]} />
                                        </View>
                                        <View>
                                            <Text style={[styles.collectionName, item.isPaid && styles.collectionNamePaid]}>
                                                {item.name}
                                            </Text>
                                            <Text style={styles.collectionMeta}>
                                                {item.isPaid ? item.time : `Due: ${item.amount}`}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.collectionRight}>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                item.statusColor === 'yellow' && styles.statusBadgeYellow,
                                                item.statusColor === 'green' && styles.statusBadgeGreen,
                                                item.statusColor === 'red' && styles.statusBadgeRed,
                                            ]}
                                        >
                                            <Text style={styles.statusIconText}>{item.statusIcon}</Text>
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    item.statusColor === 'yellow' && styles.statusTextYellow,
                                                    item.statusColor === 'green' && styles.statusTextGreen,
                                                    item.statusColor === 'red' && styles.statusTextRed,
                                                ]}
                                            >
                                                {item.status}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[
                                                styles.collectionAction,
                                                item.isPaid && styles.collectionAmountPaid,
                                                item.statusColor === 'red' && styles.collectionActionRed,
                                            ]}
                                        >
                                            {item.isPaid ? item.amount : item.time}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
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
    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 32,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        backgroundColor: '#101622',
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2b6cee',
        borderWidth: 2,
        borderColor: 'rgba(43, 108, 238, 0.2)',
    },
    headerText: {
        flex: 1,
    },
    roleLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b',
        letterSpacing: 1,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.3,
    },
    notificationBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    bellIcon: {
        fontSize: 20,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: '#101622',
    },
    scrollContent: {
        paddingBottom: 24,
    },
    /* Stats */
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1b232e',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
        gap: 8,
    },
    statCardHighlight: {
        position: 'relative',
        overflow: 'hidden',
    },
    statWatermark: {
        position: 'absolute',
        right: 0,
        top: 0,
        padding: 16,
        opacity: 0.1,
    },
    watermarkIcon: {
        fontSize: 64,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statIcon: {
        fontSize: 16,
        color: '#2b6cee',
    },
    statIconGreen: {
        fontSize: 16,
        color: '#22c55e',
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    /* Progress */
    progressCard: {
        marginHorizontal: 16,
        marginTop: 24,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
        gap: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 24,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    progressSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
    },
    progressPercent: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2b6cee',
    },
    progressBarBg: {
        width: '100%',
        height: 12,
        backgroundColor: '#374151',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2b6cee',
        borderRadius: 6,
    },
    /* Actions */
    actionGrid: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 16,
        marginTop: 24,
    },
    actionBtnPrimary: {
        flex: 1,
        height: 96,
        backgroundColor: '#2b6cee',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIconPrimary: {
        fontSize: 24,
    },
    actionTextPrimary: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    actionBtnSecondary: {
        flex: 1,
        height: 96,
        backgroundColor: '#1b232e',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(43, 108, 238, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    actionIconSecondary: {
        fontSize: 24,
    },
    actionTextSecondary: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2b6cee',
    },
    /* Section */
    section: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    viewAllBtn: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2b6cee',
    },
    /* Collections */
    collectionsList: {
        gap: 12,
    },
    collectionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1b232e',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    collectionItemPaid: {
        opacity: 0.8,
    },
    collectionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    collectionAvatarContainer: {
        position: 'relative',
    },
    collectionAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#374151',
    },
    avatarGrayscale: {
        opacity: 0.7,
    },
    collectionStatusDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#1b232e',
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 2,
    },
    collectionNamePaid: {
        fontWeight: '500',
    },
    collectionMeta: {
        fontSize: 14,
        color: '#64748b',
    },
    collectionRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        borderWidth: 1,
    },
    statusBadgeYellow: {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderColor: 'rgba(234, 179, 8, 0.2)',
    },
    statusBadgeGreen: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    statusBadgeRed: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    statusIconText: {
        fontSize: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statusTextYellow: {
        color: '#eab308',
    },
    statusTextGreen: {
        color: '#22c55e',
    },
    statusTextRed: {
        color: '#ef4444',
    },
    collectionAction: {
        fontSize: 12,
        color: '#64748b',
    },
    collectionAmountPaid: {
        fontSize: 12,
        fontWeight: '700',
        color: '#ffffff',
    },
    collectionActionRed: {
        fontSize: 12,
        fontWeight: '500',
        color: '#f87171',
    },
});
