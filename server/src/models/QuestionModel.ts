import mongoose, { Document, Schema } from "mongoose";

// 1. TypeScript interface for the Interview Experience Analysis
interface IInterviewExperience extends Document {
  problemId: string;
  problem: {
    _id: string;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
  };
  behavioralQuestions: string[];
  reasoning: string;
  success: boolean;
  error?: string;
}

// 2. Mongoose schema
const interviewExperienceSchema = new Schema<IInterviewExperience>(
  {
    problemId: {
      type: String,
      required: true,
      trim: true,
    },
    problem: {
      _id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true,
      },
      tags: {
        type: [String],
        default: [],
      },
    },
    behavioralQuestions: {
      type: [String],
      default: [],
    },
    reasoning: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt fields
  }
);

// 3. Mongoose model
const InterviewExperience = mongoose.model<IInterviewExperience>(
  "InterviewExperience",
  interviewExperienceSchema
);

export { InterviewExperience, IInterviewExperience };
