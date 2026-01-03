import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OPS_THEME } from '../../core/theme/ops_theme';
import { ApiClient } from '../services/api_client';
import { MembershipDto, UserDto } from '../../domain/dtos';
import { EqubStatus } from '../../core/constants/enums';

export const EqubMemberManagementScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { equbId } = route.params;

    const [loading, setLoading] = useState(true);
    const [equb, setEqub] = useState<any>(null);
    const [members, setMembers] = useState<MembershipDto[]>([]);
    const [allUsers, setAllUsers] = useState<UserDto[]>([]); // For lookup
    const [inviteInput, setInviteInput] = useState('');
    const [adding, setAdding] = useState(false);
    const [activating, setActivating] = useState(false);

    // Initial Fetch
    const fetchData = async () => {
        try {
            // Parallel fetch: Equb detail, Members, All Users (for lookup)
            const [equbData, membersData, usersData] = await Promise.all([
                ApiClient.get(`/equbs/${equbId}`),
                ApiClient.get<MembershipDto[]>(`/equbs/${equbId}/members`),
                ApiClient.get<UserDto[]>('/users')
            ]);

            setEqub(equbData);
            setMembers(membersData);
            setAllUsers(usersData);
            setLoading(false);
        } catch (error) {
            console.error('Fetch Error:', error);
            Alert.alert('Error', 'Failed to load Equb data.');
            navigation.goBack();
        }
    };

    useEffect(() => {
        fetchData();
    }, [equbId]);

    const handleAddMember = async () => {
        if (!inviteInput.trim()) return;

        // Lookup User locally
        const targetUser = allUsers.find(u =>
            u.email.toLowerCase() === inviteInput.trim().toLowerCase() ||
            (u.fullName && u.fullName.toLowerCase() === inviteInput.trim().toLowerCase())
            // Add phone check if available in UserDto, strictly email for now
        );

        if (!targetUser) {
            Alert.alert('User Not Found', `No user found with identifier "${inviteInput}". Please ask them to register first.`);
            return;
        }

        // Check duplicates locally before api call for better UX
        if (members.some(m => m.userId === targetUser.id)) {
            Alert.alert('Already Member', 'This user is already in the list.');
            return;
        }

        setAdding(true);
        try {
            await ApiClient.post(`/equbs/${equbId}/members`, { userId: targetUser.id });
            // Refresh
            const updatedMembers = await ApiClient.get<MembershipDto[]>(`/equbs/${equbId}/members`);
            setMembers(updatedMembers);
            setInviteInput('');
        } catch (error: any) {
            Alert.alert('Add Failed', error.message || 'Could not add member.');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveMember = (member: MembershipDto) => {
        Alert.alert(
            'Remove Member?',
            `Removing ${member.user?.fullName} is reversible until activation. They will not be explicitly notified.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await ApiClient.delete(`/equbs/${equbId}/members/${member.userId}`);
                            const updatedMembers = await ApiClient.get<MembershipDto[]>(`/equbs/${equbId}/members`);
                            setMembers(updatedMembers);
                        } catch (error: any) {
                            Alert.alert('Remove Failed', error.message);
                        }
                    }
                }
            ]
        );
    };

    const handleActivate = () => {
        Alert.alert(
            'ACTIVATE EQUB?',
            'Once activated, members cannot be changed and contributions will become enforceable. This is the financial point of no return.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'CONFIRM ACTIVATION',
                    style: 'default',
                    onPress: async () => {
                        setActivating(true);
                        try {
                            await ApiClient.post(`/equbs/${equbId}/activate`, {});
                            Alert.alert('Success', 'Equb is now ACTIVE.', [
                                { text: 'Go to Dashboard', onPress: () => navigation.navigate('Dashboard') } // Or navigate to Detail
                            ]);
                        } catch (error: any) {
                            Alert.alert('Activation Blocked', error.message);
                        } finally {
                            setActivating(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={OPS_THEME.colors.text.primary} />
                </View>
            </SafeAreaView>
        );
    }

    // Capacity Logic
    const capacity = equb?.totalRounds || 0;
    const filled = members.length; // assuming 1 member per round/slot for simplicity
    const isFull = filled >= capacity;
    const canActivate = filled === capacity;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.equbName}>{equb?.name}</Text>
                    <Text style={styles.subtitle}>Member Setup</Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{equb?.status || 'DRAFT'}</Text>
                </View>
            </View>

            {/* Capacity Indicator */}
            <View style={styles.capacityContainer}>
                <Text style={styles.capacityLabel}>CAPACITY</Text>
                <Text style={[styles.capacityValue, isFull ? { color: OPS_THEME.colors.status.success } : {}]}>
                    {filled} <Text style={styles.capacityTotal}>/ {capacity}</Text>
                </Text>
                {isFull && <Text style={styles.fullText}>Member capacity reached</Text>}
            </View>

            {/* Add Member - Disabled if Full */}
            {!isFull && (
                <View style={styles.addSection}>
                    <Text style={styles.inputLabel}>ADD MEMBER BY EMAIL</Text>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="user@example.com"
                            placeholderTextColor={OPS_THEME.colors.text.tertiary}
                            value={inviteInput}
                            onChangeText={setInviteInput}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={[styles.addBtn, (!inviteInput || adding) && styles.disabledBtn]}
                            onPress={handleAddMember}
                            disabled={!inviteInput || adding}
                        >
                            {adding ? <ActivityIndicator color="#FFF" /> : <Text style={styles.addBtnText}>ADD</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Member List */}
            <FlatList
                data={members}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.memberRow}>
                        <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{item.user?.fullName || 'Unknown User'}</Text>
                            <Text style={styles.memberId}>{item.user?.email || item.userId}</Text>
                        </View>
                        <View style={styles.memberStatus}>
                            <Text style={styles.statusTag}>CONFIRMED</Text>
                            <TouchableOpacity onPress={() => handleRemoveMember(item)} style={styles.removeBtn}>
                                <Text style={styles.removeText}>X</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No members added yet.</Text>}
            />

            {/* Activation Gate */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.activateBtn, (!canActivate || activating) && styles.disabledActivate]}
                    onPress={handleActivate}
                    disabled={!canActivate || activating}
                >
                    {activating ? (
                        <ActivityIndicator color={OPS_THEME.colors.bg.app} />
                    ) : (
                        <Text style={styles.activateText}>ACTIVATE EQUB</Text>
                    )}
                </TouchableOpacity>
                {!canActivate && (
                    <Text style={styles.activateHint}>
                        All {capacity} slots must be filled to activate.
                    </Text>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: OPS_THEME.colors.bg.app },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: OPS_THEME.colors.border.subtle,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    equbName: { fontSize: 20, fontWeight: 'bold', color: OPS_THEME.colors.text.primary },
    subtitle: { fontSize: 14, color: OPS_THEME.colors.text.secondary },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.text.tertiary
    },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: OPS_THEME.colors.text.tertiary },

    capacityContainer: { padding: 20, backgroundColor: OPS_THEME.colors.bg.surface, alignItems: 'center' },
    capacityLabel: { fontSize: 12, fontWeight: 'bold', color: OPS_THEME.colors.text.tertiary, letterSpacing: 1 },
    capacityValue: { fontSize: 32, fontWeight: 'bold', color: OPS_THEME.colors.text.secondary },
    capacityTotal: { fontSize: 20, color: OPS_THEME.colors.text.tertiary },
    fullText: { marginTop: 8, color: OPS_THEME.colors.text.secondary, fontSize: 14 },

    addSection: { padding: 20 },
    inputLabel: { fontSize: 12, fontWeight: 'bold', color: OPS_THEME.colors.text.tertiary, marginBottom: 8 },
    inputRow: { flexDirection: 'row', gap: 12 },
    input: {
        flex: 1,
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
        borderRadius: 8,
        padding: 12,
        color: OPS_THEME.colors.text.primary
    },
    addBtn: {
        backgroundColor: OPS_THEME.colors.text.primary,
        borderRadius: 8,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    disabledBtn: { opacity: 0.5 },
    addBtnText: { fontWeight: 'bold', color: OPS_THEME.colors.bg.app },

    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    memberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: OPS_THEME.colors.border.subtle
    },
    memberInfo: { flex: 1 },
    memberName: { fontSize: 16, fontWeight: '600', color: OPS_THEME.colors.text.primary },
    memberId: { fontSize: 12, color: OPS_THEME.colors.text.tertiary, marginTop: 2 },
    memberStatus: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statusTag: { fontSize: 10, fontWeight: 'bold', color: OPS_THEME.colors.status.success, letterSpacing: 0.5 },
    removeBtn: { padding: 8 },
    removeText: { fontSize: 16, color: OPS_THEME.colors.status.critical, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', color: OPS_THEME.colors.text.tertiary, marginTop: 20 },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: OPS_THEME.colors.bg.app,
        borderTopWidth: 1,
        borderTopColor: OPS_THEME.colors.border.subtle
    },
    activateBtn: {
        backgroundColor: OPS_THEME.colors.status.success,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    disabledActivate: { backgroundColor: OPS_THEME.colors.bg.surface, opacity: 0.5 },
    activateText: { fontWeight: 'bold', color: OPS_THEME.colors.bg.app, fontSize: 16, letterSpacing: 1 },
    activateHint: { textAlign: 'center', color: OPS_THEME.colors.text.tertiary, marginTop: 12, fontSize: 12 },
});
