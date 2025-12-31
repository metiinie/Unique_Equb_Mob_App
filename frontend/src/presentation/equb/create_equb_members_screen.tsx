import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Image } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

interface CreateEqubMembersScreenProps {
    onBack: () => void;
    onContinue: (members: any[]) => void;
}

export const CreateEqubMembersScreen: React.FC<CreateEqubMembersScreenProps> = ({ onBack, onContinue }) => {
    const [countryCode, setCountryCode] = useState('+251');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [members, setMembers] = useState([
        {
            id: '1',
            name: 'Dawit Abraham',
            phone: '+251 911 456 789',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzPeWMy-CKHh3H-ljAC4fdMvX_mdEtrQOX3j-GxyRv2iignMYekwer_Xmde5LCnrKOZeYbMpZH36WB0XjFe2WWbZi0XIgWFogtQQsfml0ADc58S9KZ_m0X44fmlRrnK9UczXJTAmn4oZzvF0FXiEEJvCm9rGmYGypOlaUALC0hUGNvzs_o4EkQn9aSf6EZNBYGgUkIMMN9XP0fHDxZTp3opTNEJZFygTNUuJTpgVOAzbjIaqrfOd4RXyObnryzSMk0Bt1Xj1Dg5Bmw'
        },
        {
            id: '2',
            name: 'Marta Kebede',
            phone: '+251 922 555 123',
            initials: 'MK',
            iconBg: 'rgba(168, 85, 247, 0.2)',
            iconColor: '#a855f7'
        },
        {
            id: '3',
            name: 'Sara Tadesse',
            phone: '+251 944 888 999',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBh_gB0jY3LvqhK6eGA3mDwkgXx51yzSj25sF_rE9ohCD0x546OJ9QNIc07hUIlUKgtfWfqXW76B2u2IFRazFHt45EQKQ-tgqPL1fSSYUrJeRypgahFMg8GypN32n9gYkhHrNDRwRl6YHidwnGSNfCEqAb1RvwBJ-hV8ROBO9wFVAiDQAYmaudfGoJ88PF1_iRh97kY94Y0Qsh7iKsuVN9f8OLRnXlNKex0HR34T_RhmK0t_XeMq-AW7Srl_OC9XWn31akrKR83dZD'
        }
    ]);

    const handleRemoveMember = (id: string) => {
        setMembers(members.filter(m => m.id !== id));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Members</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Progress Indicators */}
                <View style={styles.progressRow}>
                    <View style={styles.dot} />
                    <View style={styles.activeBar} />
                    <View style={styles.dot} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Instruction */}
                    <View style={styles.instruction}>
                        <Text style={styles.instructionText}>
                            Invite members by their phone number to join your Equb circle.
                        </Text>
                    </View>

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <View style={styles.inputRow}>
                            <View style={styles.codeColumn}>
                                <Text style={styles.label}>Code</Text>
                                <TextInput
                                    style={styles.input}
                                    value={countryCode}
                                    onChangeText={setCountryCode}
                                    placeholder="+251"
                                    placeholderTextColor="#64748b"
                                />
                            </View>
                            <View style={styles.phoneColumn}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder="911 234 567"
                                    placeholderTextColor="#64748b"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
                                <Text style={styles.addButtonText}>+ Add Member</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.importButton} activeOpacity={0.8}>
                                <Text style={styles.importButtonText}>👤 Import</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Warning Banner */}
                    <View style={styles.warningBanner}>
                        <Text style={styles.warningIcon}>ℹ️</Text>
                        <Text style={styles.warningText}>
                            Members cannot be changed after the Equb starts. Please verify the list carefully.
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Member List Header */}
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>
                            Added Members <Text style={styles.countText}>({members.length})</Text>
                        </Text>
                    </View>

                    {/* Member List */}
                    <View style={styles.memberList}>
                        {members.map((member) => (
                            <View key={member.id} style={styles.memberCard}>
                                <View style={styles.memberInfo}>
                                    {member.avatar ? (
                                        <Image source={{ uri: member.avatar }} style={styles.avatar} />
                                    ) : (
                                        <View style={[styles.avatarPlaceholder, { backgroundColor: member.iconBg }]}>
                                            <Text style={[styles.initials, { color: member.iconColor }]}>{member.initials}</Text>
                                        </View>
                                    )}
                                    <View>
                                        <Text style={styles.memberName}>{member.name}</Text>
                                        <Text style={styles.memberPhone}>{member.phone}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleRemoveMember(member.id)}
                                    style={styles.deleteButton}
                                >
                                    <Text style={styles.deleteIcon}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>

                    {/* Bottom Padding */}
                    <View style={{ height: 140 }} />
                </ScrollView>

                {/* Sticky Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={() => onContinue(members)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueText}>Continue</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: '#ffffff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#334155',
    },
    activeBar: {
        width: 24,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2b6cee',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
    },
    instruction: {
        paddingBottom: 8,
    },
    instructionText: {
        ...Theme.typography.body,
        color: '#94a3b8',
        lineHeight: 24,
    },
    inputSection: {
        paddingVertical: 12,
        gap: 16,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    codeColumn: {
        width: 100,
        gap: 6,
    },
    phoneColumn: {
        flex: 1,
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#e2e8f0',
    },
    input: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        backgroundColor: '#1c1f27',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#ffffff',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    addButton: {
        flex: 1,
        height: 44,
        backgroundColor: '#2b6cee',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    importButton: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(43, 108, 238, 0.2)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    importButtonText: {
        color: '#2b6cee',
        fontWeight: '700',
        fontSize: 14,
    },
    warningBanner: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.2)',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    warningIcon: {
        fontSize: 20,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#f59e0b',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#1e293b',
        marginVertical: 16,
    },
    listHeader: {
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    countText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    memberList: {
        gap: 12,
    },
    memberCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1c1f27',
        borderWidth: 1,
        borderColor: '#1e293b',
        borderRadius: 12,
        padding: 12,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: 14,
        fontWeight: '700',
    },
    memberName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    memberPhone: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    deleteButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        fontSize: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#101622',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
    },
    continueBtn: {
        height: 56,
        backgroundColor: '#2b6cee',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    continueText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    }
});
