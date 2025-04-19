import { Request, Response } from 'express';
import { evaluateCodeAndTranscript } from '../utils/evaluateCode';
import { transcribeAudio } from '../utils/audioTranscription';
import { UserMessage } from '../models/UserMessageModel';
import { AgentMessage } from '../models/AgentMessageModel';
import { ChatHistory, IChatHistory, IChatMessage } from '../models/ChatHistoryModel';

interface CodeEvaluationRequest {
  sessionId: string;
  code: string;
  transcript: string;
  question: string;
}

interface EvaluationResult {
  success: boolean;
  content: string;
}

const sessionIdToChatHistory = new Map<string,IChatHistory>();

export const codeEvaluationController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { sessionId, code, transcript, question } = req.body as CodeEvaluationRequest;

    const userMessage = new UserMessage({ code, transcript });
    
    let history = sessionIdToChatHistory.get(sessionId);
    if (!history) {
      const newChatHistory = await ChatHistory.create({ messages: [] });
      sessionIdToChatHistory.set(sessionId, newChatHistory);
      history=newChatHistory
    }
    if (history.messages.length === 0) {
      sessionIdToChatHistory.set(sessionId, history);
    }

    const result: EvaluationResult = await evaluateCodeAndTranscript(question, code, transcript, history.messages);

    if (result.success) {
      const agentMessage = new AgentMessage({ content: result.content });
      // Create chat message objects with references to the actual messages
      const userChatMessage = { type: 'user', message: userMessage._id } as IChatMessage;
      const agentChatMessage = { type: 'agent', message: agentMessage._id } as IChatMessage;
      
      // Add both messages to the chat history
      history.messages.push(userChatMessage, agentChatMessage);
      history.save(); // Save the updated chat history
      return res.json({ status: true, content: result.content });
    } else {
      return res.json({ status: false, content: result.content });
    }
  } catch (err) {
    console.error('Code evaluation error:', err);
    return res.status(500).json({ status: false, content: 'Internal Server Error' });
  }
};

/**
 * Analyze the audio, code, and question data.
 * @param audio - The audio file blob.
 * @param code - The current code snippet.
 * @param question - The current question.
 * @returns Feedback from the LLM-based InterviewAgent.
 */
//@ts-ignore
export const analyzeAudioAndCode = async (audio: Express.Multer.File, code: string, question: string) => {
  try {
    // Step 1: Transcribe the audio to text
    const audioAsText = await transcribeAudio(audio);

    // Step 2: Evaluate the code and explanation with the evaluateCodeAndTranscript function
    const feedback = await evaluateCodeAndTranscript(question, code, audioAsText, []);

    return feedback;
  } catch (error) {
    console.error('Error in analyzeAudioAndCode:', error);
    throw new Error('Failed to analyze audio and code');
  }
};
