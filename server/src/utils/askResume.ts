import { Julep } from "@julep/sdk";
import dotenv from "dotenv";
import yaml from "yaml";

dotenv.config();

const client = new Julep({ apiKey: process.env.JULEP_API_KEY });

export async function askQuestionsFromResume(resumeFileId: string, history: any[]) {
  // Step 1: Create the Agent
  const agent = await client.agents.create({
    name: "ResumeQnAAgent",
    model: "gpt-4o",
    about:
      "Acts like a real interviewer, evaluating candidates and helping them prepare for interviews by asking targeted questions based on their resume.",
  });

  // Step 2: Define Task with Semantic Context + History
  const taskDefinition = yaml.parse(`
    name: ResumeQnAAgent
    description: Ask interview questions based on resume content using document search and past conversation.
    main:
      - doc: search
        arguments:
          query: "Conduct an interview based on the user's resume"
          file_ids: [$ _.resume_file_id]
          top_k: 5
      - prompt:
          - role: system
            content: |-
              You are an AI interviewer. Use the context from the resume and the conversation history to guide your next question.

              Resume Context:
              {_.docs}

              Conversation so far:
              {_.chat_history}

              Based on the user's prior responses and the resume, ask the next appropriate interview question. Focus on areas not yet covered, and ensure progression from general to technical to behavioral and leadership topics. Keep it friendly and natural.
          unwrap: true
  `);

  const task = await client.tasks.create(agent.id, taskDefinition);

  // Step 3: Execute the Task
  const execution = await client.executions.create(task.id, {
    input: {
      resume_file_id: resumeFileId,
      chat_history: history.map((msg) => `${msg.role}: ${msg.content}`).join('\n'),
    },
  });

  // Step 4: Poll for Result
  let result;
  do {
    result = await client.executions.get(execution.id);
    if (result.status === "succeeded") {
      return {
        success: true,
        //@ts-ignore
        content: result.output.choices[0].message.content,
      };
    } else if (result.status === "failed") {
      return { success: false, content: `Execution failed: ${result.error}` };
    }
    await new Promise((res) => setTimeout(res, 1000));
  } while (!["succeeded", "failed"].includes(result.status));

  return { success: false, content: "Execution timed out." };
}
