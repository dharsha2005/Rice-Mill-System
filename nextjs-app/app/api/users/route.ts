import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { logActivity } from '@/lib/services/auditService';

export async function GET() {
    try {
        await connectDB();
        const users = await User.find().select('-password_hash').sort({ created_at: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { username, password, role } = body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        const newUser = await User.create({
            username,
            password_hash: password, // TODO: Hash password with bcrypt in production
            role,
            status: 'Active'
        });

        // Audit Log
        await logActivity({
            req: request,
            module: 'Users',
            action: 'CREATE',
            description: `Created new user: ${username} with role ${role}`,
            details: { user_id: newUser._id, username, role }
        });

        const userObj = newUser.toObject();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash: _ph, ...userResponse } = userObj;

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
