import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import api from '../api/axiosConfig';

const AddProcurementScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        supplier_name: '',
        paddy_type: '',
        moisture_percentage: '',
        quantity: '',
        rate_per_quintal: '',
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        const qty = parseFloat(formData.quantity) || 0;
        const rate = parseFloat(formData.rate_per_quintal) || 0;
        return (qty * rate).toLocaleString();
    };

    const handleSubmit = async () => {
        if (!formData.supplier_name || !formData.paddy_type || !formData.quantity || !formData.rate_per_quintal) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                moisture_percentage: parseFloat(formData.moisture_percentage),
                quantity: parseFloat(formData.quantity),
                rate_per_quintal: parseFloat(formData.rate_per_quintal),
                total_amount: parseFloat(formData.quantity) * parseFloat(formData.rate_per_quintal),
                purchase_date: new Date() // Server might handle this, but sending it just in case
            };

            const response = await api.post('/procurement', payload);

            if (response.data || response.status === 201 || response.status === 200) {
                Alert.alert('Success', 'Procurement added successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to add procurement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>Supplier Name *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.supplier_name}
                    onChangeText={(text) => handleChange('supplier_name', text)}
                    placeholder="e.g. Farmer Ramarao"
                />

                <Text style={styles.label}>Paddy Type *</Text>
                <TextInput
                    style={styles.input}
                    value={formData.paddy_type}
                    onChangeText={(text) => handleChange('paddy_type', text)}
                    placeholder="e.g. MTU 1010"
                />

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Quantity (Quintals) *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.quantity}
                            onChangeText={(text) => handleChange('quantity', text)}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Rate per Quintal *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.rate_per_quintal}
                            onChangeText={(text) => handleChange('rate_per_quintal', text)}
                            keyboardType="numeric"
                            placeholder="₹0"
                        />
                    </View>
                </View>

                <Text style={styles.label}>Moisture Percentage (%)</Text>
                <TextInput
                    style={styles.input}
                    value={formData.moisture_percentage}
                    onChangeText={(text) => handleChange('moisture_percentage', text)}
                    keyboardType="numeric"
                    placeholder="e.g. 14.5"
                />

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalValue}>₹{calculateTotal()}</Text>
                </View>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Procurement</Text>}
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
        color: '#2563eb',
    },
    submitBtn: {
        backgroundColor: '#2563eb',
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

export default AddProcurementScreen;
