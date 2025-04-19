import { Request, Response } from 'express';
// import { analyzeInterviewExp } from '../utils/interviewAnalyzer';
import { analyzeInterviewExp } from '../utils/interviewAnalyzerGemini';

/**
 * Controller function that handles analyzing interview experience articles
 * It extracts appropriate coding problems and behavioral questions
 */
export const analyzeInterviewController = async (req: Request, res: Response) => {
  try {
    // Extract the interview experience article and response format from the request body
    const { article } = req.body;

    // Validate that article is provided
    if (!article || typeof article !== 'string' || article.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Interview experience article is required'
      });
    }

    // Call the analyzer function with the JSON format option
    const result = await analyzeInterviewExp(article);

    // Return the analysis results
    return res.status(200).json({
      success: true,
      data: {
        problem: {
          id: result.problemId,
          title: result.problem.title,
          description: result.problem.description,
          difficulty: result.problem.difficulty,
          tags: result.problem.tags,
          testCases: result.problem.testCases
        },
        behavioralQuestions: result.behavioralQuestions,
        reasoning: result.reasoning
      }
    });
  } catch (error) {
    console.error('Error analyzing interview experience:', error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during analysis'
    });
  }
};