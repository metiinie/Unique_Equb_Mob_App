import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeHeader } from '../components/HomeHeader';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';

export const CollectorHomeView = ({ navigation }: { navigation: any }) => {
    const { user } = useAuth();
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await ApiClient.get('/reports/collector/summary');
                setSummary(data);
            } catch (error) {
                console.error('[CollectorHomeView] Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading || !user) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator color={Theme.colors.primary} />
        </View>
    );

    const assignedEqubs = summary?.assignedEqubs || [];
    const totalTarget = summary?.totalTarget || 0;
    const totalCollected = summary?.totalCollected || 0;
    const progressPercent = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <HomeHeader
                userName={user.fullName}
                greeting=""
                roleLabel="COLLECTOR"
                onNotificationPress={() => navigation.navigate('NotificationCenter')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <Text style={styles.statIcon}>🎯</Text>
                            <Text style={styles.statLabel}>Target</Text>
                        </View>
                        <Text style={styles.statValue}>{totalTarget.toLocaleString()} ETB</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardHighlight]}>
                        <View style={styles.statWatermark}>
                            <Text style={styles.watermarkIcon}>💳</Text>
                        </View>
                        <View style={styles.statHeader}>
                            <Text style={styles.statIconGreen}>✓</Text>
                            <Text style={styles.statLabel}>Collected</Text>
                        </View>
                        <Text style={styles.statValue}>{totalCollected.toLocaleString()} ETB</Text>
                    </View>
                </View>

                {/* Progress Card */}
                <LinearGradient
                    colors={['#1b232e', '#161b24']}
                    style={styles.progressCard}
                >
                    <View style={styles.progressHeader}>
                        <View>
                            <Text style={styles.progressTitle}>Collection Progress</Text>
                            <Text style={styles.progressSubtitle}>
                                {(totalTarget - totalCollected).toLocaleString()} ETB remaining
                            </Text>
                        </View>
                        <Text style={styles.progressPercent}>{progressPercent}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
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

                <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#1c2333',
                            padding: 16,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: '#2d3748'
                        }}
                        onPress={() => navigation.navigate('AdvancedAnalytics')}
                    >
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(34, 197, 94, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                            <Text style={{ fontSize: 16 }}>📈</Text>
                        </View>
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#ffffff' }}>Advanced Analytics</Text>
                        <Text style={{ fontSize: 24, color: '#64748b' }}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Assigned Equbs List */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Assigned Equbs</Text>
                    </View>

                    <View style={styles.collectionsList}>
                        {assignedEqubs.length === 0 ? (
                            <Text style={styles.emptyText}>No Equbs assigned for collection.</Text>
                        ) : (
                            assignedEqubs.map((equb: any) => (
                                <TouchableOpacity
                                    key={equb.id}
                                    style={styles.collectionItem}
                                    onPress={() => navigation.navigate('RoundManagement', { equbId: equb.id })}
                                >
                                    <View style={styles.collectionLeft}>
                                        <View style={styles.collectionAvatarContainer}>
                                            <View style={styles.collectionAvatar}>
                                                <Text style={styles.avatarText}>{equb.name.charAt(0)}</Text>
                                            </View>
                                        </View>
                                        <View>
                                            <Text style={styles.collectionName}>{equb.name}</Text>
                                            <Text style={styles.collectionMeta}>
                                                {equb.amount.toLocaleString()} ETB • {equb.frequency}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.collectionRight}>
                                        <Text style={styles.collectionAction}>
                                            {equb._count?.memberships || 0} Members
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#101622' },
    loadingContainer: { flex: 1, backgroundColor: '#101622', justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 24 },
    /* Stats */
    statsGrid: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, paddingTop: 24 },
    statCard: {
        flex: 1,
        backgroundColor: '#1b232e',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
        gap: 8,
    },
    statCardHighlight: { position: 'relative', overflow: 'hidden' },
    statWatermark: { position: 'absolute', right: 0, top: 0, padding: 16, opacity: 0.1 },
    watermarkIcon: { fontSize: 64 },
    statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statIcon: { fontSize: 16, color: '#2b6cee' },
    statIconGreen: { fontSize: 16, color: '#22c55e' },
    statLabel: { fontSize: 14, fontWeight: '500', color: '#64748b' },
    statValue: { fontSize: 20, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
    /* Progress */
    progressCard: { marginHorizontal: 16, marginTop: 24, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b', gap: 12 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 },
    progressTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
    progressSubtitle: { fontSize: 12, color: '#94a3b8' },
    progressPercent: { fontSize: 24, fontWeight: '700', color: '#2b6cee' },
    progressBarBg: { width: '100%', height: 12, backgroundColor: '#374151', borderRadius: 6, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#2b6cee', borderRadius: 6 },
    /* Actions */
    actionGrid: { flexDirection: 'row', gap: 16, paddingHorizontal: 16, marginTop: 24 },
    actionBtnPrimary: {
        flex: 1, height: 96, backgroundColor: '#2b6cee', borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8,
        shadowColor: '#2b6cee', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    actionIconPrimary: { fontSize: 24 },
    actionTextPrimary: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
    actionBtnSecondary: {
        flex: 1, height: 96, backgroundColor: '#1b232e', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(43, 108, 238, 0.3)',
        justifyContent: 'center', alignItems: 'center', gap: 8,
    },
    actionIconSecondary: { fontSize: 24 },
    actionTextSecondary: { fontSize: 14, fontWeight: '700', color: '#2b6cee' },
    /* Section */
    section: { paddingHorizontal: 16, marginTop: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
    collectionsList: { gap: 12 },
    collectionItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#1b232e', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b',
    },
    collectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    collectionAvatarContainer: { position: 'relative' },
    collectionAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
    collectionName: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
    collectionMeta: { fontSize: 14, color: '#64748b' },
    collectionRight: { alignItems: 'flex-end', gap: 4 },
    collectionAction: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    emptyText: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
});
