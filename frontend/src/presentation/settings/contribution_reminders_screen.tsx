import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

// Purity: Presentational Component only.

export const ContributionRemindersScreen = ({ navigation }: { navigation: any }) => {
    // Local state for UI interactivity only
    const [isEnabled, setIsEnabled] = useState(true);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backIcon}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Reminders</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Toggle Section */}
                    <View style={styles.cardContainer}>
                        <View style={styles.mainToggleCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Contribution Reminders</Text>
                                <Switch
                                    trackColor={{ false: '#334155', true: '#2b6cee' }}
                                    thumbColor={'#ffffff'}
                                    ios_backgroundColor="#334155"
                                    onValueChange={() => setIsEnabled(!isEnabled)}
                                    value={isEnabled}
                                />
                            </View>
                            <Text style={styles.cardDesc}>
                                One reliable reminder before each contribution.
                            </Text>
                        </View>
                    </View>

                    {/* Time Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionLabel}>REMINDER TIME</Text>
                        <View style={styles.timeCard}>
                            <TouchableOpacity style={styles.timeRow}>
                                <View style={styles.timeRowLeft}>
                                    <View style={styles.iconBox}>
                                        <Text style={styles.clockIcon}>⏰</Text>
                                    </View>
                                    <Text style={styles.timeLabel}>Preferred Time</Text>
                                </View>
                                <View style={styles.timeBadge}>
                                    <Text style={styles.timeValue}>08:00 AM</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Text style={styles.infoIcon}>ℹ️</Text>
                        <Text style={styles.infoText}>
                            Reminders help maintain transparency and trust within your Equb group.
                        </Text>
                    </View>

                </ScrollView>

                {/* Bottom Action */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.saveBtn}>
                        <Text style={styles.saveText}>Save Preferences</Text>
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
        backgroundColor: '#101622',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(16, 22, 34, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    backIcon: {
        fontSize: 28,
        color: '#ffffff',
        marginTop: -4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    /* Toggle Card */
    cardContainer: {
        marginBottom: 24,
    },
    mainToggleCard: {
        backgroundColor: '#1C2333', // surface-dark
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#2d3748',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    cardDesc: {
        fontSize: 14,
        color: '#94a3b8', // slate-400
        lineHeight: 20,
    },
    /* Time Section */
    sectionContainer: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        letterSpacing: 1,
        marginLeft: 4,
        marginBottom: 12,
    },
    timeCard: {
        backgroundColor: '#1C2333',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2d3748',
        overflow: 'hidden',
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    timeRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    clockIcon: {
        fontSize: 18,
    },
    timeLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
    },
    timeBadge: {
        backgroundColor: '#1e293b', // slate-800
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    timeValue: {
        color: '#2b6cee', // primary
        fontWeight: '700',
        fontSize: 16,
    },
    /* Info Box */
    infoBox: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // slate-800/50
        borderWidth: 1,
        borderColor: '#2d3748',
        marginTop: 24,
    },
    infoIcon: {
        fontSize: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 20,
    },
    /* Footer */
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#2d3748',
        backgroundColor: '#101622',
    },
    saveBtn: {
        backgroundColor: '#2b6cee',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});
