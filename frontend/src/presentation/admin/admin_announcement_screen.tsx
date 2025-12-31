import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, TextInput } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

// Purity: Presentational Component only.

export const AdminAnnouncementScreen = ({ navigation }: { navigation: any }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Announcement</Text>
                    <View style={styles.placeholderBtn} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Recipients Context */}
                    <View style={styles.contextContainer}>
                        <View style={styles.contextCard}>
                            <View style={styles.cardLeft}>
                                <View style={styles.iconBox}>
                                    <Text style={styles.groupIcon}>👥</Text>
                                </View>
                                <View>
                                    <Text style={styles.contextLabel}>TO</Text>
                                    <Text style={styles.contextValue}>All Active Members</Text>
                                </View>
                            </View>
                            <Text style={styles.lockIcon}>🔒</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Send an official update to all Equb members. This will be sent as a broadcast notification and cannot be replied to directly.
                        </Text>
                    </View>

                    {/* Composer Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Subject</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter subject (e.g., Payment Reminder)"
                                placeholderTextColor="#64748b"
                                value={subject}
                                onChangeText={setSubject}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Message Body</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Type your message here... Be clear and concise as this will be sent to 24 members."
                                placeholderTextColor="#64748b"
                                multiline
                                textAlignVertical="top"
                                value={message}
                                onChangeText={setMessage}
                            />
                        </View>

                        <TouchableOpacity style={styles.sendBtn}>
                            <Text style={styles.sendIcon}>📤</Text>
                            <Text style={styles.sendText}>Send Announcement</Text>
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
        backgroundColor: '#101622',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#101622',
        borderBottomWidth: 1,
        borderBottomColor: '#1c1f27',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    closeBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    closeIcon: {
        fontSize: 20,
        color: '#cbd5e1', // slate-300
    },
    placeholderBtn: {
        width: 40,
    },
    scrollContent: {
        paddingTop: 24,
    },
    /* Context */
    contextContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    contextCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1c1f27',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2e3440',
        marginBottom: 16,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupIcon: {
        fontSize: 24,
        color: '#2b6cee',
    },
    contextLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9da6b9',
        letterSpacing: 1,
        marginBottom: 2,
    },
    contextValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    lockIcon: {
        fontSize: 20,
        color: '#475569', // slate-600
    },
    instructionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9da6b9',
        lineHeight: 22,
        paddingHorizontal: 4,
    },
    /* Form */
    formContainer: {
        paddingHorizontal: 16,
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#1c1f27',
        borderWidth: 1,
        borderColor: '#3b4354',
        borderRadius: 8,
        paddingHorizontal: 16,
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        height: 56,
    },
    textArea: {
        height: 240,
        paddingTop: 16,
        paddingBottom: 16,
        textAlignVertical: 'top',
    },
    sendBtn: {
        height: 56,
        backgroundColor: '#2b6cee',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    sendIcon: {
        fontSize: 20,
    },
    sendText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
});
