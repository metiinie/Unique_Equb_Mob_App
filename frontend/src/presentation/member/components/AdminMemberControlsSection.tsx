import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Pure Section Component: Admin-specific member controls
// Shows bulk actions, overdue highlights, and export options
// Visible only when role === ADMIN

interface AdminMemberControlsSectionProps {
    navigation?: any;
    onFilterPress?: () => void;
}

export const AdminMemberControlsSection: React.FC<AdminMemberControlsSectionProps> = ({
    navigation,
    onFilterPress,
}) => {
    // Mock data - in production, this would come from context or props
    const overdueCount = 2;

    return (
        <View style={styles.section}>
            {/* Overdue Alert */}
            {overdueCount > 0 && (
                <View style={styles.alertCard}>
                    <Text style={styles.alertIcon}>⚠️</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Attention Required</Text>
                        <Text style={styles.alertText}>
                            {overdueCount} member{overdueCount > 1 ? 's' : ''} overdue on contributions
                        </Text>
                    </View>
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionsCard}>
                <Text style={styles.actionsTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionIcon}>✓</Text>
                        <Text style={styles.actionText}>Mark Paid</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionIcon}>📨</Text>
                        <Text style={styles.actionText}>Send Reminder</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionIcon}>📊</Text>
                        <Text style={styles.actionText}>Export</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={onFilterPress}
                    >
                        <Text style={styles.actionIcon}>⚙️</Text>
                        <Text style={styles.actionText}>Filter</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    /* Overdue Alert */
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    alertIcon: {
        fontSize: 24,
    },
    alertContent: {
        flex: 1,
        gap: 2,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#f87171',
    },
    alertText: {
        fontSize: 13,
        color: '#fca5a5',
    },
    /* Quick Actions */
    actionsCard: {
        backgroundColor: '#1c2333',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    actionsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2d3748',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#374151',
    },
    actionIcon: {
        fontSize: 16,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#cbd5e1',
    },
});
