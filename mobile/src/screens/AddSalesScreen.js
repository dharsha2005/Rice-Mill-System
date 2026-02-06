import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import api from '../api/axiosConfig';

const AddSalesScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: '',
        rice_variety: '',
        quantity_bags: '',
        bag_size: '25', // Default assumption
        rate_per_bag: '',
        payment_status: 'Pending'
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        const qty = parseFloat(formData.quantity_bags) || 0;
        const rate = parseFloat(formData.rate_per_bag) || 0;
        return (qty * rate).toLocaleString();
    };

    const handleSubmit = async () => {
        if (!formData.customer_name || !formData.rice_variety || !formData.quantity_bags || !formData.rate_per_bag) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                quantity_bags: parseFloat(formData.quantity_bags),
                bag_size: parseFloat(formData.bag_size),
                rate_per_bag: parseFloat(formData.rate_per_bag),
                total_amount: parseFloat(formData.quantity_bags) * parseFloat(formData.rate_per_bag),
                sale_date: new Date()
            };

            const response = await api.post('/sales', payload);

            if (response.data || response.status === 201 || response.status === 200) {
                Alert.alert('Success', 'Sale recorded successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to record sale');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Customer Name *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.customer_name}
                    onChangeText={(text) => handleChange('customer_name', text)}
                    placeholder="e.g. RK Traders"
                />

                <Text style={styles.label}>Rice Variety *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.rice_variety}
                    onChangeText={(text) => handleChange('rice_variety', text)}
                    placeholder="e.g. Sona Masoori"
                />

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>No. of Bags *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.quantity_bags}
                            onChangeText={(text) => handleChange('quantity_bags', text)}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Bag Size (kg)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.bag_size}
                            onChangeText={(text) => handleChange('bag_size', text)}
                            keyboardType="numeric"
                            placeholder="25"
                        />
                    </View>
                </View>

                <Text style={styles.label}>Rate per Bag *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.rate_per_bag}
                    onChangeText={(text) => handleChange('rate_per_bag', text)}
                    keyboardType="numeric"
                    placeholder="₹0"
                />

                <Text style={styles.label}>Payment Status</Text>
                <View style={styles.statusRow}>
                    {['Paid', 'Pending', 'Partially Paid'].map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.statusChip, formData.payment_status === status && styles.statusChipActive]}
                            onPress={() => handleChange('payment_status', status)}
                        >
                            <Text style={[styles.statusText, formData.payment_status === status && styles.statusTextActive]}>
                                {status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
                </View>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Record Sale</Text>}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    form: {
        padding: 20,
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    statusChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statusChipActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#2563eb',
    },
    statusText: {
        color: '#6b7280',
        fontSize: 14,
    },
    statusTextActive: {
        color: '#2563eb',
        fontWeight: '600',
    },
    totalContainer: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4b5563',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    submitBtn: {
        backgroundColor: '#16a34a',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default AddSalesScreen;
