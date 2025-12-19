import { StreamChat } from "stream-chat";

const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    console.log("Creating Stream token for user:", userId);
    
    const token = serverClient.createToken(userId);
    
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
