import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';
import { GlobalRole } from '../../core/constants/enums';
import { StatusBar } from 'expo-status-bar';

// UI FROZEN — Activities render backend facts only. No interpretation permitted.

interface AuditEvent {
    description: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    timestamp: string;
}

export const ActivitiesTabScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();
    const [activities, setActivities] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchActivities = async () => {
        try {
            const endpoint = user?.role === GlobalRole.ADMIN ? '/audit-events' : '/audit-events/my';
            const response = await ApiClient.get<any>(endpoint);

            if (response && Array.isArray(response.data)) {
                setActivities(response.data);
            } else if (Array.isArray(response)) {
                setActivities(response);
            } else {
                setActivities([]);
            }
        } catch (error) {
            console.error('[ActivitiesTabScreen] Fetch error:', error);
            setActivities([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [user?.role]);

    const renderItem = ({ item }: { item: AuditEvent }) => {
        const severityColor =
            item.severity === 'CRITICAL' ? '#ef4444' :
                item.severity === 'WARNING' ? '#f59e0b' :
                    '#3b82f6';

        return (
            <View style={styles.activityItem}>
                <View style={[styles.severityIndicator, { backgroundColor: severityColor }]} />
                <View style={styles.activityContent}>
                    <Text style={styles.description}>{item.description}</Text>
                    <Text style={styles.timestamp}>
                        {new Date(item.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                    </Text>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator color="#3b82f6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.title}>Operation Ledger</Text>
                <Text style={styles.subtitle}>Deterministic Append-Only record</Text>
            </View>

            <FlatList
                data={activities}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    fetchActivities();
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyTitle}>Zero records</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 10,
        color: '#444444',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#0a0a0a',
    },
    severityIndicator: {
        width: 2,
        height: 12,
        marginRight: 16,
    },
    activityContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    description: {
        fontSize: 13,
        fontWeight: '600',
        color: '#cccccc',
        fontFamily: 'monospace',
    },
    timestamp: {
        fontSize: 10,
        color: '#333333',
        fontFamily: 'monospace',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#222222',
        textTransform: 'uppercase',
    },
});
