import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EqubDto } from '../../../domain/dtos';
import { EqubStatus } from '../../../core/constants/enums';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

interface EqubGridCardProps {
    equb: EqubDto;
    onPress: () => void;
}

// Intentionally no financial data shown here.
// Financial truth belongs exclusively to ledger views.

const getStatusColor = (status: EqubStatus) => {
    switch (status) {
        case EqubStatus.ACTIVE:
            return { bg: '#064e3b', text: '#10b981' };
        case EqubStatus.DRAFT:
        case EqubStatus.ON_HOLD:
            return { bg: '#451a03', text: '#f59e0b' };
        case EqubStatus.COMPLETED:
            return { bg: '#1e3a8a', text: '#3b82f6' };
        case EqubStatus.TERMINATED:
            return { bg: '#450a0a', text: '#ef4444' };
        default:
            return { bg: '#1e293b', text: '#94a3b8' };
    }
};

const getProgressBarColor = (status: EqubStatus) => {
    if (status === EqubStatus.COMPLETED) return '#10b981';
    if (status === EqubStatus.TERMINATED) return '#ef4444';
    return '#3b82f6';
};

const getEqubIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('business') || n.includes('grp')) return <Ionicons name="people" size={18} color="#3b82f6" />;
    if (n.includes('family') || n.includes('savings')) return <MaterialIcons name="assignment" size={18} color="#f59e0b" />;
    if (n.includes('lunch') || n.includes('food')) return <Ionicons name="fast-food" size={18} color="#eb5e28" />;
    if (n.includes('travel') || n.includes('flight')) return <Ionicons name="airplane" size={18} color="#3b82f6" />;
    if (n.includes('car') || n.includes('auto')) return <Ionicons name="car" size={18} color="#f43f5e" />;
    if (n.includes('gift') || n.includes('wedding')) return <Ionicons name="gift" size={18} color="#a855f7" />;
    if (n.includes('phone') || n.includes('upgrade')) return <Ionicons name="phone-portrait" size={18} color="#94a3b8" />;
    return <MaterialCommunityIcons name="heart-multiple" size={18} color="#3b82f6" />;
};

export const EqubGridCard: React.FC<EqubGridCardProps> = ({ equb, onPress }) => {
    const { bg, text } = getStatusColor(equb.status);
    const progress = equb.totalRounds > 0 ? (equb.currentRound / equb.totalRounds) : 0;
    const percentage = Math.round(progress * 100);
    const roleLabel = equb.myRole || 'MEMBER';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    {getEqubIcon(equb.name)}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={[styles.statusText, { color: text }]}>{equb.status}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>{equb.name}</Text>
                <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>{roleLabel}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <Text style={styles.roundText}>Round {equb.currentRound}/{equb.totalRounds}</Text>
                    <Text style={styles.percentageText}>{percentage}%</Text>
                </View>
                <View style={styles.progressBg}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${Math.min(100, percentage)}%`, backgroundColor: getProgressBarColor(equb.status) }
                        ]}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#111827', // Darker, more solid
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
        flex: 1,
        marginHorizontal: 6,
        borderWidth: 1.5,
        borderColor: '#1f2937', // More visible border
        minHeight: 150,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#1f2937',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    content: {
        marginBottom: 12,
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: 8,
        lineHeight: 20,
    },
    roleTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#374151',
    },
    roleTagText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 0.5,
    },
    footer: {
        marginTop: 'auto',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    roundText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6b7280',
    },
    percentageText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6b7280',
    },
    progressBg: {
        height: 4,
        backgroundColor: '#1f2937',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
