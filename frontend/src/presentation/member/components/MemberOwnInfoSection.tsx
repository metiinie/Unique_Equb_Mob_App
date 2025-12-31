import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Pure Section Component: Member-specific quick info
// Shows own contribution status, position, and next payout
// Visible only when role === MEMBER

interface MemberOwnInfoSectionProps {
    navigation?: any;
}

export const MemberOwnInfoSection: React.FC<MemberOwnInfoSectionProps> = ({ navigation }) => {
    // Mock data - in production, this would come from context or props
    const ownInfo = {
        position: 4,
        totalMembers: 12,
        nextPayoutDate: 'Oct 24, 2024',
        contributionStatus: 'Good Standing',
        statusColor: '#22c55e',
        amountContributed: '40,000 ETB',
        totalContributions: 4,
    };

    return (
        <View style={styles.section}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Your Contribution Status</Text>
                    <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: ownInfo.statusColor }]} />
                        <Text style={[styles.statusText, { color: ownInfo.statusColor }]}>
                            {ownInfo.contributionStatus}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Position</Text>
                        <Text style={styles.infoValue}>
                            {ownInfo.position} of {ownInfo.totalMembers}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Next Payout</Text>
                        <Text style={styles.infoValue}>{ownInfo.nextPayoutDate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total Contributed</Text>
                        <Text style={styles.infoValue}>{ownInfo.amountContributed}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Contributions Made</Text>
                        <Text style={styles.infoValue}>{ownInfo.totalContributions} payments</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#1c2333',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    infoGrid: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#9ca3af',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
});
