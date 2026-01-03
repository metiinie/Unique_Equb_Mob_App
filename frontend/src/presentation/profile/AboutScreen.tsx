import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Linking
} from 'react-native';

export const AboutScreen = () => {
    // In a real app, version would be pulled from expo-constants
    const appVersion = "1.0.0 (Build 42)";

    const openLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.logoSection}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>🛡️</Text>
                </View>
                <Text style={styles.appName}>Unique Equb</Text>
                <Text style={styles.appTagline}>Secure, Transparent, Community-Driven</Text>
                <Text style={styles.versionText}>Version {appVersion}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Our Mission</Text>
                <Text style={styles.missionText}>
                    Unique Equb is designed to modernize traditional savings communities by providing
                    a secure, digital platform for management, contribution tracking, and automated payouts.
                </Text>
            </View>

            <View style={styles.linksCard}>
                <TouchableOpacity style={styles.linkItem} onPress={() => openLink('https://example.com/terms')}>
                    <Text style={styles.linkText}>Terms of Service</Text>
                    <Text style={styles.linkChevron}>›</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.linkItem} onPress={() => openLink('https://example.com/privacy')}>
                    <Text style={styles.linkText}>Privacy Policy</Text>
                    <Text style={styles.linkChevron}>›</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.linkItem} onPress={() => openLink('https://example.com/licenses')}>
                    <Text style={styles.linkText}>Open Source Licenses</Text>
                    <Text style={styles.linkChevron}>›</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.copyright}>
                © 2026 Unique Equb Systems. All rights reserved.
            </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginVertical: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2b6cee',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoEmoji: {
        fontSize: 50,
    },
    appName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    appTagline: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    versionText: {
        fontSize: 13,
        color: '#999',
        marginTop: 10,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    missionText: {
        fontSize: 14,
        color: '#444',
        lineHeight: 22,
    },
    linksCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        overflow: 'hidden',
    },
    linkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    linkText: {
        fontSize: 16,
        color: '#1a1a1a',
        fontWeight: '500',
    },
    linkChevron: {
        fontSize: 20,
        color: '#ccc',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
    },
    copyright: {
        marginTop: 40,
        marginBottom: 20,
        fontSize: 12,
        color: '#999',
    },
});
