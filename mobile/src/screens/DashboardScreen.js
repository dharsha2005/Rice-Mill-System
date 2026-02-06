import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, TrendingUp, LogOut } from 'lucide-react-native';

const DashboardCard = ({ title, value, color, icon: Icon }) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{title}</Text>
            {Icon && <Icon size={20} color={color} />}
        </View>
        <Text style={styles.cardValue}>{value}</Text>
    </View>
);

const DashboardScreen = ({ navigation }) => {
    const [metrics, setMetrics] = useState(null);
    const [profitSummary, setProfitSummary] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const { user, logout } = useAuth();

    const fetchData = async () => {
        try {
            const [metricsRes, profitRes] = await Promise.all([
                api.get('/dashboard/metrics'),
                api.get('/profit-loss/summary')
            ]);
            setMetrics(metricsRes.data);
            setProfitSummary(profitRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.header}>Welcome, {user?.username}</Text>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <LogOut size={24} color="#ef4444" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.grid}>
                    <DashboardCard
                        title="Total Procurement"
                        value={`₹${metrics?.totalProcurementValue?.toLocaleString() || '0'}`}
                        color="#2563eb"
                        icon={ShoppingCart}
                    />
                    <DashboardCard
                        title="Total Sales"
                        value={`₹${profitSummary?.totalSales?.toLocaleString() || '0'}`}
                        color="#16a34a"
                        icon={TrendingUp}
                    />
                    <DashboardCard
                        title="Net Profit"
                        value={`₹${profitSummary?.netProfit?.toLocaleString() || '0'}`}
                        color="#7c3aed"
                    />
                </View>

                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Procurement')}
                    >
                        <ShoppingCart size={32} color="#2563eb" />
                        <Text style={styles.actionText}>Procurement</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Sales')}
                    >
                        <TrendingUp size={32} color="#16a34a" />
                        <Text style={styles.actionText}>Sales</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    scrollContent: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoutBtn: {
        padding: 8,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        width: '48%',
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        justifyContent: 'space-between',
        minHeight: 100,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 12,
        color: '#6b7280',
        flex: 1,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    actionText: {
        fontWeight: '600',
        color: '#374151',
    }
});

export default DashboardScreen;
