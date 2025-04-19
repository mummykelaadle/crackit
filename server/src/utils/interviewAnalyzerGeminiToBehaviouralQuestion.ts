import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

dotenv.config();

const behavioralQuestionsSchema = z.array(z.string());

// async function identifySimilarBehavioralQuestions(
//   article: string
// ): Promise<string[] | null> {
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//   const prompt = `Please read the following article and identify the behavioral questions mentioned in it.
// Behavioral questions typically focus on past experiences, how individuals handled specific situations, their skills, and personal attributes. They often start with phrases like "Tell me about a time when...", "Describe a situation where...", "How do you handle...", etc.

// Article:
// ${article}

// Behavioral Questions Identified in the Article:`;

//   try {
//     const result = await model.generateContent(prompt);
//     const rawOutput = result.response.text();
//     console.log("Raw Output (Behavioural Questions):", rawOutput);

//     // Attempt to find the start and end of the JSON array
//     const jsonStartIndex = rawOutput.indexOf("[");
//     const jsonEndIndex = rawOutput.lastIndexOf("]");

//     if (
//       jsonStartIndex !== -1 &&
//       jsonEndIndex !== -1 &&
//       jsonStartIndex < jsonEndIndex
//     ) {
//       const jsonString = rawOutput
//         .substring(jsonStartIndex, jsonEndIndex + 1)
//         .trim();
//       try {
//         const parsedOutput = JSON.parse(jsonString);
//         if (
//           Array.isArray(parsedOutput) &&
//           parsedOutput.every((item) => typeof item === "string")
//         ) {
//           return parsedOutput;
//         } else {
//           console.error(
//             "AI output for behavioural questions is not in the expected array format:",
//             parsedOutput
//           );
//           return null;
//         }
//       } catch (parseError) {
//         console.error(
//           "Error parsing JSON from behavioral questions output:",
//           parseError
//         );
//         console.error("Problematic JSON string:", jsonString);
//         return null;
//       }
//     } else {
//       console.error(
//         "Could not find valid JSON array in AI output for behavioural questions."
//       );
//       return null;
//     }
//   } catch (error) {
//     console.error("Error identifying behavioral questions:", error);
//     return null;
//   }
// }

async function extractBehavioralQuestions(
  article: string
): Promise<string[] | null> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Please read the following article and extract the behavioral questions mentioned in it. Behavioral questions typically focus on past experiences, how individuals handled specific situations, their skills, and personal attributes. They often start with phrases like \"Tell me about a time when...\", \"Describe a situation where...\", \"How do you handle...\", etc. \n\nIf the article explicitly contains interview questions that fit the definition of behavioral questions, please prioritize extracting those directly. \n\nIf the article does not contain explicit behavioral interview questions, or contains very few, please analyze the content of the article (e.g., the interviewee's experiences, challenges, skills discussed) and generate a list of relevant behavioral questions that an interviewer might ask based on that content. Aim to generate at least 3 relevant behavioral questions in such cases.\n\nReturn the answer as a JSON array of strings.\n\nArticle:\n${article}\n\nBehavioral Questions:`;

  try {
    const result = await model.generateContent(prompt);
    const rawOutput = result.response.text();
    console.log("Raw Output (Extracted Behavioral Questions):", rawOutput);

    const jsonString = rawOutput
      .replace(/```json\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedOutput = JSON.parse(jsonString);
    return behavioralQuestionsSchema.parse(parsedOutput);
  } catch (error) {
    console.error("Error extracting behavioral questions:", error);
    return null;
  }
}

/**
 * Interface for the interview experience analysis result
 */
export interface InterviewExpAnalysisResult {
  behavioralQuestions: string[];
  success: boolean;
  error?: string;
}

/**
 * Analyzes an interview experience article to select a relevant coding problem
 * and extract behavioral questions mentioned in the article.
 *
 * @param interviewExperienceArticle The full text of an interview experience article
 * @returns Analysis result containing the selected problem and behavioral questions
 */
export async function analyzeInterviewExp(
  interviewExperienceArticle: string
): Promise<InterviewExpAnalysisResult> {
  try {
    const behavioralQuestions = await extractBehavioralQuestions(
      interviewExperienceArticle
    );



    if (behavioralQuestions && behavioralQuestions.length > 0) {
      console.log("Extracted Behavioral Questions:", behavioralQuestions);
      
      return {
        behavioralQuestions,
        success: true,
      };
    } else {
      console.log("No behavioral questions found in the article.");
      return {
        behavioralQuestions: [],
        success: false,
        error: "No behavioral questions found in the article.",
      };
    }
  } catch (error) {
    console.error("Error during interview experience analysis:", error);
    return {
      behavioralQuestions: [],
      success: false,
      error: "An error occurred during the analysis.",
    };
  }
}
