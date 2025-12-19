import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const getRecommendedUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    console.log("Getting recommended users for:", currentUserId);
    console.log("Current user details:", req.user.username);
    
    // Get current user's friends and outgoing friend requests
    const currentUser = await User.findById(currentUserId);
    const outgoingRequests = await FriendRequest.find({ sender: currentUserId });
    const incomingRequests = await FriendRequest.find({ recipient: currentUserId });
    
    // Get IDs to exclude (friends + pending requests + self)
    const friendIds = currentUser.friends || [];
    const outgoingRequestIds = outgoingRequests.map(req => req.recipient);
    const incomingRequestIds = incomingRequests.map(req => req.sender);
    
    const excludeIds = [
      currentUserId,
      ...friendIds,
      ...outgoingRequestIds,
      ...incomingRequestIds
    ];
    
    console.log("Excluding user IDs:", excludeIds);
    
    // First, let's check all users with isOnboarded true
    const allOnboardedUsers = await User.find({ isOnboarded: true }).select("username isOnboarded");
    console.log("All onboarded users in DB:", allOnboardedUsers.map(u => ({ username: u.username, isOnboarded: u.isOnboarded, id: u._id })));
    
    // Get users that are not the current user, not friends, and don't have pending requests
    const users = await User.find({
      _id: { $nin: excludeIds },
      isOnboarded: true
    }).select("-password").limit(10);

    console.log("Found recommended users:", users.length);
    console.log("Recommended usernames:", users.map(u => u.username));
    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMyFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    const user = await User.findById(currentUserId).populate('friends', '-password');
    
    res.status(200).json(user.friends || []);
  } catch (error) {
    console.log("Error in getMyFriends controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { id: recipientId } = req.params;
    const senderId = req.user._id;

    console.log("Sending friend request from:", senderId, "to:", recipientId);

    if (senderId.toString() === recipientId) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }

    // Check if friend request already exists
    const existingRequest = await FriendRequest.findOne({
      sender: senderId,
      recipient: recipientId,
    });

    if (existingRequest) {
      console.log("Friend request already exists:", existingRequest);
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Check if users are already friends
    const currentUser = await User.findById(senderId);
    if (currentUser.friends.includes(recipientId)) {
      return res.status(400).json({ error: "You are already friends with this user" });
    }

    const friendRequest = new FriendRequest({
      sender: senderId,
      recipient: recipientId,
    });

    await friendRequest.save();
    console.log("Friend request saved successfully:", friendRequest);

    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.log("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const currentUserId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== currentUserId.toString()) {
      return res.status(403).json({ error: "You can only accept your own friend requests" });
    }

    // Add each user to the other's friends list
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient }
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender }
    });

    // Delete the friend request
    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    console.log("Getting friend requests for user:", currentUserId);

    // Get incoming friend requests (requests sent to current user)
    const incomingRequests = await FriendRequest.find({
      recipient: currentUserId
    }).populate('sender', '-password');

    console.log("Found incoming requests:", incomingRequests.length);

    res.status(200).json({
      incomingReqs: incomingRequests,
      acceptedReqs: [] // No need for accepted requests since they're deleted
    });
  } catch (error) {
    console.log("Error in getFriendRequests controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getOutgoingFriendReqs = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const outgoingRequests = await FriendRequest.find({
      sender: currentUserId,
    }).populate('recipient', '-password');

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
