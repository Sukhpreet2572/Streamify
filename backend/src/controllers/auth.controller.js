import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "15d",
  });
};

export const signup = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  try {
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUsername = await User.findOne({ username });

    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = new User({
      fullName,
      username,
      email,
      password, // This will be hashed by the pre-save hook in the User model
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true,
      sameSite: "strict",
      secure: false, // Set to false for development
    });

    res.status(201).json({
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        isOnboarded: newUser.isOnboarded,
      },
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Allow login with either email or username
    const loginField = email || username;
    if (!loginField || !password) {
      return res.status(400).json({ error: "Please provide email/username and password" });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: loginField }, { username: loginField }]
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.cookie("jwt", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true,
      sameSite: "strict",
      secure: false, // Set to false for development
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        isOnboarded: user.isOnboarded,
        interests: user.interests,
        nativeLanguage: user.nativeLanguage,
        learningLanguage: user.learningLanguage,
        location: user.location,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const onboard = async (req, res) => {
  try {
    const { bio, interests, nativeLanguage, learningLanguage, location, profilePic } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        bio,
        interests,
        nativeLanguage,
        learningLanguage,
        location,
        profilePic,
        isOnboarded: true,
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.log("Error in onboard controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
