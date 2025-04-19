import mongoose, { Document, Schema } from "mongoose";

// Problem interface
export interface IProblem extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  testCases: {
    [key: string]: {
      input: any;
      expectedOutput: any;
    };
  };
}

// Mongoose schema
const problemSchema = new Schema<IProblem>(
  {
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String, 
      required: true 
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    examples: [{
      input: String,
      output: String,
      explanation: String
    }],
    constraints: [String],
    testCases: {
      type: Map,
      of: {
        input: Schema.Types.Mixed,
        expectedOutput: Schema.Types.Mixed
      }
    }
  },
  {
    timestamps: true,
  }
);

// Mongoose model
const Problem = mongoose.model<IProblem>("Problem", problemSchema);

export default Problem;