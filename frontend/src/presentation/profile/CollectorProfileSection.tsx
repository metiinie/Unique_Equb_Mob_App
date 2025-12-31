import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Pure Section Component: Collector-specific profile content
// Shows Today's Summary, Quick Actions, and Assigned Equbs for collectors

interface CollectorProfileSectionProps {
    navigation?: any;
}

export const CollectorProfileSection: React.FC<CollectorProfileSectionProps> = ({ navigation }) => {
    // Hardcoded data matching: profile_screen_(collector_view)
    const assignedEqubs = [
        {
            id: 1,
            initials: 'MK',
            name: 'Merkato Traders',
            meta: 'Round 4 • Daily',
            status: 'Active',
            toCollect: '5 Members',
            initialsBg: 'blue',
        },
        {
            id: 2,
            initials: 'PL',
            name: 'Piassa Laptop Sellers',
            meta: 'Round 12 • Weekly',
            status: 'Pending',
            toCollect: '12 Members',
            initialsBg: 'purple',
        },
    ];

    return (
        <>
            {/* Today's Summary */}
            <View style={styles.sectionContainer}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Text style={styles.summaryTitle}>Today's Summary</Text>
                        <View style={styles.dateChip}>
                            <Text style={styles.dateText}>Oct 24, 2023</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Collected</Text>
                            <Text style={styles.statValueSuccess}>ETB 12,500</Text>
                        </View>
                        <View style={styles.statCol}>
                            <Text style={styles.statLabel}>Pending</Text>
                            <Text style={styles.statValueWarning}>ETB 3,000</Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: '80%' }]} />
                    </View>
                    <Text style={styles.progressText}>80% of daily target reached</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionContainer}>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionScan}>
                        <Text style={styles.actionIconScan}>📷</Text>
                        <Text style={styles.actionTextScan}>Scan & Collect</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionManual}>
                        <Text style={styles.actionIconManual}>📝</Text>
                        <Text style={styles.actionTextManual}>Mark Manually</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Assigned Equbs */}
            <View style={styles.sectionContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Assigned Equbs</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.equbList}>
                    {assignedEqubs.map((equb) => (
                        <View key={equb.id} style={styles.equbCard}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardLeft}>
                                    <View style={[
                                        styles.initialsBox,
                                        equb.initialsBg === 'blue' ? styles.bgBlue : styles.bgPurple
                                    ]}>
                                        <Text style={[
                                            styles.initialsText,
                                            equb.initialsBg === 'blue' ? styles.textBlue : styles.textPurple
                                        ]}>
                                            {equb.initials}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.equbName}>{equb.name}</Text>
                                        <Text style={styles.equbMeta}>{equb.meta}</Text>
                                    </View>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{equb.status}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={styles.collectLabel}>To Collect</Text>
                                    <Text style={styles.collectValue}>{equb.toCollect}</Text>
                                </View>
                                <TouchableOpacity style={[
                                    styles.viewBtn,
                                    equb.name.includes('Merkato') ? styles.viewBtnPrimary : styles.viewBtnOutline
                                ]}>
                                    <Text style={[
                                        styles.viewBtnText,
                                        equb.name.includes('Merkato') ? styles.textWhite : styles.textGray
                                    ]}>View List</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    /* Summary Card */
    sectionContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    summaryCard: {
        backgroundColor: '#1c2431',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    dateChip: {
        backgroundColor: '#2d3748',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    dateText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCol: {
        flex: 1,
        gap: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statValueSuccess: {
        fontSize: 20,
        fontWeight: '700',
        color: '#22c55e',
    },
    statValueWarning: {
        fontSize: 20,
        fontWeight: '700',
        color: '#eab308',
    },
    progressContainer: {
        height: 8,
        backgroundColor: '#2d3748',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#2b6cee',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
    },
    /* Actions */
    actionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionScan: {
        flex: 1,
        backgroundColor: '#2b6cee',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionManual: {
        flex: 1,
        backgroundColor: '#1c2431',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    actionIconScan: {
        fontSize: 28,
        color: '#ffffff',
    },
    actionTextScan: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    actionIconManual: {
        fontSize: 28,
        color: '#2b6cee',
    },
    actionTextManual: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '700',
    },
    /* Assigned Equbs */
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2b6cee',
    },
    equbList: {
        gap: 12,
    },
    equbCard: {
        backgroundColor: '#1c2431',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2d3748',
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardLeft: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    initialsBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgBlue: { backgroundColor: 'rgba(30, 58, 138, 0.3)' },
    bgPurple: { backgroundColor: 'rgba(88, 28, 135, 0.3)' },
    initialsText: {
        fontWeight: '700',
        fontSize: 14,
    },
    textBlue: { color: '#60a5fa' },
    textPurple: { color: '#c084fc' },
    equbName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    equbMeta: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statusBadge: {
        backgroundColor: 'rgba(22, 101, 52, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        color: '#4ade80',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#2d3748',
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    collectLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    collectValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    viewBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewBtnPrimary: {
        backgroundColor: '#ffffff',
    },
    viewBtnOutline: {
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    viewBtnText: {
        fontSize: 12,
        fontWeight: '700',
    },
    textWhite: {
        color: '#101622',
    },
    textGray: {
        color: '#cbd5e1',
    },
});
