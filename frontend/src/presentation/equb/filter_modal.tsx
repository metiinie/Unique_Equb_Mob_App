import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Theme } from '../theme';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: string[]) => void;
}

const { height } = Dimensions.get('window');

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply }) => {
    const [selectedFilters, setSelectedFilters] = useState<string[]>(['Good Standing']);

    const filterOptions = [
        { id: 'Good Standing', icon: '✅', label: 'Good Standing', sub: 'On-time payers', iconBg: 'rgba(34, 197, 94, 0.2)', iconColor: '#16a34a' },
        { id: 'Late Payment', icon: '⚠️', label: 'Late Payment', sub: 'Delayed payments', iconBg: 'rgba(245, 158, 11, 0.2)', iconColor: '#d97706' },
        { id: 'Payment Missed', icon: '❌', label: 'Payment Missed', sub: 'Skipped payments', iconBg: 'rgba(239, 68, 68, 0.2)', iconColor: '#dc2626' },
        { id: 'Locked / Inactive', icon: '🔒', label: 'Locked / Inactive', sub: 'Frozen accounts', iconBg: 'rgba(100, 116, 139, 0.2)', iconColor: '#64748b' },
    ];

    const toggleFilter = (id: string) => {
        if (selectedFilters.includes(id)) {
            setSelectedFilters(selectedFilters.filter(f => f !== id));
        } else {
            setSelectedFilters([...selectedFilters, id]);
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <View style={styles.modalContent}>
                            {/* Handle */}
                            <View style={styles.handleContainer}>
                                <View style={styles.handle} />
                            </View>

                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Filter Members</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Text style={styles.closeIcon}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Scrollable Content */}
                            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                <View style={styles.titleSection}>
                                    <Text style={styles.title}>Filter by Status</Text>
                                    <Text style={styles.subtitle}>Select one or more statuses to view.</Text>
                                </View>

                                <View style={styles.grid}>
                                    {filterOptions.map((option) => {
                                        const isSelected = selectedFilters.includes(option.id);
                                        return (
                                            <TouchableOpacity
                                                key={option.id}
                                                style={[
                                                    styles.card,
                                                    isSelected && styles.selectedCard
                                                ]}
                                                onPress={() => toggleFilter(option.id)}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.cardHeader}>
                                                    <View style={[styles.iconBox, { backgroundColor: option.iconBg }]}>
                                                        <Text style={{ color: option.iconColor, fontSize: 16 }}>{option.icon}</Text>
                                                    </View>
                                                    <View style={[
                                                        styles.checkbox,
                                                        isSelected ? styles.checkedBox : styles.uncheckedBox
                                                    ]}>
                                                        {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                                                    </View>
                                                </View>
                                                <Text style={[styles.cardTitle, isSelected ? { color: '#2b6cee' } : { color: '#ffffff' }]}>
                                                    {option.label}
                                                </Text>
                                                <Text style={styles.cardSub}>{option.sub}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>

                            {/* Footer Buttons */}
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={styles.resetButton}
                                    onPress={() => setSelectedFilters([])}
                                >
                                    <Text style={styles.resetText}>Reset</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={() => onApply(selectedFilters)}
                                >
                                    <Text style={styles.applyText}>Apply Filters</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#101622',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: height * 0.9,
        width: '100%',
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 48,
        height: 6,
        backgroundColor: '#334155',
        borderRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    closeIcon: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: 'bold',
    },
    content: {
        paddingHorizontal: 24,
    },
    titleSection: {
        paddingVertical: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#94a3b8',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 24,
    },
    card: {
        width: '48%', // Approx 2 columns
        backgroundColor: '#1c2333',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2d364a',
    },
    selectedCard: {
        borderColor: '#2b6cee',
        backgroundColor: 'rgba(43, 108, 238, 0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    checkedBox: {
        backgroundColor: '#2b6cee',
        borderColor: '#2b6cee',
    },
    uncheckedBox: {
        borderColor: '#475569',
    },
    checkIcon: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardSub: {
        fontSize: 12,
        color: '#64748b',
    },
    footer: {
        flexDirection: 'row',
        padding: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        gap: 16,
        marginBottom: 20, // Bottom safe area buffer
    },
    resetButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155',
    },
    resetText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    applyButton: {
        flex: 2,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2b6cee',
        shadowColor: '#2b6cee',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    applyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
});
