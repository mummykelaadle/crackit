import mongoose, { Document, Schema, Types } from 'mongoose';

// Define a message that can be either a user or agent message
interface IChatMessage {
  type: 'user' | 'agent';
  message: Types.ObjectId; // Reference to either UserMessage or AgentMessage
}

interface IChatHistory extends Document {
  messages: IChatMessage[];
}

const chatHistorySchema = new Schema<IChatHistory>(
  {
    messages: [
      {
        type: {
          type: String,
          enum: ['user', 'agent'],
          required: true,
        },
        message: {
          type: Schema.Types.ObjectId,
          required: true,
          // This will reference either UserMessage or AgentMessage collection
          refPath: 'messages.type',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Using refPath for dynamic references based on the message type
// When 'type' is 'user', it will reference 'UserMessage' collection
// When 'type' is 'agent', it will reference 'AgentMessage' collection

const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);

export { ChatHistory, IChatHistory,IChatMessage };