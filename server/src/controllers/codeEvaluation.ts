import { Request, Response } from 'express';
import { evaluateCodeAndTranscript } from '../utils/evaluateCode';
import { UserMessage } from '../models/UserMessageModel';
import { AgentMessage } from '../models/AgentMessageModel';

interface CodeEvaluationRequest {
  sessionId: string;
  code: string;
  transcript: string;
  question: string;
}

const sessionIdToChatHistory = new Map<string, any[]>();

export const codeEvaluationController = async (req: Request, res: Response) => {
  try {
    const { sessionId, code, transcript, question } = req.body as CodeEvaluationRequest;

    const userMessage = new UserMessage({ code, transcript });
    const history = sessionIdToChatHistory.get(sessionId) || [];

    if (history.length === 0) {
      sessionIdToChatHistory.set(sessionId, history);
    }

    const result = await evaluateCodeAndTranscript(question, code, transcript, history);

    if (result.success) {
      const agentMessage = new AgentMessage({ content: result.content });
      history.push(userMessage, agentMessage);
      return res.json({ status: true, content: result.content });
    } else {
      return res.json({ status: false, content: result.content });
    }
  } catch (err) {
    console.error('Code evaluation error:', err);
    return res.status(500).json({ status: false, content: 'Internal Server Error' });
  }
};