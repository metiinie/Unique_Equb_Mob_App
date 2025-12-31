import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Pure Section Component: Admin-specific profile content
// Shows Stats, Quick Actions, and Managed Equbs for admins

interface AdminProfileSectionProps {
    navigation?: any;
}

export const AdminProfileSection: React.FC<AdminProfileSectionProps> = ({ navigation }) => {
    // Hardcoded data matching: All_Ui_Design/profile_screen_(admin_view)
    const managedEqubs = [
        {
            id: 1,
            name: 'Addis Business Group',
            meta: 'Monthly • ETB 50,000',
            status: 'Healthy',
            members: 12,
            round: 'Rnd 4/12',
            statusColor: 'emerald'
        },
        {
            id: 2,
            name: 'Family Savings',
            meta: 'Weekly • ETB 2,000',
            status: 'Action Req',
            members: 8,
            round: 'Rnd 8/10',
            statusColor: 'amber'
        },
        {
            id: 3,
            name: 'Community Growth',
            meta: 'Monthly • ETB 5,000',
            status: 'Payout Due',
            members: 24,
            round: 'Rnd 12/12',
            statusColor: 'blue'
        },
    ];

    return (
        <>
            {/* Stats Grid */}
            <View style={styles.sectionContainer}>
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                                <Text style={[styles.statIcon, { color: '#3b82f6' }]}>💰</Text>
                            </View>
                            <Text style={styles.statLabel}>TOTAL VOLUME</Text>
                        </View>
                        <View style={styles.statValueRow}>
                            <Text style={styles.statValue}>1.2M</Text>
                            <Text style={styles.statUnit}>ETB</Text>
                        </View>
                    </View>

                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                                <Text style={[styles.statIcon, { color: '#6366f1' }]}>👥</Text>
                            </View>
                            <Text style={styles.statLabel}>MEMBERS</Text>
                        </View>
                        <View style={styles.statValueRow}>
                            <Text style={styles.statValue}>24</Text>
                            <Text style={styles.statUnit}>Active</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.actionIconBox, { backgroundColor: '#2b6cee' }]}>
                            <Text style={styles.actionIconWhite}>+</Text>
                        </View>
                        <Text style={styles.actionLabel}>New Equb</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIconOutline}>
                            <Text style={styles.actionIconGray}>👤</Text>
                        </View>
                        <View style={styles.notificationDot} />
                        <Text style={styles.actionLabel}>Requests</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIconOutline}>
                            <Text style={styles.actionIconGray}>📊</Text>
                        </View>
                        <Text style={styles.actionLabel}>Reports</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionItem}>
                        <View style={styles.actionIconOutline}>
                            <Text style={styles.actionIconGray}>📂</Text>
                        </View>
                        <Text style={styles.actionLabel}>Archive</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Managed Equbs */}
            <View style={styles.sectionContainer}>
                <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>Managed Equbs</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.equbList}>
                    {managedEqubs.map((equb) => (
                        <TouchableOpacity key={equb.id} style={styles.equbCard}>
                            <View style={styles.cardTop}>
                                <View>
                                    <Text style={styles.equbName}>{equb.name}</Text>
                                    <Text style={styles.equbMeta}>{equb.meta}</Text>
                                </View>
                                <View style={[
                                    styles.statusChip,
                                    equb.statusColor === 'emerald' && styles.bgEmerald,
                                    equb.statusColor === 'amber' && styles.bgAmber,
                                    equb.statusColor === 'blue' && styles.bgBlue,
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        equb.statusColor === 'emerald' && styles.textEmerald,
                                        equb.statusColor === 'amber' && styles.textAmber,
                                        equb.statusColor === 'blue' && styles.textBlue,
                                    ]}>
                                        {equb.status}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.cardBottom}>
                                <View style={styles.cardStats}>
                                    <View style={styles.statBadge}>
                                        <Text style={styles.miniIcon}>👥</Text>
                                        <Text style={styles.miniText}>{equb.members}</Text>
                                    </View>
                                    <View style={styles.statBadge}>
                                        <Text style={styles.miniIcon}>⏳</Text>
                                        <Text style={styles.miniText}>{equb.round}</Text>
                                    </View>
                                </View>
                                <Text style={styles.chevron}>›</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    /* Sections */
    sectionContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    /* Stats Grid */
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#1a2230',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2c3442',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    iconBox: {
        padding: 6,
        borderRadius: 8,
    },
    statIcon: {
        fontSize: 16,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9da6b9',
        textTransform: 'uppercase',
    },
    statValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    statUnit: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
    },
    /* Action Grid */
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
        paddingLeft: 4,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionItem: {
        flex: 1,
        alignItems: 'center',
        gap: 10,
        position: 'relative',
    },
    actionIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionIconOutline: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a2230',
        borderWidth: 1,
        borderColor: '#2c3442',
    },
    actionIconWhite: {
        fontSize: 26,
        color: '#ffffff',
        fontWeight: '600',
    },
    actionIconGray: {
        fontSize: 24,
        color: '#9da6b9',
    },
    actionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#cbd5e1',
        textAlign: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: 0,
        right: 4,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        borderColor: '#101622',
        zIndex: 10,
    },
    /* Managed Equbs */
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2b6cee',
    },
    equbList: {
        gap: 12,
    },
    equbCard: {
        backgroundColor: '#1a2230',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2c3442',
        padding: 16,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    equbName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    equbMeta: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9da6b9',
    },
    statusChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    bgEmerald: { backgroundColor: 'rgba(6, 78, 59, 0.3)', borderColor: 'rgba(6, 95, 70, 0.5)' },
    textEmerald: { color: '#34d399' },
    bgAmber: { backgroundColor: 'rgba(120, 53, 15, 0.3)', borderColor: 'rgba(146, 64, 14, 0.5)' },
    textAmber: { color: '#fbbf24' },
    bgBlue: { backgroundColor: 'rgba(30, 58, 138, 0.3)', borderColor: 'rgba(30, 64, 175, 0.5)' },
    textBlue: { color: '#60a5fa' },
    divider: {
        height: 1,
        backgroundColor: '#2c3442',
        marginBottom: 12,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardStats: {
        flexDirection: 'row',
        gap: 16,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    miniIcon: {
        fontSize: 16,
    },
    miniText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9da6b9',
    },
    chevron: {
        fontSize: 24,
        color: '#6b7280',
        fontWeight: '300',
        marginTop: -4,
    },
});
