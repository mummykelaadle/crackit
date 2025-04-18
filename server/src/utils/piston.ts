import axios from 'axios';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';
const DEFAULT_TIME_LIMIT = 1000; // 1 second in milliseconds
const DEFAULT_MEMORY_LIMIT = 500 * 1024 * 1024; // 500MB in bytes

// Interface for runtimes
export interface Runtime {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}

// Interface for execution request
export interface ExecutionRequest {
  language: string;
  version?: string;
  files: {
    name: string;
    content: string;
  }[];
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

// Interface for execution response
export interface ExecutionResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
    message?: string;
    status?: string;
    cpu_time: number;
    wall_time: number;
    memory: number;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
}

// Get all available runtimes from Piston API
export const getRuntimes = async (): Promise<Runtime[]> => {
  try {
    const response = await axios.get(`${PISTON_API_URL}/runtimes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching runtimes:', error);
    throw new Error('Failed to fetch available runtimes');
  }
};

// Execute code using Piston API
export const executeCode = async (
  language: string,
  content: string,
  stdin: string = '',
  args: string[] = [],
  timeLimit: number = DEFAULT_TIME_LIMIT,
  memoryLimit: number = DEFAULT_MEMORY_LIMIT,
  version?: string
): Promise<ExecutionResponse> => {
  try {
    const executionRequest: ExecutionRequest = {
      language,
      files: [
        {
          name: 'main',
          content
        }
      ],
      stdin,
      args,
      compile_timeout: timeLimit,
      run_timeout: timeLimit,
      compile_memory_limit: memoryLimit,
      run_memory_limit: memoryLimit
    };

    // Add version to the request if provided
    if (version) {
      executionRequest.version = version;
    }

    const response = await axios.post(`${PISTON_API_URL}/execute`, executionRequest);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const statusCode = error.response.status;
      const errorMessage = error.response.data.message || 'Unknown error occurred';
      
      if (statusCode === 400) {
        throw new Error(`Bad request: ${errorMessage}`);
      } else if (statusCode === 429) {
        throw new Error('Rate limit exceeded. Piston API is limited to 5 requests per second.');
      } else {
        throw new Error(`Execution failed: ${errorMessage}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from Piston API');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error: ${error.message}`);
    }
  }
};

// Helper function to determine if an execution resulted in TLE
export const isTimeLimit = (response: ExecutionResponse): boolean => {
  return response.run.wall_time >= DEFAULT_TIME_LIMIT || 
         response.run.message === 'Runtime limit exceeded' ||
         response.run.status === 'timeout';
};

// Helper function to determine if an execution resulted in MLE
export const isMemoryLimit = (response: ExecutionResponse): boolean => {
  return response.run.memory >= DEFAULT_MEMORY_LIMIT || 
         response.run.message === 'Memory limit exceeded';
};