import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { AuditTimelineResponseDto, AuditTimelineEventDto } from '../../domain/dtos';
import { OPS_THEME } from '../../core/theme/ops_theme';

/**
 * PANEL 4: AUDIT & TIMELINE EXPLORER (Forensic View)
 */

export const AuditTimelineScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;

    const [timelineData, setTimelineData] = useState<AuditTimelineResponseDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTimeline = async () => {
        try {
            setError(null);
            const data = await ApiClient.get<AuditTimelineResponseDto>(`/audit-events/timeline/${equbId}`);
            setTimelineData(data);
        } catch (err: any) {
            console.error('[AuditTimeline] Error:', err);
            setError('Audit timeline unavailable. Causality cannot be established.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTimeline();
    }, [equbId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTimeline();
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

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.centerParams, { padding: 40 }]}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorTextLarge}>{error}</Text>
                    <Text style={styles.errorSub}>Ledger truth remains valid, but historical sequence is missing.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>FORENSIC TIMELINE</Text>
                <Text style={styles.headerSub}>IMMUTABLE RECORD OF EVENTS</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={OPS_THEME.colors.status.info} />
                }
            >
                <View style={styles.timelineContainer}>
                    {timelineData?.timeline.map((event, index) => (
                        <TimelineItem
                            key={event.id}
                            event={event}
                            isLast={index === (timelineData.timeline.length - 1)}
                        />
                    ))}

                    {timelineData?.timeline.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No events recorded for this Equb.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const TimelineItem = ({ event, isLast }: { event: AuditTimelineEventDto, isLast: boolean }) => {
    const isCritical = event.status === 'CRITICAL';
    const isWarning = event.status === 'WARNING';

    // Visual Texture for Severity
    let dotColor = OPS_THEME.colors.text.secondary; // Info/Default
    let borderColor = OPS_THEME.colors.border.subtle;

    if (isCritical) {
        dotColor = OPS_THEME.colors.status.critical;
        borderColor = OPS_THEME.colors.border.critical;
    } else if (isWarning) {
        dotColor = OPS_THEME.colors.status.warning;
        borderColor = 'rgba(245, 158, 11, 0.3)';
    }

    return (
        <View style={styles.timelineItem}>
            {/* Left Rail (Time + Line) */}
            <View style={styles.leftRail}>
                <Text style={styles.timestamp}>
                    {formatTime(event.timestamp)}
                </Text>
                <Text style={styles.date}>
                    {formatDate(event.timestamp)}
                </Text>
            </View>

            {/* Middle (Dot + Line) */}
            <View style={styles.timelineGraphic}>
                <View style={[styles.dot, { backgroundColor: dotColor, borderColor: isCritical ? dotColor : 'transparent', borderWidth: isCritical ? 2 : 0 }]} />
                {!isLast && <View style={styles.line} />}
            </View>

            {/* Right Rail (Content) */}
            <View style={[styles.contentCard, { borderColor: borderColor }]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.actionType}>{event.action}</Text>
                    {isCritical && <Text style={styles.criticalBadge}>CRITICAL</Text>}
                </View>

                <Text style={styles.description}>{event.description}</Text>

                <View style={styles.metaRow}>
                    <Text style={styles.actor}>Actor: {event.actor}</Text>
                </View>
            </View>
        </View>
    );
};

const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: OPS_THEME.colors.bg.app },
    centerParams: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { padding: OPS_THEME.layout.screenPadding, paddingBottom: 40 },

    header: { padding: 20, backgroundColor: OPS_THEME.colors.bg.surface, borderBottomWidth: 1, borderBottomColor: OPS_THEME.colors.border.subtle },
    headerTitle: { fontSize: OPS_THEME.typography.size.lg, fontWeight: OPS_THEME.typography.weight.black as any, color: OPS_THEME.colors.text.primary, letterSpacing: OPS_THEME.typography.spacing.wide },
    headerSub: { fontSize: OPS_THEME.typography.size.xs, color: OPS_THEME.colors.text.tertiary, letterSpacing: OPS_THEME.typography.spacing.loose },

    timelineContainer: { marginTop: 10 },
    timelineItem: { flexDirection: 'row', minHeight: 80 },

    leftRail: { width: 70, alignItems: 'flex-end', paddingRight: 10, paddingTop: 4 },
    timestamp: { fontSize: OPS_THEME.typography.size.sm, fontWeight: 'bold', color: OPS_THEME.colors.text.primary, fontFamily: 'monospace' },
    date: { fontSize: OPS_THEME.typography.size.xs, color: OPS_THEME.colors.text.tertiary },

    timelineGraphic: { width: 20, alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6, zIndex: 2 },
    line: { flex: 1, width: 2, backgroundColor: OPS_THEME.colors.border.subtle, marginVertical: -4 },

    contentCard: {
        flex: 1,
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderRadius: OPS_THEME.layout.borderRadius,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
    },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    actionType: { fontSize: OPS_THEME.typography.size.xs, fontWeight: 'bold', color: OPS_THEME.colors.text.secondary, letterSpacing: 0.5 },
    criticalBadge: {
        fontSize: 8,
        fontWeight: 'bold',
        color: OPS_THEME.colors.status.critical,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: 4,
        borderRadius: 2,
        overflow: 'hidden'
    },

    description: { fontSize: OPS_THEME.typography.size.base, color: OPS_THEME.colors.text.primary, marginBottom: 8, lineHeight: 20 },

    metaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.05)', paddingTop: 8 },
    actor: { fontSize: OPS_THEME.typography.size.xs, color: OPS_THEME.colors.text.tertiary, fontFamily: 'monospace' },

    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: OPS_THEME.colors.text.tertiary },

    errorIcon: { fontSize: 40, marginBottom: 16 },
    errorTextLarge: { fontSize: 16, fontWeight: 'bold', color: OPS_THEME.colors.status.critical, textAlign: 'center', marginBottom: 8 },
    errorSub: { fontSize: 12, color: OPS_THEME.colors.text.primary, textAlign: 'center', opacity: 0.8 }
});
