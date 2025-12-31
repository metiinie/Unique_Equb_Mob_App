import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { EqubFrequency, MemberStatus, UserRole } from '../../core/constants/enums';
import { EqubMember } from '../../domain/entities/equb_member';
import { EqubRepository } from '../../domain/repositories/equb_repository';
import { EqubId, MemberId } from '../../domain/value_objects/ids';
import { MockEqubRepository } from '../../infrastructure/mock/mock_equb_repository';

interface EqubEditScreenProps {
    equbId: EqubId;
    repository?: EqubRepository;
}

export const EqubEditScreen: React.FC<EqubEditScreenProps> = ({
    equbId,
    repository = new MockEqubRepository(),
}) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<EqubFrequency>(EqubFrequency.monthly);
    const [members, setMembers] = useState<EqubMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');

    useEffect(() => {
        let mounted = true;
        repository.getEqubById(equbId).then((equb) => {
            if (mounted) {
                setName(equb.name);
                setAmount(equb.contributionAmount.toString());
                setFrequency(equb.frequency);
                setMembers([...equb.members]);
                setLoading(false);
            }
        });
        return () => { mounted = false; };
    }, [equbId, repository]);

    const saveEqub = async () => {
        const contributionAmount = parseInt(amount, 10);
        if (isNaN(contributionAmount)) {
            Alert.alert('Invalid amount');
            return;
        }

        try {
            await repository.updateEqubDetails({
                equbId,
                name,
                contributionAmount,
                frequency,
            });
            setStatusMessage(`Saved by Admin at ${timeNow()}`);
        } catch (e: any) {
            setStatusMessage(`Error: ${e.message}`);
        }
    };

    const saveMembers = async () => {
        try {
            await repository.updateMembers({
                equbId,
                members,
            });
            setStatusMessage(`Members updated by Admin at ${timeNow()}`);
        } catch (e: any) {
            setStatusMessage(`Error: ${e.message}`);
        }
    };

    const addMember = () => {
        if (newMemberName.trim().length === 0 || newMemberPhone.trim().length === 0) return;

        const newMember = new EqubMember({
            memberId: new MemberId(`m${members.length + 1}`),
            name: newMemberName.trim(),
            maskedPhone: newMemberPhone.trim(),
            roleInEqub: UserRole.member,
            status: MemberStatus.onTime,
        });

        setMembers([...members, newMember]);
        setNewMemberName('');
        setNewMemberPhone('');
    };

    const removeMember = (id: MemberId) => {
        setMembers(members.filter((m) => m.memberId.value !== id.value));
    };

    const timeNow = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.appBar}>
                <Text style={styles.appBarTitle}>Edit Equb (Admin)</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {statusMessage && (
                    <Text style={styles.statusMessage}>{statusMessage}</Text>
                )}
                <Text style={styles.italicText}>
                    All actions are logged and visible; this editor is admin-only and in-memory.
                </Text>

                <View style={styles.spacer} />

                <Text style={styles.label}>Equb name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Contribution amount (ETB)</Text>
                <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyContainer}>
                    {[EqubFrequency.daily, EqubFrequency.weekly, EqubFrequency.monthly].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.frequencyItem,
                                frequency === f && styles.frequencyItemSelected
                            ]}
                            onPress={() => setFrequency(f)}
                        >
                            <Text style={frequency === f ? styles.frequencyTextSelected : undefined}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.spacer} />
                <Button title="Save Equb Details" onPress={saveEqub} />

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Members (in-memory)</Text>
                <View style={styles.spacerSmall} />

                {members.map((m) => (
                    <View key={m.memberId.value} style={styles.memberRow}>
                        <View>
                            <Text>{m.name} ({m.maskedPhone})</Text>
                            <Text style={styles.subtitle}>Role: Member</Text>
                        </View>
                        <TouchableOpacity onPress={() => removeMember(m.memberId)}>
                            <Text style={styles.deleteAction}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.spacer} />
                <Text style={styles.label}>Add member (name + masked phone)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={newMemberName}
                    onChangeText={setNewMemberName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Masked phone (+2519***XX)"
                    value={newMemberPhone}
                    onChangeText={setNewMemberPhone}
                />

                <View style={styles.spacer} />
                <View style={styles.buttonRow}>
                    <View style={styles.buttonWrapper}>
                        <Button title="Add Member" onPress={addMember} />
                    </View>
                    <View style={styles.buttonWrapper}>
                        <Button title="Save Members" onPress={saveMembers} />
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appBar: {
        height: 56,
        backgroundColor: '#fff',
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    appBarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    statusMessage: {
        fontStyle: 'italic',
        marginBottom: 12,
    },
    italicText: {
        fontStyle: 'italic',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        fontSize: 16,
        marginBottom: 8,
    },
    spacer: {
        height: 16,
    },
    spacerSmall: {
        height: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    frequencyContainer: {
        flexDirection: 'row',
    },
    frequencyItem: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginRight: 8,
    },
    frequencyItemSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#e6f7ff',
    },
    frequencyTextSelected: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
    memberRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
    deleteAction: {
        color: 'red',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    buttonWrapper: {
        flex: 1,
    },
});
