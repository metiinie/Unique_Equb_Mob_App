import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useProfileHandler } from './useProfileHandler';
import { ApiClient } from '../services/api_client';
import { ManagedSummaryDto } from '../../domain/dtos';
import { useNavigation } from '@react-navigation/native';

interface AdminProfileSectionProps { }

export const AdminProfileSection: React.FC<AdminProfileSectionProps> = () => {
    const { handleAction } = useProfileHandler();
    const navigation = useNavigation<any>();
    const [summary, setSummary] = useState<ManagedSummaryDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const summaryData = await ApiClient.get<any>('/equbs/managed/summary');
                setSummary(summaryData);
                setError(null);
            } catch (err: any) {
                console.error('[AdminProfileSection] Fetch failed:', err);
                setError('Failed to load summary');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    return (
        <View style={styles.container}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <View style={[styles.statIconCircle, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
                            <Text style={styles.statIconText}>💰</Text>
                        </View>
                        <Text style={styles.statLabel}>TOTAL VOLUME</Text>
                    </View>
                    <View style={styles.statValueRow}>
                        <Text style={styles.statValue}>
                            {summary ? (summary.totalVolume >= 1000000 ? `${(summary.totalVolume / 1000000).toFixed(1)}M` : (summary.totalVolume / 1000).toFixed(0) + 'K') : '0'}
                        </Text>
                        <Text style={styles.statUnit}>ETB</Text>
                    </View>
                </View>

                <View style={[styles.statCard, { marginLeft: 12 }]}>
                    <View style={styles.statHeader}>
                        <View style={[styles.statIconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                            <Text style={styles.statIconText}>👥</Text>
                        </View>
                        <Text style={styles.statLabel}>MEMBERS</Text>
                    </View>
                    <View style={styles.statValueRow}>
                        <Text style={styles.statValue}>{summary?.totalMembers || 0}</Text>
                        <Text style={styles.statUnit}>Active</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions Header */}
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitleText}>Quick Actions</Text>
            </View>

            {/* Circular Actions Row */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.circularAction} onPress={() => handleAction('NEW_EQUB')}>
                    <View style={[styles.circleIcon, { backgroundColor: '#3b82f6' }]}>
                        <Text style={styles.circleIconText}>+</Text>
                    </View>
                    <Text style={styles.actionLabel}>New Equb</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.circularAction} onPress={() => handleAction('REQUESTS')}>
                    <View style={styles.circleIconOutline}>
                        <Text style={styles.circleIconEmoji}>👥</Text>
                        <View style={styles.notificationDot} />
                    </View>
                    <Text style={styles.actionLabel}>Requests</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.circularAction} onPress={() => handleAction('REPORTS')}>
                    <View style={styles.circleIconOutline}>
                        <Text style={styles.circleIconEmoji}>📊</Text>
                    </View>
                    <Text style={styles.actionLabel}>Reports</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.circularAction} onPress={() => handleAction('ARCHIVE')}>
                    <View style={styles.circleIconOutline}>
                        <Text style={styles.circleIconEmoji}>📂</Text>
                    </View>
                    <Text style={styles.actionLabel}>Archive</Text>
                </TouchableOpacity>
            </View>

            {/* Management Section */}
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitleText}>Management</Text>
            </View>

            <TouchableOpacity
                style={styles.managementCard}
                onPress={() => navigation.navigate('My Equb')}
            >
                <View style={styles.managementInfo}>
                    <View style={styles.managementIconBox}>
                        <Text style={styles.managementIconEmoji}>🐷</Text>
                    </View>
                    <View>
                        <Text style={styles.managementTitle}>Managed Equbs</Text>
                        <Text style={styles.managementSubtitle}>View active rounds & details</Text>
                    </View>
                </View>
                <Text style={styles.managementChevron}>›</Text>
            </TouchableOpacity>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator color="#3b82f6" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    /* Stats */
    statsGrid: {
        flexDirection: 'row',
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#161d2a',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    statIconText: {
        fontSize: 14,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748b',
        letterSpacing: 0.5,
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#ffffff',
        marginRight: 4,
    },
    statUnit: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    /* Quick Actions */
    headerRow: {
        marginBottom: 16,
    },
    sectionTitleText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    circularAction: {
        alignItems: 'center',
        width: '22%',
    },
    circleIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    circleIconOutline: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#161d2a',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    circleIconText: {
        fontSize: 28,
        color: '#ffffff',
        fontWeight: '300',
    },
    circleIconEmoji: {
        fontSize: 24,
    },
    actionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94a3b8',
    },
    notificationDot: {
        position: 'absolute',
        top: 0,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    /* Management */
    managementCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#161d2a',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    managementInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    managementIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    managementIconEmoji: {
        fontSize: 20,
    },
    managementTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 2,
    },
    managementSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
    },
    managementChevron: {
        fontSize: 24,
        color: '#334155',
        fontWeight: '300',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 15, 24, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
    },
});
