import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Shared Section: Equb Overview
// Displays key metrics: Status, Contribution, Cycle, Round, Members

interface EqubOverviewSectionProps {
    equb: {
        id: string;
        name: string;
        status: string;
        currentRound: number;
        totalRounds: number;
        amount: number;
        frequency: string;
        _count: {
            memberships: number;
        };
    };
}

export const EqubOverviewSection: React.FC<EqubOverviewSectionProps> = ({ equb }) => {
    const statusColor = equb.status === 'ACTIVE' ? '#22c55e' : '#f59e0b';
    const progress = Math.round((equb.currentRound / equb.totalRounds) * 100);

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.equbName}>{equb.name}</Text>
                <View style={[styles.statusBadge, { borderColor: statusColor + '44' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {equb.status}
                    </Text>
                </View>
            </View>

            <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Contribution</Text>
                    <Text style={styles.metricValue}>{equb.amount.toLocaleString()} ETB</Text>
                </View>

                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Cycle</Text>
                    <Text style={styles.metricValue}>{equb.frequency}</Text>
                </View>

                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Round</Text>
                    <Text style={styles.metricValue}>
                        {equb.currentRound}
                        <Text style={styles.metricSub}>/{equb.totalRounds}</Text>
                    </Text>
                </View>

                <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Members</Text>
                    <Text style={styles.metricValue}>{equb._count.memberships}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${progress}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {progress}% Complete
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        alignItems: 'center',
        marginBottom: 20,
    },
    equbName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: 'rgba(34, 197, 94, 0.1)', // Subtle tint
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
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 20,
    },
    metricItem: {
        flex: 1,
        minWidth: '40%', // Creates 2x2 grid
        gap: 4,
    },
    metricLabel: {
        fontSize: 12,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    metricSub: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    progressContainer: {
        gap: 8,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#2d3748',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2b6cee',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'right',
    },
});
