// User and Authentication Types
export interface User {
    _id: string;
    username: string;
    role: string;
    status: 'Active' | 'Disabled';
}

export interface PermissionSet {
    read: boolean;
    write: boolean;
}

export type Permissions = Record<string, PermissionSet>;

export interface LoginResponse {
    token: string;
    user: {
        username: string;
        role: string;
    };
    permissions: Permissions;
}

// Procurement Types
export interface Procurement {
    _id: string;
    supplier_name: string;
    paddy_type: string;
    moisture_percentage?: number;
    quantity: number;
    rate_per_quintal: number;
    total_amount: number;
    paid_amount: number;
    purchase_date: string | Date;
    payment_status: 'Pending' | 'Paid' | 'Partial';
}

// Sales Types
export interface Sales {
    _id: string;
    invoice_number: string;
    customer_name: string;
    rice_variety: string;
    grade: string;
    bag_size: number;
    quantity_bags: number;
    rate_per_bag: number;
    transport_charge: number;
    gst_amount: number;
    total_amount: number;
    paid_amount: number;
    payment_status: 'Paid' | 'Pending' | 'Partial';
    sale_date: string | Date;
}

// Milling Types
export interface Milling {
    _id: string;
    batch_id: string;
    paddy_type: string;
    input_paddy_qty: number;
    output_rice_qty: number;
    broken_rice_qty: number;
    husk_qty: number;
    efficiency_percentage: number;
    loss_percentage: number;
    milling_date: string | Date;
}

// Inventory Types
export interface Inventory {
    _id: string;
    rice_variety: string;
    grade: string;
    bag_size: number;
    quantity: number;
    godown_location: string;
    minimum_threshold: number;
    updated_at: string | Date;
}

// Expense Types
export interface Expense {
    _id: string;
    category: 'Electricity' | 'Labor' | 'Transport' | 'Maintenance' | 'Packaging' | 'Diesel' | 'Other';
    description?: string;
    amount: number;
    payment_mode: 'Cash' | 'Bank';
    expense_date: string | Date;
    created_at: string | Date;
}

// Receivable/Payable display types (Sales/Procurement + pending_amount)
export interface ReceivableItem {
    _id: string;
    invoice_number: string;
    customer_name: string;
    sale_date: string | Date;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
}

export interface PayableItem {
    _id: string;
    supplier_name: string;
    purchase_date: string | Date;
    paddy_type: string;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
}

// Payment Types
export interface Payment {
    _id: string;
    ref_type: 'Sales' | 'Procurement' | 'Expense';
    ref_id: string;
    amount: number;
    payment_mode: 'Cash' | 'Bank';
    notes?: string;
    payment_date: string | Date;
    created_at: string | Date;
}

// Alert Types
export interface Alert {
    _id: string;
    type: string;
    message: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'New' | 'Read' | 'Resolved';
    created_at: string | Date;
}

// Audit Log Types
export interface AuditLog {
    _id: string;
    user_id?: string;
    user_name: string;
    module: string;
    action: string;
    description: string;
    details?: Record<string, unknown>;
    ip_address?: string;
    timestamp: string | Date;
}

// Rice Variety Types
export interface RiceVariety {
    _id: string;
    name: string;
    code?: string;
    is_active: boolean;
}

// Dashboard Metrics Types
export interface DashboardMetrics {
    totalProcurement: number;
    totalSales: number;
    totalExpenses: number;
    currentStock: number;
    pendingPayments: number;
    recentAlerts: Alert[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}
