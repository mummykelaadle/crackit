import { Request, Response } from 'express';
import Problem from '../models/ProblemModel';
import mongoose from 'mongoose';
import { getProblemById } from '../data/problems';

/**
 * Get a problem by its ObjectId
 * @param req Request with problemId as parameter
 * @param res Response with problem data
 */
export const getProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid problem ID format' });
      return;
    }

    // Try to fetch from MongoDB
    let problem = await Problem.findById(id);
    
    // If not found in MongoDB, try to fetch from hardcoded problems
    if (!problem) {
      const hardcodedProblem = getProblemById(id);
      if (hardcodedProblem) {
        res.status(200).json({ 
          success: true, 
          problem: {
            ...hardcodedProblem,
            // Convert testCases to examples format for client compatibility
            examples: Object.values(hardcodedProblem.testCases).map(testCase => ({
              input: JSON.stringify(testCase.input),
              output: JSON.stringify(testCase.expectedOutput)
            })),
            // Add constraints if not already present
            constraints: hardcodedProblem.tags.map(tag => `This problem involves ${tag}`)
          } 
        });
        return;
      }
      
      res.status(404).json({ success: false, message: 'Problem not found' });
      return;
    }

    res.status(200).json({ success: true, problem });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};