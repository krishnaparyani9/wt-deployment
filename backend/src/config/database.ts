import mongoose from 'mongoose';

export async function connectDatabase(uri: string | undefined): Promise<void> {
  if (!uri) {
    console.warn('MONGODB_URI is not set. Configure it in .env to enable MongoDB persistence.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Could not connect to MongoDB:', message);
    throw error;
  }
}
