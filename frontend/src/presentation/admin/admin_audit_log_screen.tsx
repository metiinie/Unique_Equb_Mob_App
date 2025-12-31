import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

// Purity: Presentational Component only. Hardcoded data for pixel-perfect Audit Log translation.

export const AdminAuditLogScreen = ({ navigation }: { navigation: any }) => {
    // Local UI state
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Data based on HTML Timeline Items
    const auditData = [
        { type: 'header', label: 'Today' },
        {
            type: 'item',
            id: '1',
            icon: 'check_circle',
            iconBg: 'green',
            title: 'Contribution Received',
            time: '2m ago',
            desc: 'Kebede T. - Cycle 3 Contribution',
            badge: '+ 2,000 ETB',
            badgeType: 'green',
            actor: 'Sara',
            actorRole: 'Admin'
        },
        {
            type: 'item',
            id: '2',
            icon: 'account_balance_wallet',
            iconBg: 'primary',
            title: 'Payout Released',
            time: '1h ago',
            desc: 'Winner: Almaz G.',
            badge: '- 10,000 ETB',
            badgeType: 'blue',
            actor: 'System',
            actorRole: 'Approved by'
        },
        { type: 'header', label: 'Yesterday' },
        {
            type: 'item',
            id: '3',
            icon: 'warning',
            iconBg: 'red',
            title: 'Payment Overdue',
            time: '09:15 AM',
            desc: 'Dawit M. missed cycle deadline',
            badge: 'Action Required',
            badgeType: 'red',
            actor: 'System',
            actorRole: ''
        },
        { type: 'header', label: 'Oct 20' },
        {
            type: 'item',
            id: '4',
            icon: 'person_add',
            iconBg: 'gray',
            title: 'Member Added',
            time: '14:30 PM',
            desc: 'New member joined: Yonas A.',
            actor: 'Sara',
            actorRole: 'Admin'
        },
        {
            type: 'item',
            id: '5',
            icon: 'settings',
            iconBg: 'gray',
            title: 'Cycle Duration Updated',
            time: '10:00 AM',
            desc: 'Changed from Weekly to Monthly',
            badge: 'Edited',
            badgeType: 'amber',
            actor: 'Sara',
            actorRole: 'Admin',
            last: true
        },
    ];

    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.dateHeader}>
                    <Text style={styles.dateLabel}>{item.label}</Text>
                </View>
            );
        }

        const isLast = item.last;

        return (
            <View style={styles.timelineItem}>
                {/* Connector */}
                <View style={styles.connectorCol}>
                    <View style={[
                        styles.iconCircle,
                        item.iconBg === 'green' && styles.bgGreen,
                        item.iconBg === 'primary' && styles.bgPrimary,
                        item.iconBg === 'red' && styles.bgRed,
                        item.iconBg === 'gray' && styles.bgGray,
                    ]}>
                        <Text style={[
                            styles.timelineIcon,
                            item.iconBg === 'green' && styles.textGreen,
                            item.iconBg === 'primary' && styles.textPrimary,
                            item.iconBg === 'red' && styles.textRed,
                            item.iconBg === 'gray' && styles.textGray,
                        ]}>{getEmoji(item.icon)}</Text>
                    </View>
                    {!isLast && <View style={styles.connectorLine} />}
                </View>

                {/* Content */}
                <View style={[styles.contentCol, isLast ? { paddingBottom: 0 } : {}]}>
                    <View style={styles.contentHeader}>
                        <Text style={[
                            styles.itemTitle,
                            item.title === 'Payout Released' && styles.textPrimary
                        ]}>{item.title}</Text>
                        <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                    <Text style={styles.itemDesc}>{item.desc}</Text>

                    <View style={styles.metaRow}>
                        {item.badge && (
                            <View style={[
                                styles.badge,
                                item.badgeType === 'green' && styles.badgeGreen,
                                item.badgeType === 'blue' && styles.badgeBlue,
                                item.badgeType === 'red' && styles.badgeRed,
                                item.badgeType === 'amber' && styles.badgeAmber,
                            ]}>
                                <Text style={[
                                    styles.badgeText,
                                    item.badgeType === 'green' && styles.badgeTextGreen,
                                    item.badgeType === 'blue' && styles.badgeTextBlue,
                                    item.badgeType === 'red' && styles.badgeTextRed,
                                    item.badgeType === 'amber' && styles.badgeTextAmber,
                                ]}>{item.badge}</Text>
                            </View>
                        )}
                        <Text style={styles.actorText}>
                            👤 {item.actorRole ? `${item.actorRole}: ` : ''}{item.actor}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const getEmoji = (iconName: string) => {
        switch (iconName) {
            case 'check_circle': return '✓';
            case 'account_balance_wallet': return '💰';
            case 'warning': return '⚠️';
            case 'person_add': return '👤';
            case 'settings': return '⚙️';
            default: return '•';
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Audit Log</Text>
                    <TouchableOpacity style={styles.filterBtn}>
                        <Text style={styles.filterIcon}>🔍</Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBox}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search ID, member, or activity..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* List */}
                <FlatList
                    data={auditData}
                    keyExtractor={(item, index) => item.id || `header-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]} // Sticky 'Today' header? No, multiple headers. React Native FlatList stickyHeaderIndices takes array of indices. 
                // Dynamic sticky headers is complex with mixed data. We'll skip sticky for this simple implementation or use SectionList.
                // Sticking with FlatList for simplicity as per requirements.
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#101622',
    },
    container: {
        flex: 1,
        backgroundColor: '#101622',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b', // gray-800
        backgroundColor: 'rgba(16, 22, 34, 0.95)',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#1c2333', // surface-dark hover equivalent
    },
    backIcon: {
        color: '#ffffff',
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    filterBtn: {
        padding: 8,
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        borderRadius: 8,
    },
    filterIcon: {
        fontSize: 18,
        color: '#2b6cee',
    },
    /* Search */
    searchContainer: {
        padding: 16,
        backgroundColor: '#101622',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1c232e', // surface-dark
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
        height: 48,
        paddingHorizontal: 12,
    },
    searchIcon: {
        fontSize: 18,
        color: '#94a3b8',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#ffffff',
        fontSize: 16,
    },
    /* Timeline */
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    dateHeader: {
        paddingVertical: 12,
        backgroundColor: '#101622', // Match bg for sticky effect if used
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94a3b8', // gray-400
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: 16,
    },
    connectorCol: {
        alignItems: 'center',
        width: 40,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 4,
        borderColor: '#101622', // Ring effect
    },
    bgGreen: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
    bgPrimary: { backgroundColor: 'rgba(43, 108, 238, 0.1)' },
    bgRed: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    bgGray: { backgroundColor: '#374151' }, // gray-700

    timelineIcon: {
        fontSize: 16,
    },
    textGreen: { color: '#4ade80' },
    textPrimary: { color: '#2b6cee' },
    textRed: { color: '#f87171' },
    textGray: { color: '#d1d5db' },

    connectorLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#1e293b', // gray-800
        marginVertical: 4,
    },
    contentCol: {
        flex: 1,
        paddingBottom: 32,
        paddingTop: 4,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    timeText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#64748b', // gray-500
    },
    itemDesc: {
        fontSize: 14,
        fontWeight: '500',
        color: '#d1d5db', // gray-300
        marginBottom: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeGreen: { backgroundColor: 'rgba(22, 163, 74, 0.3)' }, // green-900/30
    badgeBlue: { backgroundColor: 'rgba(30, 58, 138, 0.3)' }, // blue-900/30
    badgeRed: { backgroundColor: 'rgba(127, 29, 29, 0.3)' }, // red-900/30
    badgeAmber: { backgroundColor: 'rgba(120, 53, 15, 0.3)' }, // amber-900/30

    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    badgeTextGreen: { color: '#4ade80' },
    badgeTextBlue: { color: '#93c5fd' },
    badgeTextRed: { color: '#f87171' },
    badgeTextAmber: { color: '#fbbf24' },

    actorText: {
        fontSize: 12,
        color: '#94a3b8', // gray-400
    },
});
