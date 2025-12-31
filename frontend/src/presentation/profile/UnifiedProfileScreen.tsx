import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GlobalRole } from '../../core/constants/enums';
import { MemberProfileSection } from './MemberProfileSection';
import { AdminProfileSection } from './AdminProfileSection';
import { CollectorProfileSection } from './CollectorProfileSection';
import { useAuth } from '../../application/auth/auth_context';

interface ProfileScreenProps {
    navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const { user } = useAuth();

    if (!user) return null;

    const currentRole = user.role;

    // Role-specific badge configuration
    const getRoleBadge = () => {
        switch (currentRole) {
            case GlobalRole.ADMIN:
                return { icon: '🛡️', label: 'ADMINISTRATOR', color: '#2b6cee' };
            case GlobalRole.COLLECTOR:
                return { icon: '💳', label: 'COLLECTOR', color: '#f59e0b' };
            case GlobalRole.MEMBER:
            default:
                return { icon: '👤', label: 'MEMBER', color: '#2b6cee' };
        }
    };

    const roleBadge = getRoleBadge();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ width: 32 }} />
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <View style={{ width: 32 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Truthful Profile Hero Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarContainer}>
                                <View style={[styles.avatarPlaceholder, { backgroundColor: roleBadge.color + '22' }]}>
                                    <Text style={[styles.avatarInitial, { color: roleBadge.color }]}>
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={[styles.roleBadgeIcon, { backgroundColor: roleBadge.color }]}>
                                    <Text style={styles.badgeIconText}>{roleBadge.icon}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.infoCenter}>
                            <View style={styles.nameRow}>
                                <Text style={styles.nameText}>{user.fullName}</Text>
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedIcon}>✓</Text>
                                </View>
                            </View>
                            <Text style={styles.phoneText}>{user.email}</Text>
                            <Text style={styles.dateText}>Joined {new Date(user.createdAt).toLocaleDateString()}</Text>

                            <View style={styles.roleChip}>
                                <Text style={styles.roleIcon}>{roleBadge.icon}</Text>
                                <Text style={styles.roleText}>{roleBadge.label}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Role-Specific Sections */}
                    {currentRole === GlobalRole.MEMBER && <MemberProfileSection navigation={navigation} />}
                    {currentRole === GlobalRole.ADMIN && <AdminProfileSection navigation={navigation} />}
                    {currentRole === GlobalRole.COLLECTOR && <CollectorProfileSection navigation={navigation} />}

                    {/* Shared Section - Settings Access */}
                    <View style={styles.settingsSection}>
                        <TouchableOpacity
                            style={styles.settingsBtn}
                            onPress={() => navigation.navigate('Settings')}
                        >
                            <View style={styles.settingsBtnLeft}>
                                <Text style={styles.settingsIcon}>⚙️</Text>
                                <Text style={styles.settingsTitle}>Settings</Text>
                            </View>
                            <Text style={styles.settingsChevron}>›</Text>
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
        paddingTop: 24,
    },
    /* Shared Profile Hero */
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    avatarWrapper: {
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarPlaceholder: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 4,
        borderColor: '#1c2333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 40,
        fontWeight: '700',
    },
    roleBadgeIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#101622',
    },
    badgeIconText: {
        fontSize: 14,
    },
    infoCenter: {
        alignItems: 'center',
        gap: 4,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nameText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
    },
    verifiedBadge: {},
    verifiedIcon: {
        color: '#2b6cee',
        fontSize: 18,
        fontWeight: 'bold',
    },
    phoneText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#94a3b8',
    },
    dateText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(43, 108, 238, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(43, 108, 238, 0.2)',
    },
    roleIcon: {
        fontSize: 14,
        color: '#2b6cee',
    },
    roleText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#2b6cee',
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#1e293b',
        marginVertical: 24,
        marginHorizontal: 24,
    },
    /* Settings Section */
    settingsSection: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    settingsBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1c2333',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    settingsBtnLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingsIcon: {
        fontSize: 24,
    },
    settingsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    settingsChevron: {
        fontSize: 24,
        color: '#64748b',
    },
});
