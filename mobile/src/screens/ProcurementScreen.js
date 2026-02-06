import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../api/axiosConfig';

const ProcurementScreen = ({ navigation }) => {
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProcurements();
    }, []);

    const fetchProcurements = async () => {
        try {
            const response = await api.get('/procurement');
            // Adjust based on actual API response structure (might be response.data.procurements)
            setProcurements(Array.isArray(response.data) ? response.data : response.data.procurements || []);
        } catch (error) {
            console.error('Error fetching procurements:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={styles.row}>
                <Text style={styles.supplier}>{item.supplier_name}</Text>
                <Text style={styles.date}>{new Date(item.purchase_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.detail}>{item.paddy_type}</Text>
                <Text style={styles.amount}>₹{item.total_amount?.toLocaleString()}</Text>
            </View>
            <Text style={styles.subDetail}>{item.quantity} Quintals @ ₹{item.rate_per_quintal}/q</Text>
        </View>
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Procurement History</Text>
            <FlatList
                data={procurements}
                renderItem={renderItem}
                keyExtractor={(item) => item._id || Math.random().toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No records found</Text>}
            />
            <View style={styles.fabContainer}>
                <Text style={styles.fab} onPress={() => navigation.navigate('AddProcurement')}>+</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1f2937',
    },
    list: {
        gap: 12,
    },
    item: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    supplier: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    date: {
        fontSize: 14,
        color: '#6b7280',
    },
    detail: {
        fontSize: 14,
        color: '#374151',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    subDetail: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    empty: {
        textAlign: 'center',
        color: '#6b7280',
        marginTop: 24,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    fab: {
        backgroundColor: '#2563eb',
        width: 56,
        height: 56,
        borderRadius: 28,
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 56,
        color: '#fff',
        fontSize: 32,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});

export default ProcurementScreen;
