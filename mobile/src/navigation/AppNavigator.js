import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProcurementScreen from '../screens/ProcurementScreen';
import SalesScreen from '../screens/SalesScreen';
import AddProcurementScreen from '../screens/AddProcurementScreen';
import AddSalesScreen from '../screens/AddSalesScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen
                            name="Procurement"
                            component={ProcurementScreen}
                            options={{ headerShown: true, title: 'Procurement' }}
                        />
                        <Stack.Screen
                            name="AddProcurement"
                            component={AddProcurementScreen}
                            options={{ headerShown: true, title: 'New Procurement' }}
                        />
                        <Stack.Screen
                            name="Sales"
                            component={SalesScreen}
                            options={{ headerShown: true, title: 'Sales' }}
                        />
                        <Stack.Screen
                            name="AddSales"
                            component={AddSalesScreen}
                            options={{ headerShown: true, title: 'New Sale' }}
                        />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
