import { Request, Response } from 'express';
import { analyzeInterviewExp } from '../utils/interviewAnalyzerGeminiToCodingQuestions';

/**
 * Controller for extracting coding questions from interview experience articles
 * 
 * @param req Express request object
 * @param res Express response object
 */
export const extractCodingQuestionsController = async (req: Request, res: Response) => {
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

    // Call the analyzer function to extract coding questions
    const result = await analyzeInterviewExp(article);

    // Return the analysis results
    return res.status(200).json({
      success: result.success,
      data: {
        problem: {
          id: result.problemId,
          title: result.problem.title,
          description: result.problem.description,
          difficulty: result.problem.difficulty,
          tags: result.problem.tags,
          testCases: result.problem.testCases
        },
        reasoning: result.reasoning
      },
      error: result.error
    });
  } catch (error) {
    console.error('Error extracting coding questions:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during analysis'
    });
  }
};