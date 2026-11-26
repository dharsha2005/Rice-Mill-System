import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RolePermission from '@/lib/models/RolePermission';
import { logActivity } from '@/lib/services/auditService';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { role, permissions } = body;

        if (!role || !permissions || typeof permissions !== 'object' || Array.isArray(permissions)) {
            return NextResponse.json(
                { error: 'Valid role and permissions object are required' },
                { status: 400 }
            );
        }

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
            permissions: roleDoc.permissions instanceof Map
                ? Object.fromEntries(roleDoc.permissions)
                : (roleDoc.permissions || {})
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
