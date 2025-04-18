/**
 * This file contains coding problems used by the CrackIt platform.
 * These problems are sourced from the MongoDB database and hardcoded here
 * for use by the LLM agent to select appropriate questions for users.
 */

import { Julep } from "@julep/sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Problem interface that matches the MongoDB schema
export interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  testCases: {
    [key: string]: {
      input: any;
      expectedOutput: any;
    };
  };
}

export const problems: Problem[] = [
  {
    _id: "680294d88e98930b17e3c6d7",
    title: "Occurrence of a Character in a String",
    description: "Given a string and a character, write a function to count how many times the character appears in the string. The comparison should be case-sensitive.",
    difficulty: "medium",
    tags: ["string", "hashmap"],
    testCases: {
      "0": {
        input: {
          str: "hello world",
          char: "l"
        },
        expectedOutput: 3
      },
      "1": {
        input: {
          str: "OpenAI",
          char: "O"
        },
        expectedOutput: 1
      },
      "2": {
        input: {
          str: "Mississippi",
          char: "s"
        },
        expectedOutput: 4
      },
      "3": {
        input: {
          str: "",
          char: "a"
        },
        expectedOutput: 0
      },
      "4": {
        input: {
          str: "CaseSensitive",
          char: "c"
        },
        expectedOutput: 0
      }
    }
  },
  {
    _id: "6802cff382aab64098bd479c",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    difficulty: "easy",
    tags: ["array", "hashmap"],
    testCases: {
      "0": {
        input: {
          nums: [2, 7, 11, 15],
          target: 9
        },
        expectedOutput: [0, 1]
      },
      "1": {
        input: {
          nums: [3, 2, 4],
          target: 6
        },
        expectedOutput: [1, 2]
      },
      "2": {
        input: {
          nums: [3, 3],
          target: 6
        },
        expectedOutput: [0, 1]
      },
      "3": {
        input: {
          nums: [1, 5, 8, 3, 9, 11],
          target: 14
        },
        expectedOutput: [1, 4]
      },
      "4": {
        input: {
          nums: [-1, -2, -3, -4, -5],
          target: -8
        },
        expectedOutput: [2, 4]
      }
    }
  },
  {
    _id: "6802d24482aab64098bd479d",
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list. A linked list can be reversed either iteratively or recursively.",
    difficulty: "easy",
    tags: ["linked list", "recursion"],
    testCases: {
      "0": {
        input: {
          head: [1, 2, 3, 4, 5]
        },
        expectedOutput: [5, 4, 3, 2, 1]
      },
      "1": {
        input: {
          head: [1, 2]
        },
        expectedOutput: [2, 1]
      },
      "2": {
        input: {
          head: []
        },
        expectedOutput: []
      },
      "3": {
        input: {
          head: [7]
        },
        expectedOutput: [7]
      },
      "4": {
        input: {
          head: [1, 2, 3, 4, 5, 6, 7, 8]
        },
        expectedOutput: [8, 7, 6, 5, 4, 3, 2, 1]
      }
    }
  },
  {
    _id: "6802d24e82aab64098bd479e",
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: 1. Open brackets must be closed by the same type of brackets. 2. Open brackets must be closed in the correct order. 3. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "easy",
    tags: ["stack", "string"],
    testCases: {
      "0": {
        input: {
          s: "()"
        },
        expectedOutput: true
      },
      "1": {
        input: {
          s: "()[]{}"
        },
        expectedOutput: true
      },
      "2": {
        input: {
          s: "(]"
        },
        expectedOutput: false
      },
      "3": {
        input: {
          s: "([)]"
        },
        expectedOutput: false
      },
      "4": {
        input: {
          s: "{[]}"
        },
        expectedOutput: true
      }
    }
  },
  {
    _id: "6802d25982aab64098bd479f",
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
    difficulty: "easy",
    tags: ["array", "binary search", "algorithm"],
    testCases: {
      "0": {
        input: {
          nums: [-1, 0, 3, 5, 9, 12],
          target: 9
        },
        expectedOutput: 4
      },
      "1": {
        input: {
          nums: [-1, 0, 3, 5, 9, 12],
          target: 2
        },
        expectedOutput: -1
      },
      "2": {
        input: {
          nums: [1, 2, 3, 4, 5],
          target: 5
        },
        expectedOutput: 4
      },
      "3": {
        input: {
          nums: [1],
          target: 1
        },
        expectedOutput: 0
      },
      "4": {
        input: {
          nums: [5, 7, 8, 10, 15, 18, 20],
          target: 15
        },
        expectedOutput: 4
      }
    }
  }
];

/**
 * Function to get a problem by its ID
 * @param id The MongoDB ObjectId string
 * @returns The problem object or undefined if not found
 */
export function getProblemById(id: string): Problem | undefined {
  return problems.find(problem => problem._id === id);
}

/**
 * Function to get problems by difficulty level
 * @param difficulty The difficulty level ('easy', 'medium', 'hard')
 * @returns Array of problems matching the difficulty
 */
export function getProblemsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Problem[] {
  return problems.filter(problem => problem.difficulty === difficulty);
}

/**
 * Function to get problems by tag
 * @param tag The tag to search for
 * @returns Array of problems that have the specified tag
 */
export function getProblemsByTag(tag: string): Problem[] {
  return problems.filter(problem => problem.tags.includes(tag));
}

