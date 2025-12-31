import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { AdminSummary } from '../../domain/entities/admin_summary';
import { EqubRepository } from '../../domain/repositories/equb_repository';
import { UserId } from '../../domain/value_objects/ids';
import { MockEqubRepository } from '../../infrastructure/mock/mock_equb_repository';

interface AdminSummaryScreenProps {
    adminId: UserId;
    repository?: EqubRepository;
}

export const AdminSummaryScreen: React.FC<AdminSummaryScreenProps> = ({
    adminId,
    repository = new MockEqubRepository(),
}) => {
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        repository.getAdminSummary(adminId).then((data) => {
            if (mounted) {
                setSummary(data);
                setLoading(false);
            }
        }).catch(() => {
            // Handle error or just stop loading (as per simple FutureBuilder logic)
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
        };
    }, [adminId, repository]);

    if (loading || !summary) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.appBar}>
                <Text style={styles.appBarTitle}>Admin Summary (Global)</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.italicText}>
                    Numbers only. No charts. Admin-only.
                </Text>
                <View style={styles.spacer} />
                <Row label="Total Equbs managed" value={summary.totalEqubs} />
                <Row label="Collected contributions" value={summary.collectedContributions} />
                <Row label="Missed contributions" value={summary.missedContributions} />
                <Row label="Completed payouts" value={summary.completedPayouts} />
            </ScrollView>
        </View>
    );
};

const Row: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value.toString()}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appBar: {
        height: 56,
        backgroundColor: '#fff', // Or primary color
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    appBarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    italicText: {
        fontStyle: 'italic',
        marginBottom: 16,
    },
    spacer: {
        height: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    rowLabel: {
        fontSize: 14,
    },
    rowValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
