import { Request, Response } from "express";
import { evaluateResumeAndTranscript } from "../utils/evaluateResume";
import { UserMessage,IUserMessage } from "../models/UserMessageModel";
import { AgentMessage,IAgentMessage } from "../models/AgentMessageModel";
import {
  ChatHistory,
  IChatHistory,
  IChatMessage,
} from "../models/ChatHistoryModel";
import { getImprovedMessageFromTranscriptionAndResume} from "../utils/improvedMessage";
interface CodeEvaluationRequest {
  sessionId: string;
  transcript: string;
}

interface ResumeQuestionRequest {
  sessionId: string;
  resume: string; //as plain text
}

const sessionIdToChatContext = new Map<string, Array<IUserMessage | IAgentMessage>>();
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

    let context = sessionIdToChatContext.get(sessionId);
    if (!context) {
      context = [];
      sessionIdToChatContext.set(sessionId, context);
    }

    context.push(userMessage as IUserMessage);

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
      context.push(agentMessage as IAgentMessage);
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
        
        history?.messages.push(userChatMessage, agentChatMessage);
        console.log(history?.messages.length);
        console.log(history?.messages);
        // Check if the history has more than 4 messages before generating an improved message
        if((history?.messages.length || 0) > 4){
        //@ts-ignore
        const improvedMessage = await getImprovedMessageFromTranscriptionAndResume(resume,transcript,context||[]);                
        const improvedUserChatMessage = new UserMessage({
          transcript: improvedMessage.transcript,
          improved: true, // Mark as improved by AI
        });

        context?.push(improvedUserChatMessage as IUserMessage);

        const userChatMessageImprovedByAi = {
          type: "user",
          message: improvedUserChatMessage._id,
        } as IChatMessage;

        
        // Add both messages to the chat history
        history?.messages.push(userChatMessageImprovedByAi);
      }
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
