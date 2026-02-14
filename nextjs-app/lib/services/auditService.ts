import { NextRequest } from 'next/server';
import AuditLog from '@/lib/models/AuditLog';

interface LogActivityParams {
    req?: NextRequest;
    user_name?: string;
    user_id?: string;
    module: string;
    action: string;
    description: string;
    details?: Record<string, unknown>;
}

/**
 * Logs a user activity to the database.
 */
export async function logActivity({
    req,
    user_name,
    user_id,
    module,
    action,
    description,
    details
}: LogActivityParams): Promise<void> {
    try {
        let finalUserName = user_name || 'System';
        let finalUserId = user_id || null;
        let ipAddress = '127.0.0.1';

        // Try to extract from request if available
        if (req) {
            // In Next.js, we can get IP from headers
            ipAddress = req.headers.get('x-forwarded-for') ||
                req.headers.get('x-real-ip') ||
                '127.0.0.1';

            // Extract user from headers if auth middleware set it
            const userHeader = req.headers.get('x-user');
            if (userHeader) {
                try {
                    const user = JSON.parse(userHeader);
                    finalUserName = user.username;
                    finalUserId = user._id;
                } catch {
                    // Ignore parsing errors
                }
            }
        }

        await AuditLog.create({
            ...(finalUserId && { user_id: finalUserId }),
            user_name: finalUserName,
            module,
            action: action.toUpperCase(),
            description,
            details,
            ip_address: ipAddress,
            timestamp: new Date()
        });

    } catch (err) {
        // Silently fail to avoid disrupting the main flow, but log to console
        console.error('AUDIT LOGGING FAILED:', (err as Error).message);
    }
}
