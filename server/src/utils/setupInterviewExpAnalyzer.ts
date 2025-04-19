import { Julep } from "@julep/sdk";
import dotenv from "dotenv";
import yaml from "yaml";
import fs from "fs";
import path from "path";
import { TaskCreateParams } from "@julep/sdk/resources.mjs";

dotenv.config();

// Initialize Julep client
const client = new Julep({ apiKey: process.env.JULEP_API_KEY });

async function setupInterviewExpAnalyzer() {
  console.log("Starting agent and task creation process...");

  try {
    // Step 1: Create Agent
    const agent = await client.agents.create({
      name: "Interview Experience Analyzer",
      model: "gpt-4o",
      about: "Analyzes interview experience articles to select relevant coding problems and extract behavioral questions",
    });

    console.log("✅ Agent created:");
    console.log(`Agent ID: ${agent.id}`);

    // Step 2: Define the Task
    const taskDefinition: TaskCreateParams = {
        name: "Analyze Interview Experience",
        description: "Analyze interview experience article and select appropriate coding problem and behavioral questions",
        main: [
          {
            prompt: [
              {
                role: "system",
                content: `You are an AI assistant that analyzes interview experience articles and selects appropriate coding problems and behavioral questions.
      You will receive an interview experience article and analyze it to:
      1. Select the most relevant coding problem based on the technical topics mentioned
      2. Extract 3-5 behavioral questions that were mentioned or implied
      
      Use the tool \`analyze_interview\` to return your final structured analysis.`,
              },
              {
                role: "user",
                content: `$ f"""Available problems:
      {steps[0].input.problems}
      
      Interview Experience Article:
      {steps[0].input.article}
      
      Based on this article, select the most appropriate coding problem ID and extract relevant behavioral questions."""`,
              },
            ],
          },
        ],
        tools: [
          {
            name: "analyze_interview",
            type: "function",
            description: "Return the selected problem and behavioral questions based on article analysis",
            function: {
              parameters: {
                type: "object",
                properties: {
                  problemId: {
                    type: "string",
                    description: "ID of the selected coding problem",
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of why this problem was selected",
                  },
                  behavioralQuestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of behavioral questions extracted from the article",
                  },
                },
                required: ["problemId", "behavioralQuestions"],
              },
            },
          },
        ],
      };

    const task = await client.tasks.create(agent.id, taskDefinition);

    console.log("✅ Task created:");
    console.log(`Task ID: ${task.id}`);

    // Save agent/task IDs to config
    const configDir = path.join(__dirname, "../config");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const agentInfoPath = path.join(configDir, "interviewAgentInfo.json");
    fs.writeFileSync(
      agentInfoPath,
      JSON.stringify(
        {
          analyzerAgentId: agent.id,
          analyzerTaskId: task.id,
          createdAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log(`Agent and task info saved to: ${agentInfoPath}`);
    return { agentId: agent.id, taskId: task.id };
  } catch (error) {
    console.error("❌ Error creating agent and task:", error);
    throw error;
  }
}

if (require.main === module) {
  setupInterviewExpAnalyzer()
    .then(({ agentId, taskId }) => {
      console.log("=================================");
      console.log(`Successfully created agent with ID: ${agentId}`);
      console.log(`Successfully created task with ID: ${taskId}`);
      console.log("=================================");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed to create agent and task:", error);
      process.exit(1);
    });
}

export { setupInterviewExpAnalyzer };
