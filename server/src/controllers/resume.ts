import { Julep } from "@julep/sdk";
import { Request, Response } from 'express';
import dotenv from "dotenv";
import yaml from "yaml";
import { UserMessage } from "../models/UserMessageModel";
import { AgentMessage } from "../models/AgentMessageModel";
import { askQuestionsFromResume } from "../utils/askResume";

dotenv.config();

interface ResumeQuestionRequest {
  sessionId: string;
  resume: string;
}

interface ResumeUserMessage {
  sessionId: string;
  transcript: string;
}

const client = new Julep({ apiKey: process.env.JULEP_API_KEY });

const sessionIdToChatHistory = new Map<string, any[]>();
const sessionIdToResume = new Map<string, string>();

export const resumeUploader = async (req: Request, res: Response) => {
  try {
    const { sessionId, resume } = req.body as ResumeQuestionRequest;

    if (!resume) {
      return res.status(400).json({ status: false, content: 'Resume is required' });
    }

    const resumeFile = await client.files.create({
      name: "resume.txt", // renamed for clarity
      content: resume,
      mime_type: "text/plain", // important: indicate it's a text file
      description: "Resume extracted as plain text",
    });

    sessionIdToResume.set(sessionId, resumeFile.id);
    sessionIdToChatHistory.set(sessionId, []);
    return res.json({ status: true, content: 'Resume uploaded and processed successfully' });

  } catch (err) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ status: false, content: 'Internal Server Error' });
  }
};

export const resumeEvaluationController = async (req: Request, res: Response) => {
  try {
    const { sessionId, transcript } = req.body as ResumeUserMessage;

    if (!sessionId) {
      return res.status(400).json({ status: false, content: 'SessionId is required' });
    }

    if (!transcript) {
      return res.status(400).json({ status: false, content: 'Transcript is required' });
    }

    const resumeFileId = sessionIdToResume.get(sessionId);
    if (!resumeFileId) {
      return res.status(400).json({ status: false, content: 'Resume not found for this sessionId' });
    }

    const userMessage = new UserMessage({ transcript });
    const history = sessionIdToChatHistory.get(sessionId) || [];

    if (history.length === 0) {
      sessionIdToChatHistory.set(sessionId, history);
    }

    const result = await askQuestionsFromResume(resumeFileId, history.concat(userMessage));

    if (result.success) {
      const agentMessage = new AgentMessage({ content: result.content });
      history.push(userMessage, agentMessage);
      return res.json({ status: true, content: result.content });
    } else {
      return res.json({ status: false, content: result.content });
    }
  } catch (err) {
    console.error('Evaluation error:', err);
    return res.status(500).json({ status: false, content: 'Internal Server Error' });
  }
};
