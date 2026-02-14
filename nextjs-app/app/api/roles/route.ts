import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RolePermission from '@/lib/models/RolePermission';

export async function GET() {
    try {
        await connectDB();
        const roles = await RolePermission.find();

        // Convert Map to plain object for JSON serialization
        const rolesData = roles.map(role => ({
            _id: role._id,
            role: role.role,
            permissions: Object.fromEntries(role.permissions)
        }));

        return NextResponse.json(rolesData);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
