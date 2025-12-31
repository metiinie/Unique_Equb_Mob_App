import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UserRole } from '../../core/constants/enums';
import { SharedMembersList } from './components/SharedMembersList';
import { MemberOwnInfoSection } from './components/MemberOwnInfoSection';
import { AdminMemberControlsSection } from './components/AdminMemberControlsSection';
import { FilterModal } from '../equb/filter_modal';
import { Member } from './components/MemberCard';

// Single Member Tab Route
// Responsibilities:
// 1. Display shared search bar and filter button
// 2. Show role-specific sections (Member own info OR Admin controls)
// 3. Render shared members list for both roles
// 4. Handle filter modal
//
// This is the ONLY Members route in navigation.
// Tab is visible ONLY to Member and Admin (Collector cannot see this tab)

interface MemberTabScreenProps {
    navigation: any;
}

export const MemberTabScreen: React.FC<MemberTabScreenProps> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    // ROLE RESOLUTION: In Phase 6, this will come from real Auth context
    // For Phase 5 UI development, we use a hardcoded role
    // TODO: Replace with useAuthContext() when authentication is implemented
    const currentRole: UserRole = UserRole.admin; // Hardcoded for now - change to test different roles

    const filters = ['All', 'Good Standing', 'Late', 'Missed', 'Locked'];

    // Mock members data
    const members: Member[] = [
        {
            id: '1',
            name: 'Abebe Kebede',
            phone: '+251 91 **** 22',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvtp0pI0Tr61n0WzcAUYf-se2svubbr6fhujtiSqvibMDSXbNxq-MLfoTqzUQD2rZo92NnRK80YKURbxV84n8yNAUR7DAn-QvCb1cB2h2nKaP5zlOiQsvlFPQ_lafiFmoPkf8SHI4J8NAkpXDBzUiaOKIcYFKZpuwAxUe1zyvKo7IzCCq34ADLfSf_Gi2hM-nj-qXrtt-3W88v7vaesuc37l0SLSwMqakKtV4tuOmvcsF1rhvVOWUuQdUnITtmpEGaUeueWE8Mqt1D',
            status: 'Good',
            darkStatusColor: '#4ade80',
            darkStatusBg: 'rgba(22, 163, 74, 0.3)',
            borderColor: 'rgba(22, 163, 74, 0.5)',
        },
        {
            id: '2',
            name: 'Sara Tadesse',
            phone: '+251 93 **** 01',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK7qdx1W4H3ZFvEkszKa3iPEVklQxXboUDIleY051nlmRV6LCSYkYf6SJW6ufIKiKTT2_5DfbCJvM98ziUJK5US1MOZ_nLISAVXgKlUOzCCwhQgat6sr0Qj5gPljYmdNZxnuP75uF11Q6ME0ryZEM1LIpBHU_ibQhlEvDglThIDFZPaF552MpmYOtH3qIgGWFOBYAmDDdw9LQcsUJzoDOm-1fuX_QFdT_2nlOr0nfCVjVw17n67N1F5ppXbkpCg_FT5oOq2fQfIePx',
            status: 'Late',
            darkStatusColor: '#fbbf24',
            darkStatusBg: 'rgba(180, 83, 9, 0.3)',
            borderColor: 'rgba(180, 83, 9, 0.5)',
        },
        {
            id: '3',
            name: 'Dawit Alemu',
            phone: '+251 92 **** 55',
            initials: 'DA',
            status: 'Missed',
            darkStatusColor: '#f87171',
            darkStatusBg: 'rgba(153, 27, 27, 0.3)',
            borderColor: 'rgba(153, 27, 27, 0.5)',
        },
        {
            id: '4',
            name: 'Hana Yilma',
            phone: '+251 91 **** 99',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc18alxEdaWF44DxIfNjuKi7pALPDInyddLaiNRY3sm3ubcSeLhFUP2reyibSDrZp9M46v4E9HqxjMIIW7xQxi7UWzF__foeisIgINMG68CYQ9zVg8PMjaGcOG20qNtkgjU_KKhpVrXw9ERzJwvZNxAut_5Ow3GUU8Oxwkx3nkZEFQWIq8VR5lEx-nBxt8g1tM8kIIDFOWflbpL82lKlNZQka4CIYYvoQYZbpUpRWOHAiXeTEeu4CfnmN15xzdmZgj5qqhBEge50_b',
            status: 'Good',
            darkStatusColor: '#4ade80',
            darkStatusBg: 'rgba(22, 163, 74, 0.3)',
            borderColor: 'rgba(22, 163, 74, 0.5)',
        },
        {
            id: '5',
            name: 'Meron Haile',
            phone: '+251 95 **** 88',
            initials: 'MH',
            status: 'Locked',
            darkStatusColor: '#9ca3af',
            darkStatusBg: '#1f2937',
            borderColor: '#374151',
            opacity: 0.75,
        },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 40 }} />
                    <Text style={styles.headerTitle}>
                        Members <Text style={styles.headerCount}>({members.length})</Text>
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Search & Filter Bar */}
                <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search members..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Text style={styles.filterIcon}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                {/* Horizontal Filters */}
                <View style={styles.filterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContent}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[
                                    styles.filterChip,
                                    activeFilter === filter ? styles.activeChip : styles.inactiveChip
                                ]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        activeFilter === filter ? styles.activeChipText : styles.inactiveChipText
                                    ]}
                                >
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Role-Specific Sections */}
                    {currentRole === UserRole.member && <MemberOwnInfoSection navigation={navigation} />}
                    {currentRole === UserRole.admin && (
                        <AdminMemberControlsSection
                            navigation={navigation}
                            onFilterPress={() => setFilterModalVisible(true)}
                        />
                    )}

                    {/* Shared Members List */}
                    <SharedMembersList members={members} />

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* FAB - Only for Admin */}
                {currentRole === UserRole.admin && (
                    <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
                        <Text style={styles.fabIcon}>👤+</Text>
                    </TouchableOpacity>
                )}

                {/* Filter Modal */}
                <FilterModal
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    onApply={(filters) => {
                        console.log('Applied filters:', filters);
                        setFilterModalVisible(false);
                    }}
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
        paddingVertical: 16,
        backgroundColor: 'rgba(16, 22, 34, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    headerCount: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748b',
    },
    /* Search Bar */
    searchSection: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1c2333',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    searchIcon: {
        fontSize: 18,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#ffffff',
        paddingVertical: 0,
    },
    filterBtn: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1c2333',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    filterIcon: {
        fontSize: 20,
    },
    /* Filter Chips */
    filterContainer: {
        paddingBottom: 12,
    },
    filterContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    activeChip: {
        backgroundColor: '#2b6cee',
        borderColor: '#2b6cee',
    },
    inactiveChip: {
        backgroundColor: 'transparent',
        borderColor: '#374151',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeChipText: {
        color: '#ffffff',
    },
    inactiveChipText: {
        color: '#9ca3af',
    },
    /* Scroll View */
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 8,
    },
    /* FAB */
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2b6cee',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 24,
        color: '#ffffff',
    },
});
