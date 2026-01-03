import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { ManagedEqubDto } from '../../domain/dtos';
import { EqubStatus } from '../../core/constants/enums';
import { OPS_THEME } from '../../core/theme/ops_theme';

/**
 * PANEL 2: MANAGED EQUBS (Control View)
 */

export const ManagedEqubsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [equbs, setEqubs] = useState<ManagedEqubDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchManagedEqubs = async () => {
        try {
            setError(null);
            const data = await ApiClient.get<ManagedEqubDto[]>('/equbs/managed');
            setEqubs(data);
        } catch (err: any) {
            console.error('[ManagedEqubs] Fetch Error:', err);
            setError('Failed to load managed Equbs. System check required.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchManagedEqubs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchManagedEqubs();
    };

    // STRICT NAVIGATION: Only go to Detail with ID.
    const handleViewEqub = (equbId: string) => {
        navigation.navigate('EqubDetail', { equbId });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerParams}>
                    <ActivityIndicator size="large" color={OPS_THEME.colors.status.info} />
                </View>
            </SafeAreaView>
        );
    }

    // ERROR STATE: Link back to Health
    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerParams}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <TouchableOpacity
                        style={styles.healthLinkBtn}
                        onPress={() => navigation.navigate('SystemHealth')}
                    >
                        <Text style={styles.healthLinkText}>Check System Health</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={OPS_THEME.colors.status.info} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.title}>MANAGED EQUBS</Text>
                    <Text style={styles.subtitle}>CONTROL ACCESS VIEW</Text>
                </View>

                {equbs.length === 0 ? (
                    // EMPTY STATE
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📂</Text>
                        <Text style={styles.emptyTitle}>No Managed Equbs</Text>
                        <Text style={styles.emptyDesc}>You do not currently manage any Equbs.</Text>
                    </View>
                ) : (
                    // LIST: Display State Only
                    <View style={styles.list}>
                        {equbs.map((equb) => (
                            <TouchableOpacity
                                key={equb.id}
                                style={styles.card}
                                onPress={() => handleViewEqub(equb.id)}
                            >
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.equbName}>{equb.name}</Text>
                                        <Text style={styles.equbId}>ID: {equb.id.substring(0, 8)}...</Text>
                                    </View>
                                    <StatusBadge status={equb.status} />
                                </View>

                                <View style={styles.cardMetrics}>
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>ROUND</Text>
                                        <Text style={styles.metricValue}>{equb.currentRound} / {equb.totalRounds}</Text>
                                    </View>
                                    <View style={styles.dividerVertical} />
                                    <View style={styles.metricItem}>
                                        <Text style={styles.metricLabel}>MEMBERS</Text>
                                        <Text style={styles.metricValue}>{equb._count?.memberships || 0}</Text>
                                    </View>
                                    <View style={styles.dividerVertical} />
                                    <View style={styles.metricAction}>
                                        <Text style={styles.actionText}>VIEW ›</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const StatusBadge = ({ status }: { status: EqubStatus }) => {
    let color = OPS_THEME.colors.text.secondary;
    let bg = OPS_THEME.colors.bg.highlight;

    if (status === EqubStatus.ACTIVE) {
        color = OPS_THEME.colors.status.success;
        bg = 'rgba(16, 185, 129, 0.1)';
    } else if (status === EqubStatus.COMPLETED) {
        color = OPS_THEME.colors.status.info;
        bg = 'rgba(59, 130, 246, 0.1)';
    } else if (status === EqubStatus.ON_HOLD) {
        color = OPS_THEME.colors.status.warning;
        bg = 'rgba(245, 158, 11, 0.1)';
    }

    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Text style={[styles.badgeText, { color }]}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: OPS_THEME.colors.bg.app },
    container: { padding: OPS_THEME.layout.screenPadding },
    centerParams: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: { marginBottom: 24 },
    title: { fontSize: OPS_THEME.typography.size.xl, fontWeight: OPS_THEME.typography.weight.black as any, color: OPS_THEME.colors.text.primary, letterSpacing: OPS_THEME.typography.spacing.wide },
    subtitle: { fontSize: OPS_THEME.typography.size.xs, color: OPS_THEME.colors.text.tertiary, marginTop: 4, letterSpacing: OPS_THEME.typography.spacing.loose },

    card: {
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderRadius: OPS_THEME.layout.borderRadius,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    equbName: { fontSize: OPS_THEME.typography.size.lg, fontWeight: 'bold', color: OPS_THEME.colors.text.primary },
    equbId: { fontSize: OPS_THEME.typography.size.xs, color: OPS_THEME.colors.text.tertiary, marginTop: 2, fontFamily: 'monospace' },

    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    cardMetrics: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: OPS_THEME.colors.bg.app,
        borderRadius: OPS_THEME.layout.borderRadius,
        padding: 12,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
    },
    metricItem: { flex: 1, alignItems: 'center' },
    metricLabel: { fontSize: 8, color: OPS_THEME.colors.text.tertiary, fontWeight: 'bold', marginBottom: 2 },
    metricValue: { fontSize: OPS_THEME.typography.size.sm, color: OPS_THEME.colors.text.primary, fontWeight: '700', fontFamily: 'monospace' },

    dividerVertical: { width: 1, height: 24, backgroundColor: OPS_THEME.colors.border.subtle, marginHorizontal: 8 },

    metricAction: { flex: 0.8, alignItems: 'center', justifyContent: 'center' },
    actionText: { fontSize: OPS_THEME.typography.size.xs, color: OPS_THEME.colors.status.info, fontWeight: 'bold' },

    emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.7 },
    emptyIcon: { fontSize: 40, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: OPS_THEME.colors.text.primary },
    emptyDesc: { fontSize: 14, color: OPS_THEME.colors.text.tertiary, marginTop: 8 },

    errorText: { color: OPS_THEME.colors.status.critical, fontSize: 16, marginBottom: 16 },
    healthLinkBtn: { padding: 12, backgroundColor: OPS_THEME.colors.bg.surface, borderRadius: 8, borderWidth: 1, borderColor: OPS_THEME.colors.border.subtle },
    healthLinkText: { color: OPS_THEME.colors.status.info, fontWeight: '600' },

    list: { paddingBottom: 40 }
});
