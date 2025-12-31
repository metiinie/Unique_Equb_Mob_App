import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

/**
 * UpdateMembersScreen: Mobile execution boundary for updating Equb members.
 *
 * ARCHITECTURE BOUNDARY:
 * This screen sits at the presentation/infrastructure boundary. It:
 * 1. Collects user input (equbId, members JSON, optional commandId)
 * 2. Sends HTTP request to backend with auth headers
 * 3. Displays success or raw domain error (unchanged)
 * 4. No retries, no optimistic UI, no client-side business rules
 *
 * CRITICAL GUARANTEES PRESERVED:
 * - Sends intent only (no business logic)
 * - Domain errors displayed exactly as received (no translation, no hiding)
 * - No retries, no auto-recovery, no silent handling
 * - Auth headers sent (actorId never in request body)
 * - Minimal state (loading, result message)
 *
 * This aligns with:
 * - RULES.md: "Transparency over beauty", "Trust over convenience"
 * - BACKEND_FAILURE_BEHAVIOR.md: "Truth > Availability", abort-only behavior
 * - Mobile execution boundary design: Client sends intent, backend decides truth
 */
export const UpdateMembersScreen: React.FC = () => {
    const [equbId, setEqubId] = useState('');
    const [membersJsonInput, setMembersJsonInput] = useState('');
    const [commandIdInput, setCommandIdInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultMessage, setResultMessage] = useState<string | null>(null);

    const submit = async () => {
        // Basic form completeness check only (no business rules)
        if (equbId.trim().length === 0) {
            setResultMessage('Equb ID is required');
            return;
        }

        if (membersJsonInput.trim().length === 0) {
            setResultMessage('Members JSON is required');
            return;
        }

        setLoading(true);
        setResultMessage(null);

        try {
            // Prepare request body
            const body: Record<string, any> = {
                equbId: equbId.trim(),
            };

            // Parse members JSON (basic validation only - backend will validate structure)
            try {
                const membersJson = JSON.parse(membersJsonInput.trim());
                body['members'] = membersJson;
            } catch (e) {
                setLoading(false);
                setResultMessage(`Invalid JSON format: ${e}`);
                return;
            }

            const commandId = commandIdInput.trim();
            if (commandId.length > 0) {
                body['commandId'] = commandId;
            } else {
                // Auto-generate commandId if not provided
                body['commandId'] = `mobile-${Date.now()}`;
            }

            // Make HTTP request
            const responseBody = await makeRequest(body);

            setLoading(false);
            setResultMessage(responseBody);
        } catch (e) {
            // Network or unexpected errors
            setLoading(false);
            setResultMessage(`Network error: ${e}`);
        }
    };

    const makeRequest = async (body: Record<string, any>): Promise<string> => {
        // CRITICAL: Use actual backend URL in production
        // For MVP: Using localhost
        const baseUrl = 'http://localhost:8080'; // TODO: Replace with actual backend URL
        const url = `${baseUrl}/api/update-members`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // CRITICAL: Only Authorization header is sent (actorId never in body)
                    // For MVP: Using simple format "Bearer userId:role" (in production, use JWT token)
                    // TODO: Get userId and role from secure storage in production
                    'Authorization': 'Bearer admin-1:admin', // TODO: Get from secure storage
                },
                body: JSON.stringify(body),
            });

            const text = await response.text();
            return `HTTP ${response.status}\n${text}`;
        } catch (error) {
            throw error;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.appBar}>
                <Text style={styles.appBarTitle}>Update Members</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Equb ID *</Text>
                <TextInput
                    style={styles.input}
                    value={equbId}
                    onChangeText={setEqubId}
                    editable={!loading}
                />

                <Text style={styles.label}>Members JSON *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={membersJsonInput}
                    onChangeText={setMembersJsonInput}
                    editable={!loading}
                    multiline
                    numberOfLines={10}
                    placeholder='JSON array of members'
                />

                <Text style={styles.label}>Command ID (optional, auto-generated if empty)</Text>
                <TextInput
                    style={styles.input}
                    value={commandIdInput}
                    onChangeText={setCommandIdInput}
                    editable={!loading}
                />

                <View style={styles.spacer} />

                <Button
                    title={loading ? 'Loading...' : 'Submit'}
                    onPress={submit}
                    disabled={loading}
                />

                <View style={styles.spacer} />

                {resultMessage && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultText}>{resultMessage}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
        fontFamily: 'monospace',
    },
    spacer: {
        height: 24,
    },
    resultContainer: {
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
    },
    resultText: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
});
