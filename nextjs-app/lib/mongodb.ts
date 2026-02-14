import mongoose from 'mongoose';
import dns from 'dns';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Emulate dns.setDefaultResultOrder('ipv4first') for robust connection
if (dns && typeof dns.setDefaultResultOrder === 'function') {
    try {
        dns.setDefaultResultOrder('ipv4first');
    } catch (e) {
        console.warn('Failed to set DNS result order', e);
    }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    (global as any).mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Forces IPv4 which is more stable for MongoDB Atlas connections
            family: 4
        };

        console.log('Connecting to MongoDB...');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('MongoDB connected successfully');
            return mongoose;
        }).catch(err => {
            console.error('MongoDB Connection Error:', err);
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('Failed to resolve MongoDB connection promise:', e);
        throw e;
    }

    return cached.conn;
}

export default connectDB;
