import mongoose, { Document, Schema } from 'mongoose';

// 1. TypeScript interface
interface IUserMessage {
  code?: string;
  transcript?: string;
  improved: boolean; // new field to indicate if message is improved by AI
}

// 2. Mongoose schema
const userMessageSchema = new Schema<IUserMessage>(
  {
    code: {
      type: String,
      required: false,
      trim: true,
    },
    transcript: {
      type: String,
      required: false,
      trim: true,
    },
    improved: {
      type: Boolean,
      required: true,
      default: false, // default to false (user message)
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// 3. Mongoose model
const UserMessage = mongoose.model<IUserMessage>('UserMessage', userMessageSchema);

export {UserMessage, IUserMessage};
