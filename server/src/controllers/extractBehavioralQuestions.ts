import { Request, Response } from 'express';
import { analyzeInterviewExp } from '../utils/interviewAnalyzerGeminiToBehaviouralQuestion';

/**
 * Controller for extracting behavioral questions from interview experience articles
 * 
 * @param req Express request object
 * @param res Express response object
 */
export const extractBehavioralQuestionsController = async (req: Request, res: Response) => {
  try {
    // Extract the interview experience article from the request body
    const { article } = req.body;

    // Validate that article is provided
    if (!article || typeof article !== 'string' || article.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Interview experience article is required'
      });
    }

    // Call the behavioral question analyzer function
    const result = await analyzeInterviewExp(article);

    // Return the analysis results
    return res.status(200).json({
      success: true,
      data: {
        behavioralQuestions: result.behavioralQuestions,
      }
    });
  } catch (error) {
    console.error('Error extracting behavioral questions:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during analysis'
    });
  }
};