import { Julep } from "@julep/sdk";
import dotenv from "dotenv";
import yaml from "yaml";
import fs from "fs";
import path from "path";

dotenv.config();

// Initialize Julep client
const client = new Julep({ apiKey: process.env.JULEP_API_KEY });

/**
 * Creates a new agent and task for analyzing interview experiences
 * Saves the IDs to a configuration file for future use
 */
async function setupInterviewExpAnalyzer() {
  console.log("Starting agent and task creation process...");

  try {
    // Step 1: Create the Agent
    const agent = await client.agents.create({
      name: "Interview Experience Analyzer",
      model: "gpt-4o",
      about: "Analyzes interview experience articles to select relevant coding problems and extract behavioral questions",
    });
    
    console.log("✅ Agent created:");
    console.log(`Agent ID: ${agent.id}`);
    
    // Step 2: Define the Task
    const taskDefinition = yaml.parse(`
      name: Analyze Interview Experience
      description: Analyze interview experience article and select appropriate coding problem and behavioral questions
      main:
        - prompt:
            - role: system
              content: |
                You are an AI assistant that analyzes interview experience articles and selects appropriate coding problems and behavioral questions.
                You will receive an interview experience article (like from GeeksForGeeks) and analyze it to:
                1. Select the most relevant coding problem based on the technical topics mentioned in the article
                2. Extract 3-5 behavioral questions that were mentioned or implied in the interview experience
                
                Keep your selections relevant to the content of the interview experience.
            - role: user
              content: |
                Available problems:
                {{steps[0].input.problems}}
                
                Interview Experience Article:
                {{steps[0].input.article}}
                
                Based on this article, select the most appropriate coding problem ID and extract relevant behavioral questions.
      `);
     
    const task = await client.tasks.create(agent.id, taskDefinition);
    
    console.log("✅ Task created:");
    console.log(`Task ID: ${task.id}`);
    
    // Save the agent and task IDs to a file for future reference
    const configDir = path.join(__dirname, "../config");
    
    // Check if the config directory exists, create if not
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const agentInfoPath = path.join(configDir, "interviewAgentInfo.json");
    fs.writeFileSync(
      agentInfoPath,
      JSON.stringify({
        analyzerAgentId: agent.id,
        analyzerTaskId: task.id,
        createdAt: new Date().toISOString(),
      }, null, 2)
    );

    console.log(`Agent and task info saved to: ${agentInfoPath}`);

    return { agentId: agent.id, taskId: task.id };
  } catch (error) {
    console.error("Error creating agent and task:", error);
    throw error;
  }
}

// Run the script directly if executed as a standalone file
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
      console.error("Failed to create agent and task:", error);
      process.exit(1);
    });
}

export { setupInterviewExpAnalyzer };