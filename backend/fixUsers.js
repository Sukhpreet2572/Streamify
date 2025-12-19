import mongoose from "mongoose";
import "dotenv/config";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema({
  fullName: String,
  username: String,
  email: String,
  isOnboarded: Boolean,
  nativeLanguage: String,
  learningLanguage: String,
  location: String,
  bio: String,
  interests: [String],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const checkAndFixUsers = async () => {
  await connectDB();
  
  console.log("\n=== Checking all users ===");
  const allUsers = await User.find({}).select("username fullName email isOnboarded");
  
  console.log(`\nTotal users in database: ${allUsers.length}`);
  allUsers.forEach(user => {
    console.log(`- ${user.username} (${user.fullName}): isOnboarded = ${user.isOnboarded}`);
  });
  
  console.log("\n=== Looking for Mike and Eleven ===");
  const mike = await User.findOne({ username: { $regex: /mike/i } });
  const eleven = await User.findOne({ username: { $regex: /eleven/i } });
  
  if (mike) {
    console.log(`\nFound Mike:`);
    console.log(`  Username: ${mike.username}`);
    console.log(`  Email: ${mike.email}`);
    console.log(`  isOnboarded: ${mike.isOnboarded}`);
    
    if (!mike.isOnboarded) {
      console.log(`  -> Updating Mike's isOnboarded to true...`);
      await User.findByIdAndUpdate(mike._id, { isOnboarded: true });
      console.log(`  -> Mike updated!`);
    }
  } else {
    console.log("\nMike not found in database");
  }
  
  if (eleven) {
    console.log(`\nFound Eleven:`);
    console.log(`  Username: ${eleven.username}`);
    console.log(`  Email: ${eleven.email}`);
    console.log(`  isOnboarded: ${eleven.isOnboarded}`);
    
    if (!eleven.isOnboarded) {
      console.log(`  -> Updating Eleven's isOnboarded to true...`);
      await User.findByIdAndUpdate(eleven._id, { isOnboarded: true });
      console.log(`  -> Eleven updated!`);
    }
  } else {
    console.log("\nEleven not found in database");
  }
  
  console.log("\n=== Done! ===");
  process.exit(0);
};

checkAndFixUsers();
