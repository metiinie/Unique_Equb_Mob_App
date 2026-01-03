import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GlobalRole } from '../../core/constants/enums';
import { MemberProfileSection } from './MemberProfileSection';
import { AdminProfileSection } from './AdminProfileSection';
import { CollectorProfileSection } from './CollectorProfileSection';
import { useAuth } from '../../application/auth/auth_context';
import { useProfileHandler } from './useProfileHandler';

interface ProfileScreenProps {
    navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const { handleAction } = useProfileHandler();

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
                    <View style={{ width: 44 }} />
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <TouchableOpacity
                        style={styles.settingsHeaderBtn}
                        onPress={() => handleAction('SETTINGS')}
                    >
                        <Text style={styles.settingsHeaderIcon}>⚙️</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Minimal Identity Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <View style={styles.avatarContainer}>
                                <View style={[styles.avatarPlaceholder, { backgroundColor: '#1e293b' }]}>
                                    <Text style={[styles.avatarInitial, { color: '#ffffff' }]}>
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </Text>
                                    <View style={styles.profileGlow} />
                                </View>
                                <View style={[styles.roleBadgeIcon, { backgroundColor: '#2b6cee' }]}>
                                    <Text style={styles.badgeIconText}>🛡️</Text>
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

                            <View style={styles.roleChip}>
                                <Text style={{ fontSize: 14 }}>🛡️</Text>
                                <Text style={styles.roleText}>ADMINISTRATOR</Text>
                            </View>
                        </View>
                    </View>

                    {/* Role-Specific Sections */}
                    <View style={styles.dynamicContent}>
                        {currentRole === GlobalRole.MEMBER && <MemberProfileSection />}
                        {currentRole === GlobalRole.ADMIN && <AdminProfileSection />}
                        {currentRole === GlobalRole.COLLECTOR && <CollectorProfileSection />}
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
        backgroundColor: '#0a0f18',
    },
    container: {
        flex: 1,
        backgroundColor: '#0a0f18',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    settingsHeaderBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsHeaderIcon: {
        fontSize: 20,
    },
    scrollContent: {
        paddingTop: 8,
    },
    /* Shared Profile Hero */
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    avatarWrapper: {
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#161d2a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    profileGlow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(43, 108, 238, 0.15)',
        borderRadius: 60,
        transform: [{ scale: 1.2 }],
    },
    avatarInitial: {
        fontSize: 48,
        fontWeight: '800',
        color: '#ffffff',
        zIndex: 1,
    },
    roleBadgeIcon: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2b6cee',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#0a0f18',
        zIndex: 2,
    },
    badgeIconText: {
        fontSize: 12,
        color: '#ffffff',
    },
    infoCenter: {
        alignItems: 'center',
        gap: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    nameText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    verifiedBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#2b6cee',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    verifiedIcon: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '900',
    },
    roleChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(43, 108, 238, 0.25)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(43, 108, 238, 0.4)',
        gap: 8,
    },
    roleText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 1.2,
    },
    dynamicContent: {
        flex: 1,
    },
});
