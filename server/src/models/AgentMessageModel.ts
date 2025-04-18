import mongoose, { Document, Schema } from 'mongoose';

// 1. TypeScript interface
interface IAgentMessage extends Document {
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Mongoose schema
const agentMessageSchema = new Schema<IAgentMessage>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// 3. Mongoose model
const AgentMessage = mongoose.model<IAgentMessage>('AgentMessage', agentMessageSchema);

export  {AgentMessage, IAgentMessage};
