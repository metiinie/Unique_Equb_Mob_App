import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useProfileHandler } from './useProfileHandler';
import { ApiClient } from '../services/api_client';
import { EqubDto, PayoutDto } from '../../domain/dtos';

interface MemberProfileSectionProps { }

export const MemberProfileSection: React.FC<MemberProfileSectionProps> = () => {
    const { handleAction } = useProfileHandler();
    const [activeEqubs, setActiveEqubs] = useState<EqubDto[]>([]);
    const [pastPayouts, setPastPayouts] = useState<(PayoutDto & { equb?: { name: string } })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [equbsData, payoutsData] = await Promise.all([
                    ApiClient.get<EqubDto[]>('/equbs'),
                    ApiClient.get<(PayoutDto & { equb?: { name: string } })[]>('/equbs/payouts/me')
                ]);
                setActiveEqubs(equbsData);
                setPastPayouts(payoutsData || []);
                setError(null);
            } catch (err: any) {
                console.error('[MemberProfileSection] Fetch failed:', err);
                setError('Failed to load your equb activity');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const mapStatus = (status: string) => {
        switch (status) {
            case 'ACTIVE': return { label: 'Active', bg: 'emerald' };
            case 'DRAFT': return { label: 'Draft', bg: 'amber' };
            case 'ON_HOLD': return { label: 'On Hold', bg: 'amber' };
            case 'COMPLETED': return { label: 'Won', bg: 'emerald' };
            default: return { label: status, bg: 'amber' };
        }
    };

    return (
        <>
            {/* Active Equbs Section */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Equbs</Text>
                    <TouchableOpacity onPress={() => handleAction('VIEW_HISTORY')}>
                        <Text style={styles.viewHistoryText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colHeader, { flex: 2, paddingLeft: 4 }]}>EQUB / AMOUNT</Text>
                        <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>ROUND</Text>
                        <Text style={[styles.colHeader, { flex: 1, textAlign: 'right', paddingRight: 4 }]}>STATUS</Text>
                    </View>

                    {loading ? (
                        <View style={styles.centerContent}>
                            <ActivityIndicator size="small" color="#2b6cee" />
                            <Text style={styles.infoText}>Loading your equbs...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.centerContent}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : activeEqubs.length === 0 ? (
                        <View style={styles.centerContent}>
                            <Text style={styles.emptyText}>No active equbs found.</Text>
                        </View>
                    ) : (
                        activeEqubs.map((item, index) => {
                            const { label, bg } = mapStatus(item.status);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.tableRow, index !== activeEqubs.length - 1 && styles.borderBottom]}
                                    onPress={() => handleAction('EQUB_DETAILS', { equbId: item.id })}
                                >
                                    <View style={{ flex: 2 }}>
                                        <Text style={styles.equbName}>{item.name}</Text>
                                        <Text style={styles.equbAmount}>{item.amount.toLocaleString()} {item.currency}</Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={styles.posText}>{item.currentRound}<Text style={styles.posTotal}>/{item.totalRounds}</Text></Text>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <View style={[
                                            styles.statusBadge,
                                            bg === 'emerald' ? styles.statusEmerald : styles.statusAmber
                                        ]}>
                                            <View style={[
                                                styles.statusDot,
                                                bg === 'emerald' ? styles.dotEmerald : styles.dotAmber
                                            ]} />
                                            <Text style={[
                                                styles.statusText,
                                                bg === 'emerald' ? styles.textEmerald : styles.textAmber
                                            ]}>
                                                {label}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </View>

            {/* Past Payouts Section */}
            <View style={[styles.sectionContainer, { marginTop: 24 }]}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Past Payouts</Text>
                </View>

                <View style={styles.cardContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colHeader, { flex: 1, paddingLeft: 4 }]}>DATE</Text>
                        <Text style={[styles.colHeader, { flex: 2 }]}>EQUB NAME</Text>
                        <Text style={[styles.colHeader, { flex: 1.5, textAlign: 'right', paddingRight: 4 }]}>AMOUNT</Text>
                    </View>

                    {loading ? (
                        <View style={styles.centerContent}>
                            <Text style={styles.infoText}>Loading payouts...</Text>
                        </View>
                    ) : pastPayouts.length === 0 ? (
                        <View style={styles.centerContent}>
                            <Text style={styles.emptyText}>No payouts received yet.</Text>
                        </View>
                    ) : (
                        pastPayouts.map((item, index) => {
                            const dateObj = new Date(item.executedAt || item.createdAt);
                            const month = dateObj.toLocaleString('default', { month: 'short' });
                            const day = dateObj.getDate();
                            const year = dateObj.getFullYear();

                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.tableRow, index !== pastPayouts.length - 1 && styles.borderBottom]}
                                    onPress={() => handleAction('EQUB_DETAILS', { equbId: item.equbId })}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.equbName}>{month} {day}</Text>
                                        <Text style={styles.equbAmount}>{year}</Text>
                                    </View>
                                    <View style={{ flex: 2, justifyContent: 'center' }}>
                                        <Text style={styles.payoutName} numberOfLines={1}>{item.equb?.name || 'Unknown Equb'}</Text>
                                    </View>
                                    <View style={{ flex: 1.5, alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <Text style={styles.payoutAmount}>{item.amount.toLocaleString()} ETB</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

                <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() => handleAction('JOIN_EQUB')}
                >
                    <Text style={styles.joinIcon}>+</Text>
                    <Text style={styles.joinText}>Join New Equb</Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        paddingHorizontal: 16,
        maxWidth: 500,
        alignSelf: 'center',
        width: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    viewHistoryText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2b6cee',
    },
    cardContainer: {
        backgroundColor: '#1c2333',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2d3748',
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2d3748',
    },
    colHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(45, 55, 72, 0.5)',
    },
    equbName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 2,
    },
    equbAmount: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94a3b8',
    },
    posText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#cbd5e1',
    },
    posTotal: {
        fontSize: 12,
        fontWeight: '400',
        color: '#94a3b8',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusEmerald: {
        backgroundColor: 'rgba(6, 78, 59, 0.2)',
        borderColor: 'rgba(6, 95, 70, 1)',
    },
    statusAmber: {
        backgroundColor: 'rgba(120, 53, 15, 0.2)',
        borderColor: 'rgba(146, 64, 14, 1)',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    dotEmerald: { backgroundColor: '#10b981' },
    dotAmber: { backgroundColor: '#f59e0b' },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    textEmerald: { color: '#34d399' },
    textAmber: { color: '#fbbf24' },
    payoutName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#cbd5e1',
    },
    payoutAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#34d399',
    },
    joinBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
    },
    joinIcon: {
        fontSize: 18,
        color: '#94a3b8',
    },
    joinText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94a3b8',
    },
    centerContent: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        color: '#94a3b8',
        marginTop: 8,
        fontSize: 14,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
    },
    emptyText: {
        color: '#64748b',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
