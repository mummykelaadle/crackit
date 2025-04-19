import { Julep } from "@julep/sdk";
import dotenv from "dotenv";
import yaml from "yaml";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

dotenv.config();

const client = new Julep({ apiKey: process.env.JULEP_API_KEY });
async function getAgent(agentId: string) {
  try {
    const agent = await client.agents.get(agentId);
    return agent;
  } catch (error) {
    console.error("Error fetching agent:", error);
  }
}

export async function getImprovedMessageFromCodeAndTranscription(
  question: string,
  code: string,
  transcript: string,
  chatHistory: any[]
) {
  // Step 1: Create the Agent
  // const agent = await getAgent("0680292e-e6f9-796e-8000-9cb46793acef");
  const agent = await client.agents.create({
    name: "Interview Response Improvement Agent",
    model: "gpt-4o",
    about:
      "An AI assistant that acts as a mock interviewer evaluates speech transcriptions of interviewee and suggests improvements or returns 'none' if no improvement is needed",
  });

  if (!agent) {
    return { success: false, content: "Agent not found" };
  }

  // Step 2: Define the Task
  const taskDefinition = yaml.parse(`
        name: Response Improvement Agent
        description: Evaluate and suggest improvements to user's speech responses during a coding interview.
        main:
          - prompt:
              - role: system
                content: |
                  You are an AI assistant that evaluates user's speech transcriptions and suggests improved versions based on the context. 
                  Review the speech transcript and the chat history to understand the context.
                  If the response is already good and no improvement is needed, simply return "none".
                  Otherwise, provide a more clear, concise, and effective version of what the user was trying to communicate.
              - role: user
                content: |
                  Interview Question:
                  {{steps[0].input.question}}
        
                  Latest Transcript:
                  {{steps[0].input.transcript}}
        
                  Latest Code:
                  {{steps[0].input.code}}
        
                  Chat History:
                  {{steps[0].input.chatHistory}}
        `);

  const task = await client.tasks.create(agent.id, taskDefinition);

  // Execute the Task

  const execution = await client.executions.create(agent.id, {
    input: {
      question,
      code,
      transcript,
      chatHistory,
    },
  });

  // Wait for result
  let result;
  do {
    result = await client.executions.get(execution.id);
    if (result.status === "succeeded") {
      //@ts-ignore
      return {
        success: true,//@ts-ignore
        content: result.output.choices[0].message.content,
      };
    } else if (result.status === "failed") {
      return { success: false, content: `Execution failed: ${result.error}` };
    }

    await new Promise((res) => setTimeout(res, 1000));
  } while (!["succeeded", "failed"].includes(result.status));
  return { success: false, content: `Execution failed` };
}

const improvedMessageSchema = z.string();

async function generateImprovedMessage(
  resume: string,
  transcript: string,
  chatHistory: any[]
): Promise<string | null> {
  //@ts-ignore
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const formattedChatHistory = chatHistory
    .map((item) => `${item.role}: ${item.content}`)
    .join("\n");

    const prompt = `Please analyze the following resume and interviewee answer transcript, considering the provided chat history. Based on this analysis, generate an improved and more effective message that the candidate could have spoken. The improved message should be concise, professional, and highlight relevant skills and experiences from the resume that align with the interview discussion. The improved message should be around the same length as the original message, if shorter then better.

    Resume:
    ${resume}
    
    Interview Transcript:
    ${transcript}
    
    Chat History:
    ${formattedChatHistory}
    
    Improved Follow-up Message:`;

  try {
    const result = await model.generateContent(prompt);
    const rawOutput = result.response.text();
    console.log("Raw Output (Improved Message):", rawOutput);

    if (rawOutput) {
      try {
        return improvedMessageSchema.parse(rawOutput.trim());
      } catch (parseError) {
        console.error("Error parsing improved message output:", parseError);
        console.error("Problematic message:", rawOutput);
        return rawOutput.trim(); // Return the raw output as a fallback
      }
    } else {
      console.warn("AI did not return an improved message.");
      return null;
    }
  } catch (error) {
    console.error("Error generating improved message:", error);
    return null;
  }
}

/**
 * Analyzes an interview transcript and resume to generate an improved follow-up message.
 *
 * @param resume The candidate's resume text.
 * @param transcript The interview transcript text.
 * @param chatHistory An array of chat objects representing the conversation history.
 * @returns The improved follow-up message, or null if an error occurred.
 */
export async function getImprovedMessageFromTranscriptionAndResume(
  resume: string,
  transcript: string,
  chatHistory: any[]
): Promise<{success:boolean,content:string} | null> {
try {
    const improvedMessage = await generateImprovedMessage(
        resume,
        transcript,
        chatHistory
    );

    if (improvedMessage) {
        return {
            success: true,
            content: improvedMessage
        };
    } else {
        console.warn("Could not generate an improved follow-up message.");
        return {
            success: false,
            content: "Failed to generate an improved message"
        };
    }
} catch (error) {
    console.error("Error during improved message generation:", error);
    return {
        success: false,
        content: error instanceof Error ? error.message : "Unknown error occurred"
    };
}
}
