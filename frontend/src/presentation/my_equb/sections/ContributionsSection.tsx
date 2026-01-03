import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlobalRole } from '../../../core/constants/enums';
import { ApiClient } from '../../services/api_client';

interface ContributionsSectionProps {
    role: GlobalRole;
    equbId: string;
    equbName: string;
    equbStatus: string;
    onViewAll?: () => void;
}

export const ContributionsSection: React.FC<ContributionsSectionProps> = ({ role, equbId, equbName, equbStatus, onViewAll }) => {
    const navigation = useNavigation<any>();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await ApiClient.get(`/equbs/${equbId}/contributions`);
                setHistory(data as any[]);
            } catch (error) {
                console.error('[ContributionsSection] Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [equbId]);

    const isMember = role === GlobalRole.MEMBER;
    const title = isMember ? 'Your Contributions' : 'Recent Contributions';

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#2b6cee" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {history.length > 0 && (
                    <TouchableOpacity onPress={onViewAll}>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.card}>
                {history.length === 0 ? (
                    <Text style={styles.emptyText}>No contributions found yet.</Text>
                ) : (
                    history.slice(0, 5).map((item, index) => (
                        <View key={item.id}>
                            <View style={styles.row}>
                                <View style={styles.rowLeft}>
                                    <View style={styles.iconBox}>
                                        <Text style={styles.icon}>💰</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.amount}>{item.amount.toLocaleString()} ETB</Text>
                                        <View style={styles.metaRow}>
                                            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                                            <Text style={styles.dot}>•</Text>
                                            <Text style={styles.method}>Round {item.roundNumber}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.statusBadge, { borderColor: item.status === 'CONFIRMED' ? '#4ade8044' : '#f59e0b44' }]}>
                                    <Text style={[styles.statusText, { color: item.status === 'CONFIRMED' ? '#4ade80' : '#f59e0b' }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                            {index < history.length - 1 && index < 4 && <View style={styles.divider} />}
                        </View>
                    ))
                )}

                {isMember && equbStatus === 'ACTIVE' && (
                    <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => navigation.navigate('MemberContribution', { equbId, equbName })}
                    >
                        <Text style={styles.payBtnText}>Make Contribution</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    viewAllText: {
        fontSize: 14,
        color: '#2b6cee',
        fontWeight: '600',
    },
    card: {
        backgroundColor: '#1c2333',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 18,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
    dot: {
        fontSize: 12,
        color: '#4b5563',
    },
    method: {
        fontSize: 12,
        color: '#9ca3af',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#2d3748',
        marginVertical: 4,
    },
    payBtn: {
        marginTop: 16,
        backgroundColor: '#2b6cee',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    payBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
        paddingVertical: 20,
        fontSize: 14,
    },
});
