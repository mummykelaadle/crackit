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
    about: "Acts like a real interviewer, evaluating candidates and helping them prepare for interviews by asking targeted questions based on their resume.",
  });

  // Step 2: Create the Task Definition
  const taskDefinition = yaml.parse(`
    name: ResumeQnATask
    description: Interview-style question generation based on resume and chat history.
    input_schema:
      type: object
      properties:
        resume_file_id:
          type: string
        chat_history:
          type: string
      required: [resume_file_id, chat_history]
    
    main:
      - doc: search
        arguments:
          file_ids: [$ _.resume_file_id]
          top_k: 5
    
      - prompt:
          role: system
          content: |-
            $ f"""
            You are an AI interviewer. Use the context from the resume and the conversation history to guide your next question.
    
            Resume context:
            {steps[0].output}
    
            Conversation so far:
            {_.chat_history}
    
            Ask the next question based on the resume and conversation so far.
            Make sure it's relevant and progresses naturally from previous topics.
            """
          unwrap: true
    `);
    

  // Step 3: Create the Task
  const task = await client.tasks.create(agent.id, taskDefinition);

  // Step 4: Execute the Task
  const chatHistory = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const execution = await client.executions.create(task.id, {
    input: {
      resume_file_id: resumeFileId,
      chat_history: history.map(msg => `${msg.role}: ${msg.content}`).join('\n'), // make sure it's a string
    },
  });
  

  // Step 5: Poll for Result
  while (true) {
    const result = await client.executions.get(execution.id);

    if (result.status === "succeeded") {
      return {
        success: true,
        // @ts-ignore
        content: result.output.choices?.[0]?.message?.content || "No output returned.",
      };
    }

    if (result.status === "failed") {
      return {
        success: false,
        content: `Execution failed: ${result.error}`,
      };
    }

    await new Promise(res => setTimeout(res, 1000));
  }
}