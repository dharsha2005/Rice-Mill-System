import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RolePermission from '@/lib/models/RolePermission';

export async function POST() {
    try {
        await connectDB();

        const defaultRoles = [
            {
                role: 'Proprietor',
                permissions: new Map(Object.entries({
                    dashboard: { read: true, write: true },
                    procurement: { read: true, write: true },
                    milling: { read: true, write: true },
                    inventory: { read: true, write: true },
                    sales: { read: true, write: true },
                    expenses: { read: true, write: true },
                    reports: { read: true, write: true },
                    accounts: { read: true, write: true },
                    settings: { read: true, write: true },
                    audit_logs: { read: true, write: false }
                }))
            },
            {
                role: 'Manager',
                permissions: new Map(Object.entries({
                    dashboard: { read: true, write: false },
                    procurement: { read: true, write: true },
                    milling: { read: true, write: true },
                    inventory: { read: true, write: true },
                    sales: { read: true, write: true },
                    expenses: { read: true, write: true },
                    reports: { read: true, write: false },
                    accounts: { read: true, write: false },
                    settings: { read: false, write: false },
                    audit_logs: { read: false, write: false }
                }))
            },
            {
                role: 'Staff',
                permissions: new Map(Object.entries({
                    dashboard: { read: true, write: false },
                    procurement: { read: true, write: false },
                    milling: { read: true, write: false },
                    inventory: { read: true, write: false },
                    sales: { read: true, write: true },
                    expenses: { read: false, write: false },
                    reports: { read: false, write: false },
                    accounts: { read: false, write: false },
                    settings: { read: false, write: false },
                    audit_logs: { read: false, write: false }
                }))
            }
        ];

        for (const roleData of defaultRoles) {
            await RolePermission.findOneAndUpdate(
                { role: roleData.role },
                { permissions: roleData.permissions },
                { upsert: true }
            );
        }

        return NextResponse.json({ message: 'Roles seeded successfully' });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
