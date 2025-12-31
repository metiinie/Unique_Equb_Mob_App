import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

interface WelcomeScreenProps {
    onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Pattern Simulation */}
            <View style={styles.patternContainer}>
                {[...Array(20)].map((_, i) => (
                    <View key={i} style={styles.patternRow}>
                        {[...Array(10)].map((_, j) => (
                            <View key={j} style={styles.patternDot} />
                        ))}
                    </View>
                ))}
            </View>

            {/* Top Illustration */}
            <View style={styles.topSection}>
                <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVsYNRdE34jNuFNYwCRWx5PTUWRJJc7BRXmm3oB7pTeDw2JTvYxJtsL7wsgHsv7tdvW3NeS0CNadlHSwCTnQD_xBWQ20xfJcaoAd1IZsd3swxrUOA5K5fQEymX20mxi_ph-6sfXNUgNGrPPizGmrbj12PbLpKtXgkJS_JsgcgN-nQb-PdrJSkb3DuSveGqQ6xX4rTyQSXVRQXnsO-FDSj6wG7jF2NhGBwuOggluWhaGu2Ub_tRuy_HTRxQ2PsOpEPvDq0e-oISIubV' }}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            </View>

            {/* Brand Content */}
            <View style={styles.middleSection}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoIcon}>💰</Text>
                </View>
                <Text style={styles.title}>EqubConnect</Text>
                <Text style={styles.tagline}>Transparent Equb management</Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={onContinue}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}>Secure & Trusted Community Platform</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    patternContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        justifyContent: 'center',
        alignItems: 'center',
    },
    patternRow: {
        flexDirection: 'row',
        marginVertical: 12,
    },
    patternDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: Theme.colors.primary,
        marginHorizontal: 15,
    },
    topSection: {
        flex: 1.2,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 40,
    },
    illustration: {
        width: 256,
        height: 256,
        opacity: 0.9,
    },
    middleSection: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: 'rgba(43, 108, 238, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(43, 108, 238, 0.1)',
    },
    logoIcon: {
        fontSize: 40,
        color: Theme.colors.primary,
    },
    title: {
        ...Theme.typography.h1,
        color: Theme.colors.text.primary,
        textAlign: 'center',
    },
    tagline: {
        ...Theme.typography.body,
        color: Theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: 12,
        maxWidth: 280,
    },
    bottomSection: {
        paddingHorizontal: 24,
        paddingBottom: 48,
        paddingTop: 24,
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        ...Theme.typography.button,
        color: '#ffffff',
        letterSpacing: 0.3,
    },
    footerText: {
        ...Theme.typography.caption,
        textAlign: 'center',
        marginTop: 16,
        color: '#64748b',
    },
});
