import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ApiClient } from '../services/api_client';
import { SystemVersionDto, IntegrityCheckResultDto } from '../../domain/dtos';
import { OPS_THEME } from '../../core/theme/ops_theme';

/**
 * PANEL 5: SYSTEM VERIFICATION & CONTROLLED INTERVENTION
 * 
 * Design Philosophy:
 * - Verification over control
 * - Explicit intent over convenience
 * - Calm, non-reactive presentation
 * - "Control Room" feel, not "Dashboard"
 */

export const SystemVerificationScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [version, setVersion] = useState<SystemVersionDto | null>(null);
    const [lastResult, setLastResult] = useState<IntegrityCheckResultDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);

    const fetchSystemState = async () => {
        try {
            const versionData = await ApiClient.get<SystemVersionDto>('/system/version');
            setVersion(versionData);
        } catch (error) {
            console.error('[SystemVerification] Error:', error);
            Alert.alert('System Error', 'Unable to reach system control plane.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSystemState();
    }, []);

    const handleRunIntegrityCheck = async () => {
        if (!acknowledged) return;
        setExecuting(true);
        setLastResult(null);

        try {
            const result = await ApiClient.get<IntegrityCheckResultDto>('/system/integrity-check');
            setLastResult(result);
            const versionData = await ApiClient.get<SystemVersionDto>('/system/version');
            setVersion(versionData);
        } catch (error: any) {
            console.error('[IntegrityCheck] Failed:', error);
            Alert.alert('Verification Failed', 'System integrity verification could not complete.');
        } finally {
            setExecuting(false);
            setAcknowledged(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerParams}>
                    <ActivityIndicator size="large" color={OPS_THEME.colors.text.secondary} />
                    <Text style={styles.loadingText}>INITIALIZING CONSOLE...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const isDegraded = version?.isDegraded || lastResult?.isDegraded;
    const modeColor = isDegraded ? OPS_THEME.colors.status.critical : OPS_THEME.colors.status.success;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <ScrollView contentContainerStyle={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>SYSTEM VERIFICATION</Text>
                    <Text style={styles.headerSub}>CONTROLLED INTERVENTION CONSOLE</Text>
                </View>

                {/* Section 1: System State */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>CURRENT OPERATING MODE</Text>
                    <View style={[styles.modeDisplay, { borderLeftColor: modeColor }]}>
                        <View style={[styles.statusDot, { backgroundColor: modeColor }]} />
                        <Text style={[styles.modeText, { color: modeColor }]}>
                            {isDegraded ? 'DEGRADED / READ-ONLY' : 'GREEN / NORMAL OPERATIONS'}
                        </Text>
                    </View>

                    <View style={styles.metaGrid}>
                        <MetaItem label="RELEASE VERSION" value={version?.version || 'Unknown'} />
                        <MetaItem label="BUILD HASH" value={version?.commit?.substring(0, 8) || 'Unknown'} />
                        <MetaItem label="WRITE LOCK" value={isDegraded ? 'ACTIVE (LOCKED)' : 'INACTIVE (OPEN)'} />
                        <MetaItem label="SERVER TIME" value={new Date().toLocaleTimeString()} />
                    </View>
                </View>

                {/* Section 2: Integrity Verification */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>MANUAL VERIFICATION CONTROL</Text>
                    <View style={styles.controlPanel}>
                        <Text style={styles.warningText}>
                            Running full integrity verification will scan all ledgers.
                            System performance may be impacted during execution.
                        </Text>

                        <View style={styles.ackRow}>
                            <Switch
                                value={acknowledged}
                                onValueChange={setAcknowledged}
                                trackColor={{ false: OPS_THEME.colors.bg.highlight, true: OPS_THEME.colors.status.warning }}
                                thumbColor={OPS_THEME.colors.text.primary}
                            />
                            <Text style={styles.ackText}>I acknowledge the impact of this operation.</Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.executeButton,
                                (!acknowledged || executing) && styles.executeButtonDisabled
                            ]}
                            disabled={!acknowledged || executing}
                            onPress={handleRunIntegrityCheck}
                        >
                            {executing ? (
                                <ActivityIndicator color={OPS_THEME.colors.bg.app} />
                            ) : (
                                <Text style={styles.executeButtonText}>RUN INTEGRITY CHECK</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section 3: Result Surface */}
                {lastResult && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>VERIFICATION RESULT LOG</Text>
                        <View style={styles.logConsole}>
                            <Text style={styles.consoleLine}>
                                <Text style={{ color: OPS_THEME.colors.text.tertiary }}>[{new Date(lastResult.timestamp).toLocaleTimeString()}] </Text>
                                EXECUTION_COMPLETE
                            </Text>
                            <Text style={styles.consoleLine}>
                                <Text style={{ color: OPS_THEME.colors.text.tertiary }}>[STATUS] </Text>
                                <Text style={{ color: lastResult.isDegraded ? OPS_THEME.colors.status.critical : OPS_THEME.colors.status.success, fontWeight: 'bold' }}>
                                    {lastResult.isDegraded ? 'FAIL' : 'PASS'}
                                </Text>
                            </Text>

                            {lastResult.violations && lastResult.violations.length > 0 ? (
                                <View style={{ marginTop: 8 }}>
                                    <Text style={[styles.consoleLine, { color: OPS_THEME.colors.status.critical }]}>VIOLATIONS DETECTED:</Text>
                                    {lastResult.violations.map((v, i) => (
                                        <Text key={i} style={styles.consoleLine}>   - {v}</Text>
                                    ))}
                                    <Text style={[styles.consoleLine, { color: OPS_THEME.colors.status.critical, marginTop: 8 }]}>
                                        SYSTEM AUTOMATICALLY SET TO DEGRADED MODE.
                                    </Text>
                                </View>
                            ) : (
                                <Text style={[styles.consoleLine, { color: OPS_THEME.colors.status.success, marginTop: 8 }]}>NO VIOLATIONS FOUND. SYSTEM INTEGRITY VERIFIED.</Text>
                            )}
                        </View>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const MetaItem = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.metaItem}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: OPS_THEME.colors.bg.app },
    container: { padding: OPS_THEME.layout.screenPadding, paddingBottom: 40 },
    centerParams: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: {
        color: OPS_THEME.colors.text.secondary,
        marginTop: 16,
        fontSize: OPS_THEME.typography.size.sm,
        letterSpacing: OPS_THEME.typography.spacing.loose,
        fontFamily: 'monospace'
    },

    header: { marginBottom: 40, borderBottomWidth: 1, borderBottomColor: OPS_THEME.colors.border.subtle, paddingBottom: 20 },
    headerTitle: {
        fontSize: OPS_THEME.typography.size.xl,
        fontWeight: OPS_THEME.typography.weight.black as any,
        color: OPS_THEME.colors.text.primary,
        letterSpacing: OPS_THEME.typography.spacing.wide
    },
    headerSub: {
        fontSize: OPS_THEME.typography.size.xs,
        color: OPS_THEME.colors.text.tertiary,
        marginTop: 4,
        letterSpacing: OPS_THEME.typography.spacing.loose,
        textTransform: 'uppercase'
    },

    section: { marginBottom: 32 },
    sectionLabel: {
        fontSize: OPS_THEME.typography.size.xs,
        fontWeight: 'bold',
        color: OPS_THEME.colors.text.secondary,
        marginBottom: 12,
        letterSpacing: OPS_THEME.typography.spacing.loose
    },

    modeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderRadius: OPS_THEME.layout.borderRadius,
        borderLeftWidth: 4,
        marginBottom: 16,
    },
    statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    modeText: {
        fontSize: OPS_THEME.typography.size.base,
        fontWeight: OPS_THEME.typography.weight.black as any,
        letterSpacing: OPS_THEME.typography.spacing.tight
    },

    metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    metaItem: { width: '45%' },
    metaLabel: {
        fontSize: OPS_THEME.typography.size.xs,
        color: OPS_THEME.colors.text.tertiary,
        marginBottom: 2,
        textTransform: 'uppercase'
    },
    metaValue: {
        fontSize: OPS_THEME.typography.size.sm,
        color: OPS_THEME.colors.text.mono,
        fontFamily: 'monospace'
    },

    controlPanel: {
        backgroundColor: OPS_THEME.colors.bg.surface,
        padding: 20,
        borderRadius: OPS_THEME.layout.borderRadius,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
    },
    warningText: {
        fontSize: OPS_THEME.typography.size.sm,
        color: OPS_THEME.colors.text.secondary,
        lineHeight: 20,
        marginBottom: 20
    },

    ackRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    ackText: { fontSize: OPS_THEME.typography.size.sm, color: OPS_THEME.colors.text.primary },

    executeButton: {
        backgroundColor: OPS_THEME.colors.text.primary,
        padding: 16,
        alignItems: 'center',
        borderRadius: OPS_THEME.layout.borderRadius,
    },
    executeButtonDisabled: {
        backgroundColor: OPS_THEME.colors.bg.highlight,
        opacity: 0.5,
    },
    executeButtonText: {
        color: OPS_THEME.colors.bg.app,
        fontWeight: OPS_THEME.typography.weight.black as any,
        fontSize: OPS_THEME.typography.size.sm,
        letterSpacing: OPS_THEME.typography.spacing.wide,
    },

    logConsole: {
        backgroundColor: OPS_THEME.colors.bg.panel,
        padding: 16,
        borderRadius: OPS_THEME.layout.borderRadius,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
        minHeight: 100,
    },
    consoleLine: {
        fontFamily: 'monospace',
        fontSize: OPS_THEME.typography.size.sm,
        color: OPS_THEME.colors.text.mono,
        marginBottom: 4,
    }
});
