import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // recommended options; mongoose v6+ uses sensible defaults but keeping explicit options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // rethrow so caller can decide how to handle (do not exit here)
    throw error;
  }
};
