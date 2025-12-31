import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { ApiClient } from '../services/api_client';

export const ActivitiesTabScreen: React.FC = () => {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await ApiClient.get('/audit-events/my');
                setActivities(data as any[]);
            } catch (error) {
                console.error('[ActivitiesTabScreen] Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator color="#2b6cee" style={{ marginTop: 40 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Activities</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activities.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📜</Text>
                        <Text style={styles.emptyTitle}>No Activities Yet</Text>
                        <Text style={styles.emptyText}>
                            Your Equb activities will appear here once you join an Equb or perform actions like contributions.
                        </Text>
                    </View>
                ) : (
                    activities.map((item) => (
                        <View key={item.id} style={styles.activityCard}>
                            <View style={styles.activityIcon}>
                                <Text>⚡</Text>
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.actionType}>{item.actionType.replace(/_/g, ' ')}</Text>
                                <Text style={styles.entityInfo}>{item.entityType}: {item.entityId}</Text>
                                <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101622',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
    },
    scrollContent: {
        padding: 16,
    },
    activityCard: {
        flexDirection: 'row',
        backgroundColor: '#1c2333',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityInfo: {
        flex: 1,
    },
    actionType: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
        textTransform: 'capitalize',
    },
    entityInfo: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 2,
    },
    timestamp: {
        color: '#64748b',
        fontSize: 10,
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
    },
});
