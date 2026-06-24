import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "bot"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
    sessionId: {
    type: String,    
    required: true,
  },
  sessionTitle: {
    type: String,   
    default: "New Chat",
  },
},
 { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;