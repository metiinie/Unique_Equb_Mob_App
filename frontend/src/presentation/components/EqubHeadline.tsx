import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useEqubContext } from '../../application/equb/equb_context';

// Shared Equb Headline Component
// Displays active Equb name and metadata
// Used across all home dashboards for consistency

interface EqubHeadlineProps {
    metadata?: string; // Optional: "Group ID: #88392 • Weekly Round"
}

export const EqubHeadline: React.FC<EqubHeadlineProps> = ({ metadata }) => {
    const { activeEqubName } = useEqubContext();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {activeEqubName || 'No Active Equb'}
            </Text>
            {metadata && (
                <Text style={styles.metadata}>{metadata}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    metadata: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
});
