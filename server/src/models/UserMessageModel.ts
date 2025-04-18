import mongoose, { Document, Schema } from 'mongoose';

// 1. TypeScript interface
interface IUserMessage extends Document {
  code?: string;
  transcript?: string;
  createdAt: Date;
  updatedAt: Date;
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
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// 3. Mongoose model
const UserMessage = mongoose.model<IUserMessage>('UserMessage', userMessageSchema);

export {UserMessage, IUserMessage};
