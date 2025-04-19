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
