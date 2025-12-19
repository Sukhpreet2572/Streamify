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
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const friendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "pending" },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

const checkRelationship = async () => {
  await connectDB();
  
  console.log("\n=== Checking Mike and Eleven Relationship ===");
  
  const mike = await User.findOne({ username: { $regex: /^mike$/i } }).populate('friends', 'username');
  const eleven = await User.findOne({ username: { $regex: /^eleven$/i } }).populate('friends', 'username');
  
  if (!mike || !eleven) {
    console.log("Could not find both users!");
    process.exit(1);
  }
  
  console.log(`\nMike (ID: ${mike._id}):`);
  console.log(`  Friends (${mike.friends.length}):`, mike.friends.map(f => f.username));
  
  console.log(`\nEleven (ID: ${eleven._id}):`);
  console.log(`  Friends (${eleven.friends.length}):`, eleven.friends.map(f => f.username));
  
  // Check if they are friends
  const areTheyFriends = mike.friends.some(f => f._id.toString() === eleven._id.toString());
  console.log(`\nAre Mike and Eleven friends? ${areTheyFriends}`);
  
  // Check friend requests from Mike to Eleven
  const mikeToEleven = await FriendRequest.findOne({
    sender: mike._id,
    recipient: eleven._id
  });
  console.log(`\nFriend request from Mike to Eleven:`, mikeToEleven ? `${mikeToEleven.status} (ID: ${mikeToEleven._id})` : 'None');
  
  // Check friend requests from Eleven to Mike
  const elevenToMike = await FriendRequest.findOne({
    sender: eleven._id,
    recipient: mike._id
  });
  console.log(`Friend request from Eleven to Mike:`, elevenToMike ? `${elevenToMike.status} (ID: ${elevenToMike._id})` : 'None');
  
  // Show all friend requests involving them
  const allMikeRequests = await FriendRequest.find({
    $or: [
      { sender: mike._id },
      { recipient: mike._id }
    ]
  }).populate('sender recipient', 'username');
  
  const allElevenRequests = await FriendRequest.find({
    $or: [
      { sender: eleven._id },
      { recipient: eleven._id }
    ]
  }).populate('sender recipient', 'username');
  
  console.log(`\nAll Mike's friend requests (${allMikeRequests.length}):`);
  allMikeRequests.forEach(req => {
    console.log(`  ${req.sender.username} -> ${req.recipient.username} (${req.status})`);
  });
  
  console.log(`\nAll Eleven's friend requests (${allElevenRequests.length}):`);
  allElevenRequests.forEach(req => {
    console.log(`  ${req.sender.username} -> ${req.recipient.username} (${req.status})`);
  });
  
  console.log("\n=== Done! ===");
  process.exit(0);
};

checkRelationship();
