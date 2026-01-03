import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OPS_THEME } from '../../core/theme/ops_theme';
import { ApiClient } from '../services/api_client';
import { CreateEqubRequestDto, PayoutOrderType, ManagedEqubDto } from '../../domain/dtos';

/**
 * PRODUCTION-GRADE CREATE EQUB WIZARD
 * 
 * Rules:
 * - Multi-step validation
 * - No auto-submit
 * - Single backend write at the end
 * - Strict financial clarity
 */

enum WizardStep {
    IDENTITY = 1,
    STRUCTURE = 2,
    PAYOUT = 3,
    TIMING = 4,
    REVIEW = 5,
}

export const CreateEqubScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [step, setStep] = useState<WizardStep>(WizardStep.IDENTITY);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [members, setMembers] = useState('');
    const [cycleLength, setCycleLength] = useState('30'); // Default monthly (30 days)
    const [cycleType, setCycleType] = useState<'DAYS' | 'WEEKS'>('DAYS');
    const [payoutType, setPayoutType] = useState<PayoutOrderType>(PayoutOrderType.FIXED);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [autoActivate, setAutoActivate] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    // Step Status Checks
    const isStep1Valid = name.trim().length >= 3 && Number(amount) > 0;
    const isStep2Valid = Number(members) >= 2 && Number(cycleLength) > 0;
    const isStep3Valid = true; // Selector always has value
    const isStep4Valid = startDate.length === 10; // Simple date check provided native picker might be better but keeping simple input for strict control
    const isStep5Valid = confirmed;

    const nextStep = () => {
        if (step === WizardStep.IDENTITY && isStep1Valid) setStep(WizardStep.STRUCTURE);
        else if (step === WizardStep.STRUCTURE && isStep2Valid) setStep(WizardStep.PAYOUT);
        else if (step === WizardStep.PAYOUT && isStep3Valid) setStep(WizardStep.TIMING);
        else if (step === WizardStep.TIMING && isStep4Valid) setStep(WizardStep.REVIEW);
    };

    const prevStep = () => {
        if (step > WizardStep.IDENTITY) setStep(step - 1);
        else navigation.goBack();
    };

    const handleSubmit = async () => {
        if (!confirmed || submitting) return;

        setSubmitting(true);
        try {
            const finalCycleLength = cycleType === 'WEEKS' ? Number(cycleLength) * 7 : Number(cycleLength);

            const payload: CreateEqubRequestDto = {
                name: name.trim(),
                contributionAmount: Number(amount),
                cycleLength: finalCycleLength,
                startDate: new Date(startDate).toISOString(),
                payoutOrderType: payoutType,
                totalRounds: Number(members), // Assuming 1 round per member for standard structure
            };

            const result = await ApiClient.post<ManagedEqubDto | any>('/equbs', payload);

            Alert.alert(
                'Equb Created',
                'The Equb has been successfully initialized in DRAFT state.',
                [{ text: 'View Details', onPress: () => navigation.replace('EqubDetail', { equbId: result.id || result.data?.id }) }]
            );

        } catch (error) {
            console.error('Creation Failed:', error);
            Alert.alert('Creation Failed', 'System rejected the Equb definition. Please verify parameters.');
        } finally {
            setSubmitting(false);
        }
    };

    // Derived Financials
    const totalPoolPerRound = (Number(amount) || 0) * (Number(members) || 0);
    const totalLifetimeVal = totalPoolPerRound * (Number(members) || 0); // Total money moved

    // --- STEP RENDERERS ---

    const renderStep1_Identity = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 1: Identity & Value</Text>
            <Text style={styles.inputLabel}>EQUB NAME</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Addis Traders Circle"
                placeholderTextColor={OPS_THEME.colors.text.tertiary}
                value={name}
                onChangeText={setName}
            />

            <Text style={styles.inputLabel}>CONTRIBUTION AMOUNT (ETB)</Text>
            <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={OPS_THEME.colors.text.tertiary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
            {Number(amount) > 0 && (
                <Text style={styles.hintText}>Each member will contribute ETB {Number(amount).toLocaleString()} per round.</Text>
            )}
        </View>
    );

    const renderStep2_Structure = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 2: Structure & Duration</Text>

            <Text style={styles.inputLabel}>TOTAL MEMBERS (ROUNDS)</Text>
            <TextInput
                style={styles.input}
                placeholder="Number of participants"
                placeholderTextColor={OPS_THEME.colors.text.tertiary}
                keyboardType="number-pad"
                value={members}
                onChangeText={setMembers}
            />

            <Text style={styles.inputLabel}>CYCLE FREQUENCY</Text>
            <View style={styles.row}>
                <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="30"
                    placeholderTextColor={OPS_THEME.colors.text.tertiary}
                    keyboardType="number-pad"
                    value={cycleLength}
                    onChangeText={setCycleLength}
                />
                <View style={styles.toggleGroup}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, cycleType === 'DAYS' && styles.toggleBtnActive]}
                        onPress={() => setCycleType('DAYS')}
                    >
                        <Text style={[styles.toggleText, cycleType === 'DAYS' && styles.toggleTextActive]}>DAYS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, cycleType === 'WEEKS' && styles.toggleBtnActive]}
                        onPress={() => setCycleType('WEEKS')}
                    >
                        <Text style={[styles.toggleText, cycleType === 'WEEKS' && styles.toggleTextActive]}>WEEKS</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Educational Facts */}
            {Number(members) > 0 && Number(amount) > 0 && (
                <View style={styles.factBox}>
                    <Text style={styles.factTitle}>STRUCTURE PREVIEW</Text>
                    <Text style={styles.factRow}>• Pool per round: <Text style={styles.mono}>ETB {totalPoolPerRound.toLocaleString()}</Text></Text>
                    <Text style={styles.factRow}>• Total Rounds: <Text style={styles.mono}>{Number(members)}</Text></Text>
                </View>
            )}
        </View>
    );

    const renderStep3_Payout = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 3: Payout Logic</Text>

            <TouchableOpacity
                style={[styles.selectionCard, payoutType === PayoutOrderType.FIXED && styles.selectionCardActive]}
                onPress={() => setPayoutType(PayoutOrderType.FIXED)}
            >
                <Text style={styles.selectionTitle}>ROTATIONAL (Recommended)</Text>
                <Text style={styles.selectionDesc}>Members receive payouts in a pre-determined or agreed-upon sequence.</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.selectionCard, payoutType === PayoutOrderType.RANDOM && styles.selectionCardWarning]}
                onPress={() => setPayoutType(PayoutOrderType.RANDOM)}
            >
                <Text style={[styles.selectionTitle, payoutType === PayoutOrderType.RANDOM && { color: OPS_THEME.colors.status.warning }]}>RANDOM / LOTTERY</Text>
                <Text style={styles.selectionDesc}>Winner is chosen by system RNG each round.</Text>
            </TouchableOpacity>

            {payoutType === PayoutOrderType.RANDOM && (
                <View style={styles.warningBlock}>
                    <Text style={styles.warningText}>⚠️ Random payout order cannot be reversed. This may cause disputes if members expect a schedule.</Text>
                </View>
            )}
        </View>
    );

    const renderStep4_Timing = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 4: Activation</Text>

            <Text style={styles.inputLabel}>START DATE (YYYY-MM-DD)</Text>
            <TextInput
                style={styles.input}
                placeholder="2024-01-01"
                placeholderTextColor={OPS_THEME.colors.text.tertiary}
                value={startDate}
                onChangeText={setStartDate}
            />

            <View style={styles.rowCentered}>
                <Text style={styles.labelSimple}>Auto-activate on start?</Text>
                <Switch
                    value={autoActivate}
                    onValueChange={setAutoActivate}
                    trackColor={{ false: OPS_THEME.colors.bg.highlight, true: OPS_THEME.colors.status.success }}
                />
            </View>
            <Text style={styles.hintText}>
                {autoActivate
                    ? "System will automatically open the first round on the start date."
                    : "You must manually click 'Start Equb' after creation."}
            </Text>
        </View>
    );

    const renderStep5_Review = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Step 5: Review & Seal</Text>

            <View style={styles.reviewCard}>
                <ReviewRow label="Name" value={name} />
                <ReviewRow label="Contribution" value={`ETB ${Number(amount).toLocaleString()}`} />
                <ReviewRow label="Total Members" value={members} />
                <ReviewRow label="Frequency" value={`Every ${cycleLength} ${cycleType}`} />
                <ReviewRow label="Payout Type" value={payoutType} />
                <ReviewRow label="Start Date" value={startDate} />

                <View style={styles.divider} />

                <Text style={styles.totalFlowLabel}>TOTAL MONEY FLOW</Text>
                <Text style={styles.totalFlowValue}>ETB {totalLifetimeVal.toLocaleString()}</Text>
            </View>

            <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setConfirmed(!confirmed)}
                activeOpacity={0.8}
            >
                <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                    {confirmed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>
                    I confirm this Equb structure is correct and cannot be changed after activation.
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                        <Text style={styles.backText}>← {step === 1 ? 'Cancel' : 'Back'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create New Equb</Text>
                    <View style={{ width: 60 }} />
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${(step / 5) * 100}%` }]} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {step === WizardStep.IDENTITY && renderStep1_Identity()}
                    {step === WizardStep.STRUCTURE && renderStep2_Structure()}
                    {step === WizardStep.PAYOUT && renderStep3_Payout()}
                    {step === WizardStep.TIMING && renderStep4_Timing()}
                    {step === WizardStep.REVIEW && renderStep5_Review()}
                </ScrollView>

                <View style={styles.footer}>
                    {step < WizardStep.REVIEW ? (
                        <TouchableOpacity
                            style={[styles.btnPrimary, !((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid) || (step === 3 && isStep3Valid) || (step === 4 && isStep4Valid)) && styles.btnDisabled]}
                            disabled={!((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid) || (step === 3 && isStep3Valid) || (step === 4 && isStep4Valid))}
                            onPress={nextStep}
                        >
                            <Text style={styles.btnText}>Next Step</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.btnSuccess, (!confirmed || submitting) && styles.btnDisabled]}
                            disabled={!confirmed || submitting}
                            onPress={handleSubmit}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.btnText}>INITIALIZE EQUB</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const ReviewRow = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.reviewRow}>
        <Text style={styles.reviewLabel}>{label}</Text>
        <Text style={styles.reviewValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: OPS_THEME.colors.bg.app },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    headerTitle: { color: OPS_THEME.colors.text.primary, fontSize: 16, fontWeight: 'bold' },
    backButton: { padding: 8 },
    backText: { color: OPS_THEME.colors.text.secondary },

    progressBarBg: { height: 4, backgroundColor: OPS_THEME.colors.bg.highlight, width: '100%' },
    progressBarFill: { height: 4, backgroundColor: OPS_THEME.colors.text.primary },

    scrollContent: { padding: 20 },
    stepContainer: { flex: 1 },
    stepTitle: { fontSize: 24, fontWeight: 'bold', color: OPS_THEME.colors.text.primary, marginBottom: 24 },

    inputLabel: { fontSize: 12, fontWeight: 'bold', color: OPS_THEME.colors.text.tertiary, marginBottom: 8, letterSpacing: 1 },
    input: {
        backgroundColor: OPS_THEME.colors.bg.surface,
        color: OPS_THEME.colors.text.primary,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
        fontSize: 16,
        marginBottom: 20
    },

    hintText: { color: OPS_THEME.colors.text.secondary, fontSize: 14, marginBottom: 20 },

    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    toggleGroup: { flexDirection: 'row', borderWidth: 1, borderColor: OPS_THEME.colors.border.subtle, borderRadius: 8, overflow: 'hidden' },
    toggleBtn: { paddingVertical: 16, paddingHorizontal: 20, backgroundColor: OPS_THEME.colors.bg.surface },
    toggleBtnActive: { backgroundColor: OPS_THEME.colors.text.primary },
    toggleText: { color: OPS_THEME.colors.text.secondary, fontWeight: 'bold', fontSize: 12 },
    toggleTextActive: { color: OPS_THEME.colors.bg.app },

    factBox: { backgroundColor: OPS_THEME.colors.bg.highlight, padding: 16, borderRadius: 8 },
    factTitle: { fontSize: 10, fontWeight: 'bold', color: OPS_THEME.colors.text.tertiary, marginBottom: 8 },
    factRow: { color: OPS_THEME.colors.text.primary, fontSize: 14, marginBottom: 4 },
    mono: { fontFamily: 'monospace', fontWeight: 'bold' },

    selectionCard: {
        padding: 20,
        backgroundColor: OPS_THEME.colors.bg.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: OPS_THEME.colors.border.subtle,
        marginBottom: 16
    },
    selectionCardActive: { borderColor: OPS_THEME.colors.text.primary, backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    selectionCardWarning: { borderColor: OPS_THEME.colors.status.warning, backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    selectionTitle: { fontSize: 16, fontWeight: 'bold', color: OPS_THEME.colors.text.primary, marginBottom: 4 },
    selectionDesc: { fontSize: 14, color: OPS_THEME.colors.text.secondary },

    warningBlock: { padding: 16, backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: 8, borderWidth: 1, borderColor: OPS_THEME.colors.status.warning },
    warningText: { color: OPS_THEME.colors.status.warning, fontSize: 14, fontWeight: 'bold' },

    rowCentered: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    labelSimple: { fontSize: 16, color: OPS_THEME.colors.text.primary },

    reviewCard: { backgroundColor: OPS_THEME.colors.bg.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: OPS_THEME.colors.border.subtle, marginBottom: 24 },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    reviewLabel: { color: OPS_THEME.colors.text.secondary, fontSize: 14 },
    reviewValue: { color: OPS_THEME.colors.text.primary, fontWeight: 'bold', fontSize: 14 },
    divider: { height: 1, backgroundColor: OPS_THEME.colors.border.subtle, marginVertical: 16 },
    totalFlowLabel: { color: OPS_THEME.colors.text.tertiary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
    totalFlowValue: { color: OPS_THEME.colors.status.success, fontSize: 24, fontWeight: 'bold', fontFamily: 'monospace' },

    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start' },
    checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: OPS_THEME.colors.text.primary, marginRight: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
    checkboxChecked: { backgroundColor: OPS_THEME.colors.text.primary },
    checkmark: { color: OPS_THEME.colors.bg.app, fontWeight: 'bold' },
    checkboxText: { flex: 1, color: OPS_THEME.colors.text.primary, fontSize: 14, lineHeight: 20 },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: OPS_THEME.colors.border.subtle },
    btnPrimary: { backgroundColor: OPS_THEME.colors.text.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
    btnSuccess: { backgroundColor: OPS_THEME.colors.status.success, padding: 16, borderRadius: 12, alignItems: 'center' },
    btnDisabled: { opacity: 0.3 },
    btnText: { color: OPS_THEME.colors.bg.app, fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
});
