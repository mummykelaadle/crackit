import dotenv from "dotenv";
import { Problem, problems } from "../data/problems";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

dotenv.config();

const codingQuestionsSchema = z.array(z.string());

// Create a schema for the response
const similarQuestionSchema = z.object({
  id: z.string()
});

async function identifySimilarQuestions(
  article: string,
  questionMapAsString: string
): Promise<string | null> {
  //@ts-ignore
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using 'pro' for potentially better understanding

  const prompt = `Please read the following article and identify the coding questions mentioned in it.
Then, compare these questions to the following list of questions and their corresponding object IDs (as a JSON object).
Identify the most similar question from the list to the questions found in the article.
Return a JSON object containing the object ID of this most similar question.

Article:
${article}

Question List:
${questionMapAsString}

example response:
{
  "id": "680294d88e98930b17e3c6d7"
}`;

  try {
    const result = await model.generateContent(prompt);
    const rawOutput = result.response.text();
    console.log("Raw Output (Similar Question):", rawOutput);

    // Try to extract JSON object from the response
    try {
      // First clean the output by removing any markdown formatting
      const cleanedOutput = rawOutput
        .replace(/```json\n?/g, "")
        .replace(/```/g, "")
        .trim();
      
      // Parse the cleaned output
      const parsedOutput = JSON.parse(cleanedOutput);
      
      // Validate with zod schema
      const validatedOutput = similarQuestionSchema.safeParse(parsedOutput);
      
      if (validatedOutput.success) {
        return validatedOutput.data.id;
      } else {
        console.error(
          "AI output for similar questions is not in the expected format:",
          parsedOutput,
          validatedOutput.error
        );
        return null;
      }
    } catch (parseError) {
      console.error(
        "Error parsing JSON from similar questions output:",
        parseError
      );
      console.error("Problematic output:", rawOutput);
      return null;
    }
  } catch (error) {
    console.error("Error identifying similar questions:", error);
    return null;
  }
}

async function extractCodingQuestions(
  article: string
): Promise<string[] | null> {
  //@ts-ignore
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Please read the following article and extract the names or descriptions of the coding questions mentioned in it. Return the answer as a JSON array of strings.

Article:
${article}

Coding Question Names:`;

  try {
    const result = await model.generateContent(prompt);
    const rawOutput = result.response.text();
    console.log("Raw Output (Extracted Questions):", rawOutput);

    const jsonString = rawOutput
      .replace(/```json\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedOutput = JSON.parse(jsonString);
    return codingQuestionsSchema.parse(parsedOutput);
  } catch (error) {
    console.error("Error extracting coding questions:", error);
    return null;
  }
}

/**
 * Interface for the interview experience analysis result
 */
export interface InterviewExpAnalysisResult {
  problemId: string;
  problem: Problem;
  behavioralQuestions: string[];
  reasoning?: string;
  success: boolean;
  error?: string;
}

/**
 * Analyzes an interview experience article to select a relevant coding problem
 * and extract behavioral questions mentioned in the article.
 * The LLM will select the most appropriate problem based on the article content.
 *
 * @param interviewExperienceArticle The full text of an interview experience article (e.g. from GeeksForGeeks)
 * @param jsonResponse Whether to format the execution with JSON response format
 * @returns Analysis result containing the selected problem and behavioral questions
 */
export async function analyzeInterviewExp(
  interviewExperienceArticle: string
): Promise<InterviewExpAnalysisResult> {
  try {
    // Format the problems for the agent
    const problemsData = problems.map((p) => ({
      id: p._id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      description: p.description,
    }));

    // Provide the problems list without any difficulty filtering
    const problemsInfo = JSON.stringify(problemsData);
    const extractedQuestions = await extractCodingQuestions(
      interviewExperienceArticle
    );
    console.log("Extracted Questions:", extractedQuestions);

    if (extractedQuestions && extractedQuestions.length > 0) {
      console.log("Extracted Coding Questions:", extractedQuestions);

      const similarQuestionId = await identifySimilarQuestions(
        interviewExperienceArticle,
        problemsInfo
      );

      if (similarQuestionId) {
        console.log("Most Similar Question Object ID:", similarQuestionId);
        const selectedProblem = problems.find(
          (p) => p._id === similarQuestionId
        );

        if (selectedProblem) {
          return {
            problemId: selectedProblem._id,
            problem: selectedProblem,
            behavioralQuestions: [], // Assuming behavioral questions are not extracted in this flow
            reasoning:
              "The problem was selected based on its similarity to the extracted coding questions.",
            success: true,
          };
        } else {
          const defaultProblemId = "6802cff382aab64098bd479c";
          const defaultProblem = problems.find(
            (p) => p._id === defaultProblemId
          );
          return {
            problemId: defaultProblem ? defaultProblem._id : "",
            problem: defaultProblem || problems[0], // Fallback to the first problem if default is not found
            behavioralQuestions: [],
            reasoning: defaultProblem
              ? "The default problem was selected as a fallback."
              : "No matching problem found, and the default problem could not be located.",
            success: !!defaultProblem,
            error: defaultProblem ? undefined : "Default problem not found.",
          };
        }
      } else {
        const defaultProblemId = "6802cff382aab64098bd479c";
        const defaultProblem = problems.find((p) => p._id === defaultProblemId);
        console.log(
          "Could not identify the most similar question object ID."
        );
        return {
          problemId: defaultProblem ? defaultProblem._id : "",
          problem: defaultProblem || problems[0], // Fallback to the first problem if default is not found
          behavioralQuestions: [],
          reasoning: defaultProblem
            ? "The default problem was selected as a fallback."
            : "No matching problem found, and the default problem could not be located.",
          success: !!defaultProblem,
          error:
            "Could not identify the most similar question object ID.",
        };
      }
    } else {
      console.log("No coding questions found in the article.");
      return {
        problemId: "",
        problem: problems[0], // Fallback to the first problem
        behavioralQuestions: [],
        reasoning: "No coding questions were found in the article.",
        success: false,
        error: "No coding questions found in the article.",
      };
    }
  } catch (error) {
    console.error("Error during interview experience analysis:", error);
    return {
      problemId: "",
      problem: problems[0], // Fallback to the first problem
      behavioralQuestions: [],
      reasoning: "An error occurred during the analysis.",
      success: false,
      error: "An error occurred during the analysis.",
    };
  }
}
