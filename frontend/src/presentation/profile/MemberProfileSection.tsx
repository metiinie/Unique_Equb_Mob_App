import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Pure Section Component: Member-specific profile content
// Shows Active Equbs and Past Payouts for members

interface MemberProfileSectionProps {
    navigation?: any;
}

export const MemberProfileSection: React.FC<MemberProfileSectionProps> = ({ navigation }) => {
    // Hardcoded data matching the source design
    const activeEqubs = [
        { id: 1, name: 'Addis Monthly', amount: '10,000 ETB', pos: 4, total: 12, status: 'Paid', bg: 'emerald' },
        { id: 2, name: 'Office Group', amount: '2,000 ETB', pos: 10, total: 12, status: 'Due', bg: 'amber' },
        { id: 3, name: 'Community Save', amount: '5,000 ETB', pos: null, total: null, status: 'Won', bg: 'emerald' },
    ];

    const pastPayouts = [
        { id: 1, date: 'Oct 24', year: '2023', name: 'Neighborhood', amount: '50,000 ETB' },
        { id: 2, date: 'Aug 15', year: '2023', name: 'Friends & Family', amount: '25,000 ETB' },
        { id: 3, date: 'May 02', year: '2023', name: 'Office Car Fund', amount: '100,000 ETB' },
    ];

    return (
        <>
            {/* Active Equbs */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Active Equbs</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewHistoryText}>View History</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colHeader, { flex: 2, paddingLeft: 4 }]}>EQUB / AMOUNT</Text>
                        <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>POS</Text>
                        <Text style={[styles.colHeader, { flex: 1, textAlign: 'right', paddingRight: 4 }]}>STATUS</Text>
                    </View>

                    {activeEqubs.map((item, index) => (
                        <TouchableOpacity key={item.id} style={[styles.tableRow, index !== activeEqubs.length - 1 && styles.borderBottom]}>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.equbName}>{item.name}</Text>
                                <Text style={styles.equbAmount}>{item.amount}</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                {item.pos ? (
                                    <Text style={styles.posText}>{item.pos}<Text style={styles.posTotal}>/{item.total}</Text></Text>
                                ) : (
                                    <Text style={[styles.posText, { color: '#10b981' }]}>Won</Text>
                                )}
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                                <View style={[
                                    styles.statusBadge,
                                    item.bg === 'emerald' ? styles.statusEmerald : styles.statusAmber
                                ]}>
                                    <View style={[
                                        styles.statusDot,
                                        item.bg === 'emerald' ? styles.dotEmerald : styles.dotAmber
                                    ]} />
                                    <Text style={[
                                        styles.statusText,
                                        item.bg === 'emerald' ? styles.textEmerald : styles.textAmber
                                    ]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Past Payouts */}
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

                    {pastPayouts.map((item, index) => (
                        <TouchableOpacity key={item.id} style={[styles.tableRow, index !== pastPayouts.length - 1 && styles.borderBottom]}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.equbName}>{item.date}</Text>
                                <Text style={styles.equbAmount}>{item.year}</Text>
                            </View>
                            <View style={{ flex: 2, justifyContent: 'center' }}>
                                <Text style={styles.payoutName} numberOfLines={1}>{item.name}</Text>
                            </View>
                            <View style={{ flex: 1.5, alignItems: 'flex-end', justifyContent: 'center' }}>
                                <Text style={styles.payoutAmount}>{item.amount}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.joinBtn}>
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
});
