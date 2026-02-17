import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI is undefined in process.env");
        throw new Error('MONGODB_URI is missing. Please add it to your Vercel Environment Variables.');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        console.log("🔄 Connecting to MongoDB...");
        const opts = {
            // bufferCommands: true, // Auto-buffering is better for serverless
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log("✅ New MongoDB Connection Established");
            return mongoose;
        }).catch(err => {
            console.error("❌ MongoDB Connection Error:", err);
            throw err;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
