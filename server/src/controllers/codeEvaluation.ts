import { Request, Response } from 'express';
import { evaluateCodeAndTranscript } from '../utils/evaluateCode';
import { transcribeAudio } from '../utils/audioTranscription';
import { UserMessage } from '../models/UserMessageModel';
import { AgentMessage } from '../models/AgentMessageModel';
import { Express } from 'express';

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

const sessionIdToChatHistory = new Map<string, Array<InstanceType<typeof UserMessage> | InstanceType<typeof AgentMessage>>>();

export const codeEvaluationController = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { sessionId, code, transcript, question } = req.body as CodeEvaluationRequest;

    const userMessage = new UserMessage({ code, transcript });
    const history = sessionIdToChatHistory.get(sessionId) || [];

    if (history.length === 0) {
      sessionIdToChatHistory.set(sessionId, history);
    }

    const result: EvaluationResult = await evaluateCodeAndTranscript(question, code, transcript, history);

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

/**
 * Analyze the audio, code, and question data.
 * @param audio - The audio file blob.
 * @param code - The current code snippet.
 * @param question - The current question.
 * @returns Feedback from the LLM-based InterviewAgent.
 */
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
