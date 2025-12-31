import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { AuditEventDto } from '../../domain/dtos';
import { GlassCard } from '../components/GlassCard';

export const AuditTrailScreen: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
    const { equbId } = route.params;
    const [events, setEvents] = useState<AuditEventDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuditEvents();
    }, [equbId]);

    const fetchAuditEvents = async () => {
        setLoading(true);
        try {
            // HUMBLE: Fetching absolute truth from backend audit log
            const data = await ApiClient.get<AuditEventDto[]>(`/equbs/${equbId}/audit-events`);
            setEvents(data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderEvent = ({ item }: { item: AuditEventDto }) => (
        <GlassCard padding="md" style={styles.eventCard}>
            <View style={styles.eventHeader}>
                <Text style={styles.actionType}>{item.actionType}</Text>
                <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <View style={styles.eventBody}>
                <Text style={styles.actorLabel}>Actor: <Text style={styles.actorValue}>{item.actorUserId} ({item.actorRole})</Text></Text>
                <Text style={styles.entityLabel}>Entity: <Text style={styles.entityValue}>{item.entityType} [{item.entityId}]</Text></Text>
                {item.payload && (
                    <View style={styles.payloadBox}>
                        <Text style={styles.payloadText}>{JSON.stringify(item.payload, null, 2)}</Text>
                    </View>
                )}
            </View>
        </GlassCard>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Audit Trail</Text>
                    <Text style={styles.subtitle}>Immutable History of Truth</Text>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={(item) => item.id}
                        renderItem={renderEvent}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No events recorded yet.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Theme.colors.background },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
    title: { ...Theme.typography.h1, color: Theme.colors.text.primary },
    subtitle: { ...Theme.typography.caption, color: Theme.colors.text.secondary },
    listContent: { padding: 20 },
    eventCard: { marginBottom: 16 },
    eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    actionType: { ...Theme.typography.body, color: Theme.colors.primary, fontWeight: 'bold' },
    timestamp: { ...Theme.typography.caption, color: Theme.colors.text.secondary },
    eventBody: { gap: 4 },
    actorLabel: { ...Theme.typography.caption, color: Theme.colors.text.secondary },
    actorValue: { color: Theme.colors.text.primary, fontWeight: 'bold' },
    entityLabel: { ...Theme.typography.caption, color: Theme.colors.text.secondary },
    entityValue: { color: Theme.colors.text.primary },
    payloadBox: {
        marginTop: 8,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
        borderLeftWidth: 2,
        borderLeftColor: Theme.colors.primary
    },
    payloadText: { fontSize: 10, color: Theme.colors.text.secondary, fontFamily: 'Courier' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyText: { ...Theme.typography.body, color: Theme.colors.text.secondary, fontStyle: 'italic' },
});
