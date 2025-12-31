import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { GlobalRole } from '../../core/constants/enums';
import { ApiClient } from '../services/api_client';
import { useAuth } from '../../application/auth/auth_context';
import { EqubOverviewSection } from './sections/EqubOverviewSection';
import { ContributionsSection } from './sections/ContributionsSection';
import { MembersSection } from './sections/MembersSection';
import { PayoutsSection } from './sections/PayoutsSection';

interface MyEqubTabScreenProps {
    navigation: any;
}

export const MyEqubTabScreen: React.FC<MyEqubTabScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEqubs = async () => {
            try {
                const result = await ApiClient.get('/reports/member/dashboard');
                setData(result);
            } catch (error) {
                console.error('[MyEqubTabScreen] Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEqubs();
    }, []);

    if (loading) return null;

    const hasEqubs = data?.myEqubs && data.myEqubs.length > 0;

    if (!hasEqubs) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📂</Text>
                    <Text style={styles.emptyTitle}>You are not part of any Equb yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Join an Equb to start saving and participating in rotating payouts with your community.
                    </Text>
                    <TouchableOpacity
                        style={styles.exploreBtn}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.exploreBtnText}>Go to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const primaryEqub = data.myEqubs[0];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.equbHeader}>
                    <Text style={styles.equbName}>{primaryEqub.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: primaryEqub.status === 'ACTIVE' ? '#22c55e22' : '#f59e0b22' }]}>
                        <Text style={[styles.statusText, { color: primaryEqub.status === 'ACTIVE' ? '#22c55e' : '#f59e0b' }]}>
                            {primaryEqub.status}
                        </Text>
                    </View>
                </View>

                <View>
                    <EqubOverviewSection equb={primaryEqub} />
                </View>

                <View>
                    <ContributionsSection role={user?.role as any} equbId={primaryEqub.id} />
                </View>

                <View>
                    <PayoutsSection
                        role={user?.role as any}
                        equbId={primaryEqub.id}
                        onPayoutAction={(action) => console.log('Payout Action:', action)}
                    />
                </View>

                <View>
                    <MembersSection
                        role={user?.role as any}
                        equbId={primaryEqub.id}
                        onViewAll={() => navigation.navigate('MembersTabScreen')}
                    />
                </View>

                {user?.role === GlobalRole.ADMIN && (
                    <View style={styles.adminSection}>
                        <Text style={styles.adminTitle}>Administration</Text>
                        <Text style={styles.adminText}>As an administrator, you have full control over this Equb's lifecycle.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101622',
    },
    contentContainer: {
        padding: 16,
        gap: 20,
    },
    equbHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    equbName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 99,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    exploreBtn: {
        backgroundColor: '#2b6cee',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exploreBtnText: {
        color: '#ffffff',
        fontWeight: '700',
    },
    adminSection: {
        backgroundColor: '#1e293b',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#334155',
        marginTop: 10,
    },
    adminTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 8,
    },
    adminText: {
        fontSize: 14,
        color: '#94a3b8',
        lineHeight: 20,
    },
});