/**
 * Interface for the problem selection result
 */
export interface ProblemSelectionResult {
  problemId: string;
  problem: Problem;
  behavioralQuestions: string[];
  success: boolean;
  error?: string;
}

// Initialize Julep client
const client = new Julep({ apiKey: process.env.JULEP_API_KEY });

/**
 * Gets the agent ID from the stored configuration
 * If no agent exists, returns null
 */
function getProblemSelectorAgentId(): string | null {
  try {
    const agentInfoPath = path.join(__dirname, "../config/agentInfo.json");
    if (fs.existsSync(agentInfoPath)) {
      const agentInfo = JSON.parse(fs.readFileSync(agentInfoPath, 'utf-8'));
      return agentInfo.problemSelectorAgentId || null;
    }
    return null;
  } catch (error) {
    console.error("Error reading agent info:", error);
    return null;
  }
}

/**
 * Uses a Julep agent to select a suitable problem based on an interview experience article
 * Also extracts relevant behavioral questions from the article
 * 
 * @param interviewExperienceArticle The full text of an interview experience article (e.g. from GeeksForGeeks)
 * @param criteria Optional criteria for problem selection
 * @returns ProblemSelectionResult containing the selected problem and behavioral questions
 */
export async function selectProblemWithLLM(
  interviewExperienceArticle: string,
  criteria?: { 
    difficulty?: 'easy' | 'medium' | 'hard',
    preferredTags?: string[],
    avoidTags?: string[]
  }
): Promise<ProblemSelectionResult> {
  try {
    // Get the agent ID from stored configuration
    const agentId = getProblemSelectorAgentId();
    
    if (!agentId) {
      console.error("No problem selector agent ID found. Please run setupProblemSelectionAgent.ts first.");
      // Fallback to hardcoded selection
      return {
        problemId: "6802cff382aab64098bd479c", // Two Sum problem
        problem: problems.find(p => p._id === "6802cff382aab64098bd479c")!,
        behavioralQuestions: ["Tell me about yourself", "Why do you want to work at our company?"],
        success: true
      };
    }

    // Create task definition for the agent
    const taskDefinition = {
      name: "Select Problem",
      description: "Analyze interview experience and select appropriate coding problem and behavioral questions",
      main: [
        {
          prompt: [
            {
              role: "system",
              content: `You are an AI assistant that helps select appropriate coding problems and behavioral questions based on interview experience articles. 
              Your task is to analyze the interview experience article provided and select a problem from the available list that matches the technical areas discussed.
              Also extract 3-5 relevant behavioral questions that were mentioned in the interview experience.
              Available problems: ${JSON.stringify(problems.map(p => ({
                id: p._id,
                title: p.title,
                difficulty: p.difficulty,
                tags: p.tags,
                description: p.description
              })))}
              ${criteria?.difficulty ? `Preferred difficulty: ${criteria.difficulty}` : ''}
              ${criteria?.preferredTags?.length ? `Preferred tags: ${criteria.preferredTags.join(', ')}` : ''}
              ${criteria?.avoidTags?.length ? `Avoid tags: ${criteria.avoidTags.join(', ')}` : ''}`
            },
            {
              role: "user",
              content: `Here is an interview experience article to analyze:\n\n${interviewExperienceArticle}\n\nBased on this article, select an appropriate coding problem and extract relevant behavioral questions.`
            }
          ]
        }
      ]
    };

    // Create execution
    const execution = await client.executions.create(agentId, {
      input: taskDefinition
    });

    // Wait for result
    let result;
    let attempts = 0;
    const maxAttempts = 30; // Maximum wait time of 30 seconds
    
    do {
      result = await client.executions.get(execution.id);
      if (result.status === "succeeded") {
        // @ts-ignore - Access the output from the execution
        const output = result.output;
        
        if (output && output.tool_calls && output.tool_calls.length > 0) {
          const toolCall = output.tool_calls.find(call => call.function.name === "select_problem");
          if (toolCall) {
            const args = JSON.parse(toolCall.function.arguments);
            const problemId = args.problemId;
            const problem = getProblemById(problemId);
            
            if (!problem) {
              throw new Error(`Selected problem with ID ${problemId} not found in available problems`);
            }
            
            return {
              problemId,
              problem,
              behavioralQuestions: args.behavioralQuestions || [],
              success: true
            };
          }
        }
        
        // If we don't have a valid tool call, fallback to the default
        return {
          problemId: "6802cff382aab64098bd479c", // Two Sum problem
          problem: problems.find(p => p._id === "6802cff382aab64098bd479c")!,
          behavioralQuestions: ["Tell me about yourself", "Why do you want to work at our company?"],
          success: true
        };
      } else if (result.status === "failed") {
        throw new Error(`Execution failed: ${result.error}`);
      }
      
      await new Promise((res) => setTimeout(res, 1000));
      attempts++;
    } while (!["succeeded", "failed"].includes(result.status) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error("Execution timed out");
    }

    throw new Error("Execution failed with unknown error");
  } catch (error) {
    console.error("Error in problem selection:", error);
    
    // Fallback to hardcoded selection in case of any error
    return {
      problemId: "6802cff382aab64098bd479c", // Two Sum problem
      problem: problems.find(p => p._id === "6802cff382aab64098bd479c")!,
      behavioralQuestions: ["Tell me about yourself", "Why do you want to work at our company?"],
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}