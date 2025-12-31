import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { Theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

interface CreateEqubPayoutOrderScreenProps {
    onBack: () => void;
    onContinue: (order: any[]) => void;
}

const { width } = Dimensions.get('window');

export const CreateEqubPayoutOrderScreen: React.FC<CreateEqubPayoutOrderScreenProps> = ({ onBack, onContinue }) => {
    const [isRandom, setIsRandom] = useState(false);
    const [members, setMembers] = useState([
        {
            id: '1',
            name: 'Abebe Bikila',
            role: 'Collector',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCczhKjlXcDqTrIL1PBfwDFjoxdWwU1FqJ3K8cCUTgBxLluZYKefVbCUPHlJDBZ8VSlTXYqVW3KZhiauJW7G8h_DQsTynSxLMoHZAOMpvY3-7iYmuqvfnNPVp8RGdmF4_AsIwoWV9WOz16bnCfP6ycwUzUU2n4M0Ky3QNi1YBVlGZPsHJY3XvetolJ4-dJoryRzehyokmMQDKr32Wzdgn-u1MwguIT8TiVrGbkXNITeuMLztYpxrui3lo1BO8a4aggLkHcICME5PB2q'
        },
        {
            id: '2',
            name: 'Tirunesh Dibaba',
            role: 'Member',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2ybkx3ECJIXaLpCJKmXt_4vRXwHbPZseiwf3DE1Jz2N2OuHLvvxX5Q3WlRW2SQ2qMlJGtumG2gdjiFLKpyt7tN0llV8H3XfFE1hrqjUgcQape5vFNonPH60WKpKfwOml7AV4P1rQ3dOmem7PuI0n3lACtgXkodsLUC6QKlNZGEapqx_SsqK8E7AkOAo8GvXcRtGQB5elsl_B4BDa5j-M2xipGZYctrQ3BYuKgs0SeP-8xsCNEqvtxJmz63KjQ1UHRgbuKe1vGvc_x'
        },
        {
            id: '3',
            name: 'Haile Gebrselassie',
            role: 'Member',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7gb0qkL6XGIc_oT66Q39u7ikf9kw6uHbKze4s2jnw1tFDMCvQoh4RyGaoOIYNLMYGy56S96pZ2pVzOLiyMaZpesAe42oFJWOBV6gFPD0aL0Z_mvzyTYxlUitNIE4VOHYg3fWgHU_jyKR1PMl1fyUS9HrHUPibQOwxY0aKK9ikKPpo9-mu6wirA2h0BeZqiXq79QMsLHTcJP9nVlwaj3xhwIzES6hlCcJhFcLEPaJ9zSDZkEtJZ1rXB-2aFEfK60qBGrgAPKX3rTmJ',
            isActive: true // Simulation of active drag state
        },
        {
            id: '4',
            name: 'Derartu Tulu',
            role: 'Member',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWgfkK4ipCwqJdNZ6lcpBGZpypMH6SJe7bqI4ZxDwX7oDXRORgwqR8Ei2RIJzSr9zA3IYtRTUJdEdho5lkuc4wHF_xlSEhFawO95tLFyvd5dB-XglDiJ0jHh6bkSFGvI5Owzd8tiHRjrXM_kpZXPdvahIRfToRtxtgpVYssau6_5bGXIVYsaFCymdjswM465xIFcu2pCkw3ekZFNdkWm_m-as7PI1jQeqS90zxgdEbPzUbhI1UD2cXUFd67I9V97T4A4Mz-OkXkeym'
        },
        {
            id: '5',
            name: 'Kenenisa Bekele',
            role: 'Member',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAl-B40XJ68hyoSI4uLH49REmPBp0Eo2ryzBO5uYfaULBcaSqhPM38cLGjiPWFoVwEkCWcPbmAvy8NHqlAJLp4pX2dEtDG26lZ6UrcXcjrVWXX9_m-oroomC005JUG91VoycqtIjeQREDKLXme3O7CtJkUa8XSw_-gM0rl0wLjZ2V1_P0BeIwFAy8NVAd8PvSB8i3MLoJft3sXZ6hvnvNLt0jXPWzwOOYz1Kmzp3ZYcyspZznWKp3B1gJPSDy_AzZyui4Ie9iX54SDs'
        }
    ]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <Text style={styles.iconText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payout Order</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Text style={styles.helpIcon}>?</Text>
                    </TouchableOpacity>
                </View>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBars}>
                        <View style={[styles.bar, styles.activeBar]} />
                        <View style={[styles.bar, styles.activeBar]} />
                        <View style={[styles.bar, styles.activeBar]} />
                        <View style={styles.bar} />
                    </View>
                    <Text style={styles.progressText}>Step 3 of 4</Text>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Intro */}
                    <View style={styles.intro}>
                        <Text style={styles.introTitle}>Set Payout Sequence</Text>
                        <Text style={styles.introDesc}>
                            Drag and drop members to set the order in which they will receive the collected money.
                        </Text>
                    </View>

                    {/* Action Panel */}
                    <View style={styles.actionPanel}>
                        <View style={styles.actionTextCol}>
                            <Text style={styles.actionTitle}>Randomize Order</Text>
                            <Text style={styles.actionDesc}>Let the system shuffle the payout sequence</Text>
                        </View>
                        <Switch
                            value={isRandom}
                            onValueChange={setIsRandom}
                            trackColor={{ false: '#282e39', true: '#2b6cee' }}
                            thumbColor={'#ffffff'}
                            ios_backgroundColor="#282e39"
                        />
                    </View>

                    {/* List Header */}
                    <View style={styles.listHeader}>
                        <Text style={styles.colHeader}>ROUND</Text>
                        <Text style={[styles.colHeader, { marginLeft: 16 }]}>MEMBER</Text>
                    </View>

                    {/* Draggable List */}
                    <View style={styles.list}>
                        {members.map((member, index) => (
                            <View key={member.id} style={styles.listItem}>
                                <View style={styles.numberCol}>
                                    <Text style={styles.numberText}>
                                        {(index + 1).toString().padStart(2, '0')}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.card,
                                    member.isActive && styles.activeCard
                                ]}>
                                    <Image source={{ uri: member.avatar }} style={styles.avatar} />
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.nameText} numberOfLines={1}>{member.name}</Text>
                                        <Text style={styles.roleText}>{member.role}</Text>
                                    </View>
                                    <View style={styles.dragHandle}>
                                        <Text style={[
                                            styles.dragIcon,
                                            member.isActive ? { color: '#2b6cee' } : { color: '#64748b' }
                                        ]}>:::</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Bottom Padding */}
                    <View style={{ height: 120 }} />
                </ScrollView>

                {/* Floating Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={() => onContinue(members)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.saveBtnText}>Save & Continue</Text>
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
        backgroundColor: '#101622',
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#1c2333',
    },
    iconText: {
        fontSize: 24,
        color: '#ffffff',
        lineHeight: 28,
    },
    helpIcon: {
        fontSize: 18,
        color: '#9da6b9',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    progressContainer: {
        paddingVertical: 16,
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#101622',
    },
    progressBars: {
        flexDirection: 'row',
        gap: 8,
        width: 200,
    },
    bar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#282e39',
    },
    activeBar: {
        backgroundColor: '#2b6cee',
    },
    progressText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9da6b9',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
    },
    intro: {
        paddingVertical: 8,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
    },
    introDesc: {
        fontSize: 16,
        color: '#9da6b9',
        lineHeight: 24,
    },
    actionPanel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a202c',
        borderWidth: 1,
        borderColor: '#282e39',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
        marginBottom: 16,
    },
    actionTextCol: {
        gap: 4,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ffffff',
    },
    actionDesc: {
        fontSize: 12,
        color: '#9da6b9',
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginTop: 24,
        marginBottom: 12,
    },
    colHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9da6b9',
        letterSpacing: 1,
    },
    list: {
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    numberCol: {
        width: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
    },
    card: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#1a202c',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a303c',
        padding: 12,
        paddingRight: 16,
    },
    activeCard: {
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
        borderColor: 'rgba(43, 108, 238, 0.5)',
        borderWidth: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardInfo: {
        flex: 1,
    },
    nameText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    roleText: {
        fontSize: 12,
        color: '#9da6b9',
    },
    dragHandle: {
        padding: 4,
    },
    dragIcon: {
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -2,
        transform: [{ rotate: '90deg' }],
    },
    footer: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        pointerEvents: 'box-none',
    },
    saveBtn: {
        width: '100%',
        maxWidth: 400,
        height: 56,
        backgroundColor: '#2b6cee',
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    }
});
