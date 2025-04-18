import { Request, Response, NextFunction } from 'express';
import { executeCode, isTimeLimit, isMemoryLimit } from '../utils/piston';

interface CodeExecutionRequest {
  language: string;
  content: string;
  stdin?: string;
  args?: string[];
}

export const executeCodeMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { language, content, stdin = '', args = [] } = req.body as CodeExecutionRequest;

    // Validate request body
    if (!language || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: language and content are required'
      });
    }

    // Execute the code
    const result = await executeCode(language, content, stdin, args);

    // Check for Time Limit Exceeded (TLE)
    if (isTimeLimit(result)) {
      return res.status(200).json({
        success: false,
        status: 'TLE',
        message: 'Time Limit Exceeded',
        result
      });
    }

    // Check for Memory Limit Exceeded (MLE)
    if (isMemoryLimit(result)) {
      return res.status(200).json({
        success: false,
        status: 'MLE',
        message: 'Memory Limit Exceeded',
        result
      });
    }

    // Return the execution result
    return res.status(200).json({
      success: true,
      status: 'OK',
      result
    });
  } catch (error: any) {
    console.error('Code execution error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during code execution'
    });
  }
};