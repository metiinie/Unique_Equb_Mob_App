import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GlobalRole } from '../../../core/constants/enums';
import { ApiClient } from '../../services/api_client';

interface PayoutsSectionProps {
    role: GlobalRole;
    equbId: string;
    onPayoutAction?: (action: string) => void;
}

export const PayoutsSection: React.FC<PayoutsSectionProps> = ({ role, equbId, onPayoutAction }) => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                const data = await ApiClient.get(`/equbs/${equbId}/payouts`);
                setPayouts(data as any[]);
            } catch (error) {
                console.error('[PayoutsSection] Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayouts();
    }, [equbId]);

    const isAdmin = role === GlobalRole.ADMIN;
    const isMember = role === GlobalRole.MEMBER;

    // Find the latest pending payout or the most recent executed one
    const currentPayout = payouts.find(p => p.status === 'PENDING') || (payouts.length > 0 ? payouts[payouts.length - 1] : null);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#2b6cee" />
            </View>
        );
    }

    if (!currentPayout) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Payouts</Text>
                <View style={styles.card}>
                    <Text style={styles.emptyText}>No payout data available for this Equb.</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Payouts</Text>

            <View style={styles.card}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.label}>
                            {currentPayout.status === 'PENDING' ? 'Next Payout' : 'Latest Payout'}
                        </Text>
                        <Text style={styles.dateText}>
                            {currentPayout.status === 'PENDING' ? 'Scheduled' : new Date(currentPayout.executedAt || currentPayout.updatedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={styles.amountBadge}>
                        <Text style={styles.amountText}>{currentPayout.amount.toLocaleString()} ETB</Text>
                    </View>
                </View>

                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: currentPayout.status === 'PENDING' ? '#fbbf24' : '#22c55e' }]} />
                    <Text style={[styles.statusText, { color: currentPayout.status === 'PENDING' ? '#fbbf24' : '#22c55e' }]}>
                        Status: {currentPayout.status} • Round {currentPayout.roundNumber}
                    </Text>
                </View>

                {isAdmin && currentPayout.status === 'PENDING' && (
                    <View style={styles.adminActions}>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => onPayoutAction && onPayoutAction('execute')}
                        >
                            <Text style={styles.primaryBtnText}>Execute Payout</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isMember && currentPayout.status === 'PENDING' && (
                    <View style={styles.memberInfo}>
                        <Text style={styles.memberInfoText}>
                            You are part of the current cycle. Payouts are rotated according to the schedule.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    card: {
        backgroundColor: '#1c2333',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        color: '#9ca3af',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    dateText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    amountBadge: {
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(43, 108, 238, 0.2)',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#2b6cee',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        backgroundColor: '#111827',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    adminActions: {
        gap: 12,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#2d3748',
        paddingTop: 16,
    },
    primaryBtn: {
        backgroundColor: '#2b6cee',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    memberInfo: {
        marginTop: 8,
        padding: 12,
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.1)',
    },
    memberInfoText: {
        fontSize: 13,
        color: '#4ade80',
        textAlign: 'center',
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
        paddingVertical: 10,
        fontSize: 14,
    },
});
