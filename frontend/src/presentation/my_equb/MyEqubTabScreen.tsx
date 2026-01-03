import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, TextInput, FlatList, Modal, Pressable } from 'react-native';
import { GlobalRole, EqubStatus } from '../../core/constants/enums';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';
import { EqubDto } from '../../domain/dtos';
import { EqubGridCard } from './components/EqubGridCard';
import { Ionicons, Feather } from '@expo/vector-icons';

/**
 * MISSION: High-Density, Fast-to-Scan, Truth-Driven UI.
 * This tab serves as the single source of truth for Equb management.
 */

export const MyEqubTabScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();
    const [equbs, setEqubs] = useState<EqubDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeStatusFilter, setActiveStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'COMPLETED'>('ALL');
    const [activeRoleFilter, setActiveRoleFilter] = useState<'ALL' | 'ADMIN' | 'MEMBER' | 'COLLECTOR'>('ALL');
    const [showFilterModal, setShowFilterModal] = useState(false);

    useEffect(() => {
        fetchEqubs();
    }, []);

    const fetchEqubs = async () => {
        try {
            setLoading(true);
            const result = await ApiClient.get<EqubDto[]>('/equbs');
            setEqubs(result || []);
        } catch (error) {
            console.error('[MyEqubTabScreen] Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEqubs = useMemo(() => {
        return equbs.filter(e => {
            const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                activeStatusFilter === 'ALL' ||
                (activeStatusFilter === 'ACTIVE' && e.status === EqubStatus.ACTIVE) ||
                (activeStatusFilter === 'PENDING' && (e.status === EqubStatus.DRAFT || e.status === EqubStatus.ON_HOLD)) ||
                (activeStatusFilter === 'COMPLETED' && e.status === EqubStatus.COMPLETED);

            const matchesRole = activeRoleFilter === 'ALL' || activeRoleFilter === e.myRole;

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [equbs, searchQuery, activeStatusFilter, activeRoleFilter]);

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.title}>My Equbs</Text>
            <TouchableOpacity
                style={styles.filterTrigger}
                onPress={() => setShowFilterModal(true)}
            >
                <Feather name="sliders" size={20} color="#94a3b8" />
                {(activeStatusFilter !== 'ALL' || activeRoleFilter !== 'ALL') && (
                    <View style={styles.filterIndicator} />
                )}
            </TouchableOpacity>
        </View>
    );

    const FilterModal = () => (
        <Modal
            visible={showFilterModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowFilterModal(false)}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowFilterModal(false)}
            >
                <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Refine View</Text>
                        <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                            <Ionicons name="close" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalSection}>
                        <Text style={styles.filterLabel}>Status</Text>
                        <View style={styles.modalFilterRow}>
                            {(['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'] as const).map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[styles.modalFilterChip, activeStatusFilter === status && styles.activeModalFilterChip]}
                                    onPress={() => setActiveStatusFilter(status)}
                                >
                                    <Text style={[styles.modalFilterText, activeStatusFilter === status && styles.activeModalFilterText]}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.modalSection}>
                        <Text style={styles.filterLabel}>Your Role</Text>
                        <View style={styles.modalFilterRow}>
                            {(['ALL', 'ADMIN', 'MEMBER', 'COLLECTOR'] as const).map(role => (
                                <TouchableOpacity
                                    key={role}
                                    style={[styles.modalFilterChip, activeRoleFilter === role && styles.activeModalFilterChip]}
                                    onPress={() => setActiveRoleFilter(role)}
                                >
                                    <Text style={[styles.modalFilterText, activeRoleFilter === role && styles.activeModalFilterText]}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={() => setShowFilterModal(false)}
                    >
                        <Text style={styles.applyBtnText}>Show {filteredEqubs.length} Results</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={() => {
                            setActiveStatusFilter('ALL');
                            setActiveRoleFilter('ALL');
                        }}
                    >
                        <Text style={styles.resetBtnText}>Reset to Default</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerParams}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {renderHeader()}

                <View style={styles.searchBarWrapper}>
                    <Feather name="search" size={18} color="#64748b" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Equb"
                        placeholderTextColor="#64748b"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={filteredEqubs}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <EqubGridCard
                            equb={item}
                            onPress={() => navigation.navigate('EqubOverview', { equbId: item.id })}
                        />
                    )}
                    contentContainerStyle={styles.gridContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📂</Text>
                            <Text style={styles.emptyTitle}>No Matching Equbs</Text>
                            <Text style={styles.emptySubtitle}>
                                Adjust your filters or search terms to find what you are looking for.
                            </Text>
                        </View>
                    }
                />
            </View>

            <FilterModal />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateEqub')}
            >
                <Ionicons name="add" size={32} color="#ffffff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#030712', // Pure deep dark
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#f9fafb',
        letterSpacing: -1,
    },
    filterTrigger: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1f2937',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    filterIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3b82f6',
        borderWidth: 1.5,
        borderColor: '#111827',
    },
    searchBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 12,
        marginHorizontal: 20,
        paddingHorizontal: 12,
        height: 52,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: '#1f2937',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#f9fafb',
        fontSize: 16,
        fontWeight: '600',
    },
    gridContent: {
        paddingHorizontal: 14,
        paddingBottom: 110,
    },
    centerParams: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#f9fafb',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        paddingHorizontal: 50,
        lineHeight: 22,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 25,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0f172a',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 48,
        borderTopWidth: 1,
        borderColor: '#1e293b',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#f9fafb',
    },
    modalSection: {
        marginBottom: 32,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748b',
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    modalFilterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    modalFilterChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
    },
    activeModalFilterChip: {
        backgroundColor: '#2563eb',
        borderColor: '#3b82f6',
    },
    modalFilterText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94a3b8',
    },
    activeModalFilterText: {
        color: '#ffffff',
    },
    applyBtn: {
        backgroundColor: '#2563eb',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    applyBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
    },
    resetBtn: {
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    resetBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
});
