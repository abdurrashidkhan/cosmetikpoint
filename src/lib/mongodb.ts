import mongoose, { type Mongoose } from 'mongoose';

// ============================================================================
// Types & Global Cache (Prevents multiple connections during Next.js HMR)
// ============================================================================

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = cached;

// ============================================================================
// Database Connection Helper
// ============================================================================

export async function connectMongodb(): Promise<Mongoose> {
  // Support both MONGODB_URI (standard) and DB_URL (legacy)
  const mongoUri = process.env.MONGODB_URI || process.env.DB_URL;

  if (!mongoUri) {
    throw new Error(
      'Missing MongoDB connection string. Set MONGODB_URI (or DB_URL) in .env.local'
    );
  }

  // Return existing active connection if already connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Create a single pending connection promise to avoid duplicate connections
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log('MongoDB connected successfully');
        return mongooseInstance;
      })
      .catch((error: unknown) => {
        cached.promise = null;
        console.error('MongoDB connection failed:', error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongodb;
