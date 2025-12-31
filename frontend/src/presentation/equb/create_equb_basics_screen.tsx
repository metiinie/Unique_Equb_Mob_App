import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

interface CreateEqubBasicsScreenProps {
    onBack: () => void;
    onContinue: (basics: any) => void;
}

export const CreateEqubBasicsScreen: React.FC<CreateEqubBasicsScreenProps> = ({ onBack, onContinue }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState('Weekly');
    const [startDate, setStartDate] = useState('');

    const frequencies = [
        { label: 'Daily', icon: '📅' },
        { label: 'Weekly', icon: '🗓️' },
        { label: 'Monthly', icon: '📆' }
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create New Equb</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                        <Text style={styles.stepText}>Step 1 of 3</Text>
                        <Text style={styles.stepLabel}>Basics</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '33%' }]} />
                    </View>
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.headline}>
                        <Text style={styles.title}>Let's set up the basics</Text>
                        <Text style={styles.description}>
                            Enter the core details for your new savings circle. You can add members later.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {/* Name Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Equb Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Office Savings Group"
                                placeholderTextColor="#64748b"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* Amount Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Contribution Amount</Text>
                            <View style={styles.amountRelative}>
                                <Text style={styles.currencyPrefix}>ETB</Text>
                                <TextInput
                                    style={[styles.input, { paddingLeft: 56 }]}
                                    placeholder="0.00"
                                    placeholderTextColor="#64748b"
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>
                            <Text style={styles.amountHint}>Total pot depends on member count.</Text>
                        </View>

                        {/* Frequency Selector */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>How often will you collect?</Text>
                            <View style={styles.frequencyRow}>
                                {frequencies.map((freq) => (
                                    <TouchableOpacity
                                        key={freq.label}
                                        style={[
                                            styles.freqCard,
                                            frequency === freq.label && styles.freqCardActive
                                        ]}
                                        onPress={() => setFrequency(freq.label)}
                                    >
                                        <Text style={styles.freqIcon}>{freq.icon}</Text>
                                        <Text style={[
                                            styles.freqLabel,
                                            frequency === freq.label && styles.freqLabelActive
                                        ]}>{freq.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Start Date */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Start Date</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#64748b"
                                value={startDate}
                                onChangeText={setStartDate}
                            />
                        </View>
                    </View>

                    {/* Bottom Padding */}
                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Floating Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={() => onContinue({ name, amount, frequency, startDate })}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                        <Text style={styles.arrowIcon}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#101622',
    },
    container: {
        flex: 1,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 32,
        color: '#ffffff',
        fontWeight: '200',
    },
    headerTitle: {
        ...Theme.typography.body,
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 16,
        gap: 8,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepText: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
    },
    stepLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2b6cee',
        textTransform: 'uppercase',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#1c2333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#2b6cee',
        borderRadius: 3,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
    },
    headline: {
        paddingVertical: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#ffffff',
        lineHeight: 34,
    },
    description: {
        ...Theme.typography.body,
        color: '#94a3b8',
        marginTop: 8,
        lineHeight: 24,
    },
    form: {
        marginTop: 16,
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
    },
    input: {
        height: 56,
        backgroundColor: '#1c2333',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2d364a',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#ffffff',
    },
    amountRelative: {
        position: 'relative',
        justifyContent: 'center',
    },
    currencyPrefix: {
        position: 'absolute',
        left: 16,
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: '600',
        zIndex: 1,
    },
    amountHint: {
        fontSize: 12,
        color: '#64748b',
        paddingLeft: 4,
    },
    frequencyRow: {
        flexDirection: 'row',
        gap: 12,
    },
    freqCard: {
        flex: 1,
        height: 80,
        backgroundColor: '#1c2333',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2d364a',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    freqCardActive: {
        backgroundColor: '#2b6cee',
        borderColor: '#2b6cee',
    },
    freqIcon: {
        fontSize: 24,
    },
    freqLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
    },
    freqLabelActive: {
        color: '#ffffff',
    },
    footer: {
        position: 'absolute',
        bottom: 80, // Above bottom nav
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'transparent', // Gradient-like feel handling in React Native
    },
    continueBtn: {
        height: 56,
        backgroundColor: '#2b6cee',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    continueText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    arrowIcon: {
        fontSize: 20,
        color: '#ffffff',
    }
});
