import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RolePermission from '@/lib/models/RolePermission';
import { logActivity } from '@/lib/services/auditService';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { role, permissions } = body;

        const roleDoc = await RolePermission.findOneAndUpdate(
            { role },
            { permissions: new Map(Object.entries(permissions)) },
            { upsert: true, new: true }
        );

        // Audit Log
        await logActivity({
            req: request,
            module: 'Roles',
            action: 'UPDATE',
            description: `Updated permissions for role: ${role}`,
            details: { role, permissions }
        });

        return NextResponse.json({
            _id: roleDoc._id,
            role: roleDoc.role,
            permissions: Object.fromEntries(roleDoc.permissions)
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
