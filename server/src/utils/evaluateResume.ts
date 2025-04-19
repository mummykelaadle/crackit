import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import yaml from "yaml";

dotenv.config();

//@ts-ignore
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function evaluateResumeAndTranscript(
  resume: string,
  transcript: string,
  chatHistory: any[]
) {
  try {
    const formattedChatHistory = chatHistory
      .map((item) => {
        const role = item.role === "user" ? "Interviewee" : "Interviewer";
        return `${role}: ${item.content}`;
      })
      .join("\n");

    const prompt = `You are a professional mock interviewer.

Use the resume and chat history below to:
1. Briefly respond to the latest message from the interviewee.
2. Ask a relevant follow-up question, continuing the interview in a thoughtful way.

Resume:
${resume}

Chat History:
${formattedChatHistory}

Last Message from Interviewee:
${transcript}

Your response should sound natural and human.
Keep it brief, engaging, and context-aware.
First, write your reply to the candidate.
Then, include your next interview question.`;

    const result = await model.generateContent(prompt);

    const response = await result.response;

    if (
      response.candidates &&
      response.candidates.length > 0 &&
      response.candidates[0].content &&
      response.candidates[0].content.parts
    ) {
      const content = response.candidates[0].content.parts
        .map((part) => part.text)
        .join("");
      return { success: true, content };
    } else {
      return { success: false, content: "No response from the model." };
    }
  } catch (error: any) {
    console.error("Error during evaluation:", error);
    return { success: false, content: `Evaluation failed: ${error.message}` };
  }
}
