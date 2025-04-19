import { Request, Response } from "express";
import { evaluateResumeAndTranscript } from "../utils/evaluateResume";
import { UserMessage } from "../models/UserMessageModel";
import { AgentMessage } from "../models/AgentMessageModel";

interface CodeEvaluationRequest {
  sessionId: string;
  transcript: string;
}

interface ResumeQuestionRequest {
  sessionId: string;
  resume: string;//as plain text
}

const sessionIdToChatHistory = new Map<string, any[]>();
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
    sessionIdToChatHistory.set(sessionId, []);
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
    const { sessionId, transcript} =
      req.body as CodeEvaluationRequest;

    const userMessage = new UserMessage({ transcript });
    const history = sessionIdToChatHistory.get(sessionId) || [];
    const resume = sessionIdToResume.get(sessionId);
    if (!resume) {
        return res.status(400).json({
            status: false,
            content: "Resume not found for the given session ID",
        });
    }

    if (history.length === 0) {
      sessionIdToChatHistory.set(sessionId, history);
    }
    
    const result = await evaluateResumeAndTranscript(
        resume,
      transcript,
      history
    );

    if (result.success) {
      const agentMessage = new AgentMessage({ content: result.content });
      history.push(userMessage, agentMessage);
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
