import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { SystemHealthDto, SystemVersionDto } from '../../domain/dtos';
import { OPS_THEME } from '../../core/theme/ops_theme';

/**
 * PANEL 1: SYSTEM HEALTH DASHBOARD
 * Design Philosophy:
 * - The Global Heartbeat
 * - "Truth-First"
 */

export const SystemHealthScreen: React.FC = ({ navigation }: any) => {
    const [health, setHealth] = useState<SystemHealthDto | null>(null);
    const [version, setVersion] = useState<SystemVersionDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [healthData, versionData] = await Promise.all([
                ApiClient.get<SystemHealthDto>('/system/financial-health'),
                ApiClient.get<SystemVersionDto>('/system/version'),
            ]);
            setHealth(healthData);
            setVersion(versionData);
        } catch (error) {
            console.error('[SystemHealth] Fetch Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerParams}>
                    <ActivityIndicator size="large" color={OPS_THEME.colors.status.info} />
                    <Text style={styles.loadingText}>VERIFYING SYSTEM INTEGRITY...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isSystemDegraded = version?.isDegraded || health?.isDegraded;
    const statusColor = isSystemDegraded ? OPS_THEME.colors.status.critical : OPS_THEME.colors.status.success;
    const statusText = isSystemDegraded ? 'SYSTEM DEGRADED' : 'SYSTEM OPERATIONAL';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={OPS_THEME.colors.status.info} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>SYSTEM HEALTH</Text>
                        <Text style={styles.subtitle}>REAL-TIME OPERATIONAL METRICS</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isSystemDegraded ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }]}>
                        <View style={[styles.pulse, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{isSystemDegraded ? 'DEGRADED' : 'ONLINE'}</Text>
                    </View>
                </View>

                {/* Critical Status Banner */}
                {isSystemDegraded && (
                    <View style={styles.warningBanner}>
                        <Text style={styles.warningIcon}>⚠️</Text>
                        <View style={styles.warningContent}>
                            <Text style={styles.warningTitle}>CRITICAL SYSTEM WARNING</Text>
                            <Text style={styles.warningMessage}>
                                Integrity check failed. All financial mutations are strictly disabled until resolution.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Main Status Display */}
                <View style={[styles.card, { borderColor: statusColor }]}>
                    <Text style={styles.cardHeader}>SYSTEM STATUS TRUTH</Text>
                    <View style={styles.statusDisplay}>
                        <Text style={[styles.bigStatus, { color: statusColor }]}>{statusText}</Text>
                        <Text style={styles.lastCheck}>
                            LAST INTEGRITY CHECK: {health ? new Date(health.lastIntegrityCheckTimestamp).toLocaleTimeString() : '--'}
                        </Text>
                    </View>
                </View>

                {/* Version & Build Info */}
                <View style={styles.grid}>
                    <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.statLabel}>VERSION</Text>
                        <Text style={styles.statValue}>{version?.version || 'Unknown'}</Text>
                        <Text style={styles.statSub}>BUILD: {version?.commit?.substring(0, 7) || '---'}</Text>
                    </View>
                    <View style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.statLabel}>DISCREPANCIES</Text>
                        <Text style={[styles.statValue, { color: (health?.discrepancyCount || 0) > 0 ? OPS_THEME.colors.status.critical : OPS_THEME.colors.status.success }]}>
                            {health?.discrepancyCount || 0}
                        </Text>
                        <Text style={styles.statSub}>VIOLATIONS FOUND</Text>
                    </View>
                </View>

                {/* Financial Health Core Metrics */}
                <View style={[styles.card, { borderColor: OPS_THEME.colors.border.subtle }]}>
                    <Text style={styles.cardHeader}>FINANCIAL THROUGHPUT</Text>
                    <View style={styles.row}>
                        <StatItem
                            label="TOTAL VOLUME"
                            value={new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(health?.totalVolumeProcessed || 0)}
                            highlight
                        />
                        <StatItem
                            label="TOTAL PAYOUTS"
                            value={(health?.totalPayoutsExecuted || 0).toString()}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <StatItem
                            label="CONTRIBUTIONS"
                            value={new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(health?.totalContributionsReceived || 0)}
                        />
                        <StatItem
                            label="ROUNDS"
                            value={(health?.totalRoundsCompleted || 0).toString()}
                        />
                    </View>
                </View>

                {/* System Admin Actions */}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('SystemVerification')}
                >
                    <Text style={[styles.actionButtonText, { color: OPS_THEME.colors.text.primary }]}>OPEN CONTROL CONSOLE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { marginTop: 12, backgroundColor: OPS_THEME.colors.bg.app }]}
                    onPress={() => navigation.navigate('AuditTimeline', { equbId: 'GLOBAL' })}
                >
                    <Text style={[styles.actionButtonText, { color: OPS_THEME.colors.status.info }]}>VIEW GLOBAL AUDIT TIMELINE</Text>
                </TouchableOpacity>

                {/* Debug Info / Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        SERVER TIME: {new Date().toISOString()}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const StatItem = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <View style={styles.statItem}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValueSmall, highlight && { color: OPS_THEME.colors.status.success }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: OPS_THEME.colors.bg.app,
    },
    container: {
        padding: OPS_THEME.layout.screenPadding,
        paddingBottom: 40,
    },
    centerParams: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: OPS_THEME.colors.text.secondary,
        marginTop: 16,
        fontSize: OPS_THEME.typography.size.sm,
        letterSpacing: OPS_THEME.typography.spacing.loose,
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    title: {
        fontSize: OPS_THEME.typography.size.xl,
        fontWeight: OPS_THEME.typography.weight.black as any,
        color: OPS_THEME.colors.text.primary,
        letterSpacing: OPS_THEME.typography.spacing.wide,
    },
    subtitle: {
        fontSize: OPS_THEME.typography.size.xs,
        color: OPS_THEME.colors.text.tertiary,
        marginTop: 4,
        letterSpacing: OPS_THEME.typography.spacing.loose,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
    },
    pulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: OPS_THEME.typography.size.sm,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    warningBanner: {
        flexDirection: 'row',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 16,
        borderRadius: OPS_THEME.layout.borderRadius,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.critical,
        alignItems: 'center',
    },
    warningIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    warningContent: {
        flex: 1,
    },
    warningTitle: {
        color: OPS_THEME.colors.status.critical,
        fontWeight: 'bold',
        fontSize: OPS_THEME.typography.size.sm,
        marginBottom: 2,
    },
    warningMessage: {
        color: OPS_THEME.colors.text.secondary,
        fontSize: OPS_THEME.typography.size.sm,
        lineHeight: 18,
    },
    card: {
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderRadius: OPS_THEME.layout.borderRadius,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        // No shadow logic in theme generally, keep flat or simple border
    },
    cardHeader: {
        fontSize: OPS_THEME.typography.size.xs,
        fontWeight: '600',
        color: OPS_THEME.colors.text.secondary,
        letterSpacing: OPS_THEME.typography.spacing.loose,
        marginBottom: 16,
    },
    statusDisplay: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    bigStatus: {
        fontSize: OPS_THEME.typography.size.xxl,
        fontWeight: OPS_THEME.typography.weight.black as any,
        letterSpacing: 1,
        marginBottom: 8,
    },
    lastCheck: {
        fontSize: OPS_THEME.typography.size.sm,
        color: OPS_THEME.colors.text.tertiary,
        fontFamily: 'monospace',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderRadius: OPS_THEME.layout.borderRadius,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
    },
    statLabel: {
        fontSize: OPS_THEME.typography.size.xs,
        color: OPS_THEME.colors.text.tertiary,
        marginBottom: 4,
        fontWeight: '500',
        letterSpacing: OPS_THEME.typography.spacing.loose,
    },
    statValue: {
        fontSize: OPS_THEME.typography.size.xl,
        fontWeight: 'bold',
        color: OPS_THEME.colors.text.primary,
        fontFamily: 'monospace',
    },
    statSub: {
        fontSize: 10,
        color: OPS_THEME.colors.text.tertiary,
        marginTop: 2,
    },
    statValueSmall: {
        fontSize: OPS_THEME.typography.size.lg,
        fontWeight: 'bold',
        color: OPS_THEME.colors.text.primary,
        fontFamily: 'monospace',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        paddingVertical: 8,
    },
    divider: {
        height: 1,
        backgroundColor: OPS_THEME.colors.border.subtle,
        marginVertical: 12,
    },
    actionButton: {
        backgroundColor: OPS_THEME.colors.bg.highlight,
        padding: 16,
        borderRadius: OPS_THEME.layout.borderRadius,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
    },
    actionButtonText: {
        color: OPS_THEME.colors.text.primary,
        fontWeight: '600',
        fontSize: OPS_THEME.typography.size.sm,
        letterSpacing: 1,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        color: OPS_THEME.colors.text.tertiary,
        fontSize: 10,
        fontFamily: 'monospace',
    }
});
