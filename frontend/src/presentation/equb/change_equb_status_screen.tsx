import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Theme } from '../theme';
import { AppHeader } from '../components/AppHeader';
import { TextInput } from '../components/TextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { GlassCard } from '../components/GlassCard';
import { ApiClient } from '../services/api_client';
import { EqubStatus } from '../../core/constants/enums';

export const ChangeEqubStatusScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const [equbId, setEqubId] = useState(route.params?.equbId?.value || '');
    const [newStatus, setNewStatus] = useState<string>(route.params?.currentStatus || '');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const statuses = ['draft', 'planned', 'active', 'completed', 'canceled'];

    const handleSubmit = async () => {
        if (!equbId || !newStatus) {
            Alert.alert('Missing Info', 'Equb ID and Status are required.');
            return;
        }

        setLoading(true);
        try {
            await ApiClient.postCommand('/api/change-equb-status', {
                equbId,
                newStatus,
                reason: reason.trim() || undefined,
            });

            Alert.alert('Status Updated', `Equb is now ${newStatus.toUpperCase()}`, [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Status Change Failed', error.message || 'The domain rejected this transition.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Lifecycle Management" onBack={() => navigation.goBack()} />

            <ScrollView contentContainerStyle={styles.content}>
                <GlassCard padding="lg">
                    <Text style={[Theme.typography.h3, { marginBottom: Theme.spacing.md }]}>
                        Transition Target
                    </Text>

                    <TextInput
                        label="Equb ID"
                        value={equbId}
                        onChangeText={setEqubId}
                        placeholder="e.g. equb-1"
                        editable={!loading}
                    />

                    <Text style={[Theme.typography.caption, styles.label]}>New Lifecycle State</Text>
                    <View style={styles.chipRow}>
                        {statuses.map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={[
                                    styles.chip,
                                    newStatus === s && styles.activeChip
                                ]}
                                onPress={() => setNewStatus(s)}
                                disabled={loading}
                            >
                                <Text style={[
                                    styles.chipText,
                                    newStatus === s && styles.activeChipText
                                ]}>
                                    {s.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {(newStatus === 'canceled' || newStatus === 'onHold') && (
                        <TextInput
                            label="Reason for Change"
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Mandatory for this transition"
                            multiline
                            numberOfLines={3}
                            editable={!loading}
                        />
                    )}

                    <View style={styles.footer}>
                        <PrimaryButton
                            label="Apply Transition"
                            onPress={handleSubmit}
                            loading={loading}
                        />
                        <Text style={styles.guaranteeText}>
                            ⚠️ Lifecycle changes affect all members immediately.
                        </Text>
                    </View>
                </GlassCard>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    content: {
        padding: Theme.spacing.md,
    },
    label: {
        marginBottom: Theme.spacing.xs,
        color: Theme.colors.text.secondary,
        textTransform: 'uppercase',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Theme.spacing.sm,
        marginBottom: Theme.spacing.md,
    },
    chip: {
        paddingHorizontal: Theme.spacing.md,
        paddingVertical: Theme.spacing.sm,
        borderRadius: Theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        backgroundColor: Theme.colors.surface,
    },
    activeChip: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    chipText: {
        ...Theme.typography.caption,
        color: Theme.colors.text.secondary,
    },
    activeChipText: {
        color: Theme.colors.text.inverted,
    },
    footer: {
        marginTop: Theme.spacing.lg,
    },
    guaranteeText: {
        ...Theme.typography.caption,
        textAlign: 'center',
        marginTop: Theme.spacing.md,
        fontStyle: 'italic',
    }
});
