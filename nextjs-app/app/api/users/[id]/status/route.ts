import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { logActivity } from '@/lib/services/auditService';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Toggle status
        user.status = user.status === 'Active' ? 'Disabled' : 'Active';
        await user.save();

        // Audit Log
        await logActivity({
            req: request,
            module: 'Users',
            action: 'UPDATE',
            description: `${user.status === 'Active' ? 'Enabled' : 'Disabled'} user: ${user.username}`,
            details: { user_id: user._id, username: user.username, new_status: user.status }
        });

        return NextResponse.json({
            message: `User ${user.status === 'Active' ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
