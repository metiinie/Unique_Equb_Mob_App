import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MemberCard, Member } from './MemberCard';

// Shared Component: Members List
// Renders a list of member cards
// Used by both Member and Admin roles

interface SharedMembersListProps {
    members: Member[];
}

export const SharedMembersList: React.FC<SharedMembersListProps> = ({ members }) => {
    return (
        <View style={styles.listGap}>
            {members.map((member) => (
                <MemberCard key={member.id} member={member} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    listGap: {
        gap: 12,
        paddingHorizontal: 16,
    },
});
