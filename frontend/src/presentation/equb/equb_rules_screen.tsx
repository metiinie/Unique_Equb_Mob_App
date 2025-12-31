import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const EqubRulesScreen = ({ navigation }: { navigation: any }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('General');

    const tabs = ['General', 'Financial', 'Penalties'];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Sticky Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Text style={styles.iconText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Monthly Family Equb</Text>
                    </View>
                    <TouchableOpacity style={styles.iconButtonPrimary}>
                        <Text style={styles.pdfIcon}>📄</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    stickyHeaderIndices={[0]} // Sticky Search Bar ? No, React Native stickyHeaderIndices works on direct children. Search bar is child 0.
                >
                    {/* Search Bar (Sticky-ish behavior via stickyHeaderIndices) */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchWrapper}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search rules (e.g., penalties, dates)"
                                placeholderTextColor="#6b7280"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {/* Meta Info */}
                    <View style={styles.metaInfo}>
                        <View style={styles.metaBadge}>
                            <Text style={styles.metaText}>Last Updated: Oct 24, 2023</Text>
                        </View>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <View style={styles.tabBar}>
                            {tabs.map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        activeTab === tab ? styles.activeTabText : styles.inactiveTabText
                                    ]}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Section 1: Membership */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Membership & Eligibility</Text>
                        <View style={styles.card}>
                            <Text style={styles.cardText}>
                                Membership is exclusively open to direct family members and their spouses. All members must be at least 18 years of age and must provide valid identification upon request by the Equb leader.
                            </Text>
                            <View style={styles.checkItem}>
                                <Text style={styles.checkIcon}>✓</Text>
                                <Text style={styles.checkText}>Must be a resident of Addis Ababa or surrounding regions.</Text>
                            </View>
                            <View style={styles.checkItem}>
                                <Text style={styles.checkIcon}>✓</Text>
                                <Text style={styles.checkText}>Must have a verified bank account linked to the app.</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section 2: Financial Terms */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contributions</Text>
                        <LinearGradient
                            colors={['rgba(43, 108, 238, 0.1)', 'rgba(43, 108, 238, 0.05)']}
                            style={styles.financialCard}
                        >
                            <View style={styles.financialHeader}>
                                <View>
                                    <Text style={styles.financialLabel}>MONTHLY AMOUNT</Text>
                                    <View style={styles.amountRow}>
                                        <Text style={styles.amountValue}>5,000</Text>
                                        <Text style={styles.amountCurrency}>ETB</Text>
                                    </View>
                                </View>
                                <View style={styles.paymentIconBox}>
                                    <Text style={styles.paymentIcon}>💳</Text>
                                </View>
                            </View>
                            <Text style={styles.paymentDue}>
                                Payments are due strictly between the <Text style={styles.boldText}>1st and 5th</Text> of every month.
                            </Text>
                            <View style={styles.financialGrid}>
                                <View>
                                    <Text style={styles.gridLabel}>Cycle Duration</Text>
                                    <Text style={styles.gridValue}>12 Months</Text>
                                </View>
                                <View>
                                    <Text style={styles.gridLabel}>Total Payout</Text>
                                    <Text style={styles.gridValue}>60,000 ETB</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Section 3: Draw Logic */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Draw Logic</Text>
                        <View style={styles.logicCard}>
                            <View style={styles.logicItem}>
                                <View style={styles.logicNumber}><Text style={styles.logicNumText}>1</Text></View>
                                <View style={styles.logicContent}>
                                    <Text style={styles.logicTitle}>Lottery System</Text>
                                    <Text style={styles.logicDesc}>Winners are selected randomly via the app's verified algorithm on the 6th of each month.</Text>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.logicItem}>
                                <View style={styles.logicNumber}><Text style={styles.logicNumText}>2</Text></View>
                                <View style={styles.logicContent}>
                                    <Text style={styles.logicTitle}>No Repetition</Text>
                                    <Text style={styles.logicDesc}>Once a member has won the pot, they are removed from future draws until the next cycle starts.</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Section 4: Penalties */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Penalties & Default</Text>

                        {/* Late Fee */}
                        <View style={styles.penaltyCardWarning}>
                            <View style={styles.penaltyRow}>
                                <Text style={styles.warningIcon}>⚠️</Text>
                                <View style={styles.penaltyContent}>
                                    <Text style={styles.penaltyTitleWarning}>Late Payment Fee</Text>
                                    <Text style={styles.penaltyDesc}>
                                        A penalty of <Text style={styles.boldText}>50 ETB</Text> is charged for each day payment is delayed past the 5th.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Default */}
                        <View style={styles.penaltyCardDefault}>
                            <View style={styles.penaltyRow}>
                                <Text style={styles.blockIcon}>🚫</Text>
                                <View style={styles.penaltyContent}>
                                    <Text style={styles.penaltyTitle}>Default Consequence</Text>
                                    <Text style={styles.penaltyDesc}>
                                        Members who miss 2 consecutive payments will be removed from the Equb and refunded minus a 10% service fee.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer Info */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Agreement Version 2.1{'\n'}Managed by Abebe Kebede
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.contactLink}>Contact Admin</Text>
                        </TouchableOpacity>
                    </View>

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
    },
    header: {
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
        backgroundColor: 'rgba(16, 22, 34, 0.95)',
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#1c2333',
    },
    iconButtonPrimary: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
    },
    iconText: {
        fontSize: 24,
        color: '#ffffff',
    },
    pdfIcon: {
        fontSize: 20,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    scrollView: {
        flex: 1,
    },
    content: {
    },
    searchContainer: {
        backgroundColor: '#101622',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e2532',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 8,
        color: '#6b7280',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#ffffff',
    },
    metaInfo: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    metaBadge: {
        backgroundColor: '#1e2532',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 99,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9da6b9',
    },
    tabContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#1e2532',
        borderRadius: 12,
        padding: 4,
        height: 48,
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#101622',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#2b6cee',
        fontWeight: '700',
    },
    inactiveTabText: {
        color: '#9da6b9',
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#1e2532',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    cardText: {
        fontSize: 14,
        color: '#cbd5e1',
        lineHeight: 22,
        marginBottom: 16,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 8,
    },
    checkIcon: {
        color: '#2b6cee',
        fontSize: 16,
        marginTop: 2,
    },
    checkText: {
        flex: 1,
        fontSize: 14,
        color: '#e2e8f0',
    },
    financialCard: {
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(43, 108, 238, 0.2)',
    },
    financialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    financialLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2b6cee',
        letterSpacing: 1,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 4,
    },
    amountValue: {
        fontSize: 30,
        fontWeight: '800',
        color: '#ffffff',
    },
    amountCurrency: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    paymentIconBox: {
        padding: 8,
        backgroundColor: 'rgba(43, 108, 238, 0.2)',
        borderRadius: 8,
    },
    paymentIcon: {
        color: '#2b6cee',
        fontSize: 20,
    },
    paymentDue: {
        fontSize: 14,
        color: '#cbd5e1',
        marginBottom: 16,
    },
    boldText: {
        fontWeight: '700',
        color: '#ffffff',
    },
    financialGrid: {
        flexDirection: 'row',
        gap: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(43, 108, 238, 0.1)',
        paddingTop: 16,
    },
    gridLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    gridValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: 2,
    },
    logicCard: {
        backgroundColor: '#1e2532',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    logicItem: {
        flexDirection: 'row',
        gap: 16,
        padding: 16,
    },
    logicNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#374151',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logicNumText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    logicContent: {
        flex: 1,
    },
    logicTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    logicDesc: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#1e293b',
    },
    penaltyCardWarning: {
        backgroundColor: 'rgba(127, 29, 29, 0.1)', // Red 900/10
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(127, 29, 29, 0.3)',
        marginBottom: 12,
    },
    penaltyCardDefault: {
        backgroundColor: '#1e2532',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    penaltyRow: {
        flexDirection: 'row',
        gap: 12,
    },
    warningIcon: {
        fontSize: 20,
        color: '#f87171',
    },
    blockIcon: {
        fontSize: 20,
        color: '#f97316',
    },
    penaltyContent: {
        flex: 1,
    },
    penaltyTitleWarning: {
        fontSize: 14,
        fontWeight: '700',
        color: '#f87171',
    },
    penaltyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    penaltyDesc: {
        fontSize: 14,
        color: '#cbd5e1',
        marginTop: 4,
        lineHeight: 20,
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 18,
    },
    contactLink: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#2b6cee',
    },
});
