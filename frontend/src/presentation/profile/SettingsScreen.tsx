import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useProfileHandler } from './useProfileHandler';

export const SettingsScreen: React.FC = () => {
    const { handleAction } = useProfileHandler();

    const SettingItem = ({ icon, title, subtitle, onPress, destructive = false }: any) => (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, destructive && styles.destructiveIcon]}>
                    <Text style={styles.iconText}>{icon}</Text>
                </View>
                <View>
                    <Text style={[styles.itemTitle, destructive && styles.destructiveText]}>{title}</Text>
                    {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <SettingItem
                        icon="👤"
                        title="Edit Profile"
                        subtitle="Name, Email"
                        onPress={() => handleAction('EDIT_PROFILE')}
                    />
                    <SettingItem
                        icon="🔒"
                        title="Security"
                        subtitle="Change Password"
                        onPress={() => handleAction('SECURITY')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <SettingItem
                        icon="🔔"
                        title="Notifications"
                        subtitle="Push, Email, SMS"
                        onPress={() => handleAction('NOTIFICATIONS')}
                    />
                    <SettingItem
                        icon="🌐"
                        title="Language"
                        subtitle="Select preferred language"
                        onPress={() => handleAction('LANGUAGE')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App</Text>
                    <SettingItem
                        icon="ℹ️"
                        title="About"
                        onPress={() => handleAction('ABOUT')}
                    />
                    <SettingItem
                        icon="🚪"
                        title="Logout"
                        destructive
                        onPress={() => handleAction('LOGOUT')}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101622',
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1c2333',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#2d3748',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#2d3748',
        justifyContent: 'center',
        alignItems: 'center',
    },
    destructiveIcon: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    iconText: {
        fontSize: 20,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    destructiveText: {
        color: '#ef4444',
    },
    chevron: {
        fontSize: 24,
        color: '#64748b',
        fontWeight: '300',
    },
});
