import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, Switch } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

// Purity: Presentational Component only. Hardcoded data for pixel-perfect setting screen translation.

export const SettingsScreen = () => {
    // Local state for UI toggles (Presentation only)
    const [isPaymentReminder, setIsPaymentReminder] = useState(true);
    const [isCycleUpdate, setIsCycleUpdate] = useState(true);
    const [isChatMsg, setIsChatMsg] = useState(false);
    const [language, setLanguage] = useState<'en' | 'am'>('en');

    const SettingRow = ({ icon, color, bg, label, hasToggle, isToggled, onToggle, hasArrow }: any) => (
        <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={hasArrow ? 0.7 : 1}
            onPress={hasToggle ? onToggle : undefined}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: bg }]}>
                    <Text style={[styles.iconText, { color: color }]}>{icon}</Text>
                </View>
                <Text style={styles.rowLabel}>{label}</Text>
            </View>
            {hasToggle && (
                <Switch
                    trackColor={{ false: '#334155', true: '#2b6cee' }}
                    thumbColor={'#ffffff'}
                    ios_backgroundColor="#334155"
                    onValueChange={onToggle}
                    value={isToggled}
                />
            )}
            {hasArrow && (
                <Text style={styles.chevron}>›</Text>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Profile Snippet */}
                    <View style={styles.profileCard}>
                        <View style={styles.profileLeft}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuARs3wR-nR0bptQmfDyvbeeBv5dm9T_LD3DRIJA9XwGcIDFQtoGudsTwUYzcAY90oh0Wmt_5OyEYsUS8vYsHPy1xo9Xhy9rjAM-dTGCO7yLygD-eRE_U08dcQ16K3GJ1rCxS9Ouz1k2QAqm6xXC-rEf_ZDvu3rEzEsilrUi3TVLmr7gYfdoFQ79lALdpiujpaRI_rAoP3gJZPo7zqnqSHBd7ISLoeOLUjHMKmqGxy0BGMMw-hvrZvZUNaHhzbLCqCMS-_MRGyVaMAvU" }}
                                    style={styles.avatar}
                                />
                                <View style={styles.onlineDot} />
                            </View>
                            <View>
                                <Text style={styles.profileName}>Abebe Kebede</Text>
                                <Text style={styles.profileRole}>Equb Collector</Text>
                            </View>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.editIcon}>✎</Text>
                        </TouchableOpacity>
                    </View>

                    {/* App Preferences */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>APP PREFERENCES</Text>
                        <View style={styles.card}>
                            {/* Language Selector */}
                            <View style={styles.langRow}>
                                <Text style={styles.langLabel}>Language</Text>
                                <View style={styles.langSwitch}>
                                    <TouchableOpacity
                                        style={[styles.langOption, language === 'am' && styles.langActive]}
                                        onPress={() => setLanguage('am')}
                                    >
                                        <Text style={[styles.langText, language === 'am' && styles.langTextActive]}>Amharic</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.langOption, language === 'en' && styles.langActive]}
                                        onPress={() => setLanguage('en')}
                                    >
                                        <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>English</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <TouchableOpacity style={styles.currencyRow}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: 'rgba(30, 58, 138, 0.2)' }]}>
                                        <Text style={[styles.iconText, { color: '#60a5fa' }]}>💵</Text>
                                    </View>
                                    <Text style={styles.rowLabel}>Currency Display</Text>
                                </View>
                                <View style={styles.rowRight}>
                                    <Text style={styles.valueText}>ETB</Text>
                                    <Text style={styles.chevron}>›</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Notifications */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
                        <View style={styles.card}>
                            <SettingRow
                                icon="🔔"
                                bg="rgba(88, 28, 135, 0.2)"
                                color="#c084fc"
                                label="Payment Reminders"
                                hasToggle={true}
                                isToggled={isPaymentReminder}
                                onToggle={() => setIsPaymentReminder(!isPaymentReminder)}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon="🔄"
                                bg="rgba(124, 45, 18, 0.2)"
                                color="#fb923c"
                                label="Cycle Updates"
                                hasToggle={true}
                                isToggled={isCycleUpdate}
                                onToggle={() => setIsCycleUpdate(!isCycleUpdate)}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon="💬"
                                bg="rgba(20, 83, 45, 0.2)"
                                color="#4ade80"
                                label="Chat Messages"
                                hasToggle={true}
                                isToggled={isChatMsg}
                                onToggle={() => setIsChatMsg(!isChatMsg)}
                            />
                        </View>
                    </View>

                    {/* Support & Security */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>SUPPORT & SECURITY</Text>
                        <View style={styles.card}>
                            <SettingRow
                                icon="🔒"
                                bg="rgba(19, 78, 74, 0.2)"
                                color="#2dd4bf"
                                label="Change Password"
                                hasArrow={true}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon="❓"
                                bg="rgba(49, 46, 129, 0.2)"
                                color="#818cf8"
                                label="Help & FAQ"
                                hasArrow={true}
                            />
                            <View style={styles.divider} />
                            <SettingRow
                                icon="🛡️"
                                bg="rgba(51, 65, 85, 0.5)"
                                color="#94a3b8"
                                label="Privacy Policy"
                                hasArrow={true}
                            />
                        </View>
                    </View>

                    {/* Logout */}
                    <TouchableOpacity style={styles.logoutBtn}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>App Version 2.4.0</Text>

                    <View style={{ height: 100 }} />
                </ScrollView>
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
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 22, 34, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    scrollContent: {
        padding: 16,
        paddingTop: 24,
    },
    /* Profile Snippet */
    profileCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1A1D24', // surface-dark
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2d3748',
        marginBottom: 24,
    },
    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: 'rgba(43, 108, 238, 0.2)',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#22c55e', // green-500
        borderWidth: 2,
        borderColor: '#1A1D24',
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    profileRole: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94a3b8', // gray-400
    },
    editIcon: {
        fontSize: 24,
        color: '#2b6cee', // primary
    },
    /* Sections */
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8', // gray-400
        marginBottom: 12,
        paddingLeft: 4,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#1A1D24',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2d3748',
        overflow: 'hidden',
    },
    divider: {
        height: 1,
        backgroundColor: '#2d3748', // border-gray-800
        marginLeft: 16, // Indented divider
    },
    /* Language Row */
    langRow: {
        padding: 16,
    },
    langLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#e2e8f0', // gray-200
        marginBottom: 12,
    },
    langSwitch: {
        flexDirection: 'row',
        backgroundColor: '#0c1018',
        padding: 4,
        borderRadius: 12,
    },
    langOption: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    langActive: {
        backgroundColor: '#1A1D24', // surface-dark
    },
    langText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94a3b8',
    },
    langTextActive: {
        color: '#2b6cee',
    },
    /* Settings Row */
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    currencyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 16,
    },
    rowLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
    },
    valueText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94a3b8',
    },
    chevron: {
        fontSize: 20,
        color: '#94a3b8',
    },
    /* Logout */
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(127, 29, 29, 0.1)', // red-900/10
        borderWidth: 1,
        borderColor: 'rgba(127, 29, 29, 0.3)',
        padding: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    logoutIcon: {
        fontSize: 18,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#f87171', // red-400
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 16,
    },
});
