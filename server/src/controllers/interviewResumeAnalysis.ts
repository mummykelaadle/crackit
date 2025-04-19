import { Request, Response } from "express";
import { evaluateResumeAndTranscript } from "../utils/evaluateResume";
import { UserMessage } from "../models/UserMessageModel";
import { AgentMessage } from "../models/AgentMessageModel";
import {
  ChatHistory,
  IChatHistory,
  IChatMessage,
} from "../models/ChatHistoryModel";

interface CodeEvaluationRequest {
  sessionId: string;
  transcript: string;
}

interface ResumeQuestionRequest {
  sessionId: string;
  resume: string; //as plain text
}

const sessionIdToChatHistory = new Map<string, IChatHistory>();
const sessionIdToResume = new Map<string, string>();

export const resumeUploader = async (req: Request, res: Response) => {
  try {
    const { sessionId, resume } = req.body as ResumeQuestionRequest;

    if (!resume) {
      return res
        .status(400)
        .json({ status: false, content: "Resume is required" });
    }

    sessionIdToResume.set(sessionId, resume);
    const newChatHistory = await ChatHistory.create({ messages: [] });
    sessionIdToChatHistory.set(sessionId, newChatHistory);
    return res.json({
      status: true,
      content: "Resume uploaded and processed successfully",
    });
  } catch (err) {
    console.error("Resume upload error:", err);
    return res
      .status(500)
      .json({ status: false, content: "Internal Server Error" });
  }
};

export const resumeEvaluationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { sessionId, transcript } = req.body as CodeEvaluationRequest;

    const userMessage = new UserMessage({ transcript });
    let history = sessionIdToChatHistory.get(sessionId);
    if (!history) {
      const newChatHistory = await ChatHistory.create({ messages: [] });
      // Initialize with an empty messages array to ensure it exists
      sessionIdToChatHistory.set(sessionId, newChatHistory);
      history = newChatHistory;
    }
    console.log("History:", history);
    const resume = sessionIdToResume.get(sessionId);
    if (!resume) {
      return res.status(400).json({
        status: false,
        content: "Resume not found for the given session ID",
      });
    }

    const result = await evaluateResumeAndTranscript(
      resume,
      transcript,
      history.messages
    );

    if (result.success) {
      const agentMessage = new AgentMessage({ content: result.content });

      const userChatMessage = {
        type: "user",
        message: userMessage._id,
      } as IChatMessage;

      const agentChatMessage = {
        type: "agent",
        message: agentMessage._id,
      } as IChatMessage;

      async function postSendingTasks() {
        // Save the user and agent messages to the database
        await userMessage.save();
        await agentMessage.save();

        // Add both messages to the chat history
        history?.messages.push(userChatMessage, agentChatMessage);    
        // Update the chat history in the database
        try {
          await history?.save();
          console.log("Successfully saved chat history");
        } catch (error) {
          console.error("Error saving chat history:", error);
        }
        // Only set if history is defined
        if (history) {
          sessionIdToChatHistory.set(sessionId, history);
        }
      }

      // Start post-processing in the background
      postSendingTasks();

      // Return the response immediately
      return res.json({ status: true, content: result.content });
    } else {
      return res.json({ status: false, content: result.content });
    }
  } catch (err) {
    console.error("Code evaluation error:", err);
    return res
      .status(500)
      .json({ status: false, content: "Internal Server Error" });
  }
};
