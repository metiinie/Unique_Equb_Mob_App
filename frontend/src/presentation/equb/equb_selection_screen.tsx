import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { EqubDto } from '../../domain/dtos';
import { useEqubContext } from '../../application/equb/equb_context';
import { EqubStatus } from '../../core/constants/enums';

export const EqubSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { setActiveEqubId, setActiveEqubName } = useEqubContext();
    const [equbs, setEqubs] = useState<EqubDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEqubs();
    }, []);

    const fetchEqubs = async () => {
        setLoading(true);
        try {
            // HUMBLE: Asking backend for Equbs
            const data = await ApiClient.get<EqubDto[]>('/equbs');
            setEqubs(data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEqub = (equb: EqubDto) => {
        setActiveEqubId(equb.id);
        setActiveEqubName(equb.name);
        navigation.navigate('EqubOverview', { equbId: equb.id });
    };

    const getStatusStyle = (status: EqubStatus) => {
        switch (status) {
            case EqubStatus.ACTIVE:
                return styles.statusBadgeActive;
            case EqubStatus.ON_HOLD:
                return styles.statusBadgeHold;
            case EqubStatus.COMPLETED:
                return styles.statusBadgeCompleted;
            case EqubStatus.TERMINATED:
                return styles.statusBadgeTerminated;
            default:
                return styles.statusBadgeDraft;
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Your Equbs</Text>
                    <Text style={styles.headerSubtitle}>Select an Equb to manage</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {equbs.map((equb) => (
                        <TouchableOpacity
                            key={equb.id}
                            style={styles.equbCard}
                            onPress={() => handleSelectEqub(equb)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.equbName}>{equb.name}</Text>
                                <View style={[styles.statusBadge, getStatusStyle(equb.status)]}>
                                    <Text style={styles.statusText}>{equb.status}</Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Amount</Text>
                                    <Text style={styles.infoValue}>{equb.amount} {equb.currency}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Frequency</Text>
                                    <Text style={styles.infoValue}>{equb.frequency}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Progress</Text>
                                    <Text style={styles.infoValue}>Round {equb.currentRound} of {equb.totalRounds}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {equbs.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>📋</Text>
                            <Text style={styles.emptyTitle}>No Equbs Found</Text>
                            <Text style={styles.emptyDesc}>You are not currently enrolled in any Equbs.</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Theme.colors.background },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background },
    header: { padding: 20, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
    headerTitle: { ...Theme.typography.h1, color: Theme.colors.text.primary },
    headerSubtitle: { ...Theme.typography.caption, color: Theme.colors.text.secondary, marginTop: 4 },
    scrollContent: { padding: 20 },
    equbCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    equbName: { ...Theme.typography.h3, color: Theme.colors.text.primary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusBadgeActive: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
    statusBadgeHold: { backgroundColor: 'rgba(234, 179, 8, 0.1)' },
    statusBadgeCompleted: { backgroundColor: 'rgba(100, 116, 139, 0.1)' },
    statusBadgeTerminated: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    statusBadgeDraft: { backgroundColor: 'rgba(148, 163, 184, 0.1)' },
    statusText: { fontSize: 10, fontWeight: 'bold', color: Theme.colors.text.primary },
    cardBody: { gap: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    infoLabel: { ...Theme.typography.caption, color: Theme.colors.text.secondary },
    infoValue: { ...Theme.typography.body, color: Theme.colors.text.primary, fontWeight: 'bold' },
    emptyState: { alignItems: 'center', marginTop: 100 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { ...Theme.typography.h3, color: Theme.colors.text.primary },
    emptyDesc: { ...Theme.typography.body, color: Theme.colors.text.secondary, textAlign: 'center' },
});
