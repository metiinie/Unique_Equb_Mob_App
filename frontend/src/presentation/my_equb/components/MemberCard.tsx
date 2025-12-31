import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Pure UI Component: Individual Member Card (Domain: My Equb)
// Shows avatar/initials, name, phone, and status badge

export interface Member {
    id: string;
    name: string;
    phone: string;
    status: string;
    avatar?: string;
    initials?: string;
    darkStatusColor: string;
    darkStatusBg: string;
    borderColor: string;
    initialsBg?: string;
    initialsColor?: string;
    initialsBorder?: string;
    opacity?: number;
}

interface MemberCardProps {
    member: Member;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
    return (
        <View style={[styles.memberCard, member.opacity !== undefined && { opacity: member.opacity }]}>
            <View style={styles.memberInfoRow}>
                {member.avatar ? (
                    <Image source={{ uri: member.avatar }} style={styles.avatar} />
                ) : (
                    <View style={[
                        styles.initialsAvatar,
                        member.initialsBg
                            ? { backgroundColor: member.initialsBg, borderColor: member.initialsBorder }
                            : { backgroundColor: '#374151', borderColor: '#4b5563' }
                    ]}>
                        <Text style={[
                            styles.initialsText,
                            member.initialsColor
                                ? { color: member.initialsColor }
                                : { color: '#9ca3af' }
                        ]}>
                            {member.initials}
                        </Text>
                    </View>
                )}
                <View style={styles.textCol}>
                    <Text style={styles.nameText}>{member.name}</Text>
                    <Text style={styles.phoneText}>{member.phone}</Text>
                </View>
            </View>
            <View style={[
                styles.statusBadge,
                { backgroundColor: member.darkStatusBg, borderColor: member.borderColor }
            ]}>
                <Text style={[styles.statusText, { color: member.darkStatusColor }]}>
                    {member.status}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    memberCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1c2333',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d3748',
        marginBottom: 8,
    },
    memberInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#374151',
    },
    initialsAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    initialsText: {
        fontSize: 16,
        fontWeight: '700',
    },
    textCol: {
        flex: 1,
        gap: 2,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    phoneText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9ca3af',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
