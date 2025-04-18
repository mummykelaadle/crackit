import { Julep } from "@julep/sdk";
import dotenv from "dotenv";
import yaml from "yaml";

dotenv.config();

const client = new Julep({ apiKey: process.env.JULEP_API_KEY });

export async function evaluateCodeAndTranscript(
    question: string,
    code: string,
    transcript: string,
    chatHistory: any[]
) {
    // Step 1: Create the Agent
    const agent = await client.agents.create({
        name: "Mock Interviewer",
        model: "gpt-4o",
        about:
            "Acts like a software interview panelist giving feedback on code and thought process.",
    });

    // Step 2: Define the Task
    const taskDefinition = yaml.parse(`
        name: Mock Interviewer
        description: Review candidate’s progress during mock coding interview and respond like a real interviewer.
        main:
          - prompt:
              - role: system
                content: |
                  You are an AI mock interviewer for a coding round. You will receive the candidate’s partial code, recent transcript of their thought process, and chat history. Your job is to give helpful, brief feedback like a real interviewer. You are professional, encouraging, and offer subtle hints if the candidate is off track. Do not reveal full solutions. Never sound robotic. Provide feedback only based on what the candidate has explained or written so far. Respond in 1-3 sentences maximum.
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
    const execution = await client.executions.create(task.id, {
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
            return { success: true, content: result.output.choices[0].message.content };
        } else if (result.status === "failed") {
            return { success: false, content: `Execution failed: ${result.error}` };
        }

        await new Promise((res) => setTimeout(res, 1000));
    } while (!["succeeded", "failed"].includes(result.status));
    return { success: false, content: `Execution failed` };
}