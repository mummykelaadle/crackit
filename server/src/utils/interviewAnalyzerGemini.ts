import dotenv from "dotenv";
import { Problem, problems } from "../data/problems";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

dotenv.config();

const codingQuestionsSchema = z.array(z.string());

async function identifySimilarQuestions(
  article: string,
  questionMapAsString: string
): Promise<string[] | null> {
  //@ts-ignore
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Using 'pro' for potentially better understanding

  const prompt = `Please read the following article and identify the coding questions mentioned in it.
Then, compare these questions to the following list of questions and their corresponding object IDs (as a JSON object).
Identify the top 2 most similar questions from the list to the questions found in the article.
Return a JSON array containing the object IDs of these top 1 most similar question.

Article:
${article}

Question List:
${questionMapAsString}

Object IDs of the 2 most similar questions:`;

  try {
    const result = await model.generateContent(prompt);
    const rawOutput = result.response.text();
    console.log("Raw Output (Similar Questions):", rawOutput);

    // Attempt to find the start and end of the JSON array
    const jsonStartIndex = rawOutput.indexOf("[");
    const jsonEndIndex = rawOutput.lastIndexOf("]");

    if (
      jsonStartIndex !== -1 &&
      jsonEndIndex !== -1 &&
      jsonStartIndex < jsonEndIndex
    ) {
      const jsonString = rawOutput
        .substring(jsonStartIndex, jsonEndIndex + 1)
        .trim();
      try {
        const parsedOutput = JSON.parse(jsonString);
        if (
          Array.isArray(parsedOutput) &&
          parsedOutput.length <= 2 &&
          parsedOutput.every((item) => typeof item === "string")
        ) {
          return parsedOutput;
        } else {
          console.error(
            "AI output for similar questions is not in the expected array format:",
            parsedOutput
          );
          return null;
        }
      } catch (parseError) {
        console.error(
          "Error parsing JSON from similar questions output:",
          parseError
        );
        console.error("Problematic JSON string:", jsonString);
        return null;
      }
    } else {
      console.error(
        "Could not find valid JSON array in AI output for similar questions."
      );
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

    if (extractedQuestions && extractedQuestions.length > 0) {
      console.log("Extracted Coding Questions:", extractedQuestions);

      const similarQuestionIds = await identifySimilarQuestions(
        interviewExperienceArticle,
        problemsInfo
      );

      if (similarQuestionIds) {
        console.log("Most Similar Question Object IDs:", similarQuestionIds);
        const selectedProblem = problems.find(
          (p) => p._id === similarQuestionIds[0]
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
          "Could not identify the top 2 most similar question object IDs."
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
            "Could not identify the top 2 most similar question object IDs.",
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
