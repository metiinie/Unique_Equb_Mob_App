import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GlobalRole } from '../../../core/constants/enums';
import { ApiClient } from '../../services/api_client';
import { MemberCard, Member } from '../components/MemberCard';

interface MembersSectionProps {
    role: GlobalRole;
    equbId: string;
    onViewAll?: () => void;
}

export const MembersSection: React.FC<MembersSectionProps> = ({ role, equbId, onViewAll }) => {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const data = await ApiClient.get(`/memberships/equbs/${equbId}`);
                setMembers(data as any[]);
            } catch (error) {
                console.error('[MembersSection] Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [equbId]);

    const isAdmin = role === GlobalRole.ADMIN;

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#2b6cee" />
            </View>
        );
    }

    const mappedMembers: Member[] = members.map(m => ({
        id: m.user.id,
        name: m.user.fullName,
        phone: '***', // Privacy
        status: 'Active',
        darkStatusColor: '#4ade80',
        darkStatusBg: 'rgba(22, 163, 74, 0.3)',
        borderColor: 'rgba(22, 163, 74, 0.5)',
        avatar: undefined, // Add if available
    }));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Members ({members.length})</Text>
                {isAdmin && (
                    <TouchableOpacity style={styles.actionBtn} onPress={onViewAll}>
                        <Text style={styles.actionBtnText}>Manage Members</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.list}>
                {mappedMembers.slice(0, 3).map((member) => (
                    <MemberCard key={member.id} member={member} />
                ))}
            </View>

            <TouchableOpacity style={styles.viewAllBtn} onPress={onViewAll}>
                <Text style={styles.viewAllText}>
                    {isAdmin ? 'View All Members & Analytics' : 'View Full Member List'}
                </Text>
                <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    actionBtn: {
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionBtnText: {
        color: '#2b6cee',
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        gap: 0,
    },
    viewAllBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1c2333',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    chevron: {
        fontSize: 20,
        color: '#64748b',
        fontWeight: 'bold',
    },
});
