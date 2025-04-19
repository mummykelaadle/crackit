import { AssemblyAI } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || '',
});

export const transcribeAudio = async (file: Express.Multer.File): Promise<string> => {
  try {
    // Transcribe the audio directly from the buffer
    const transcript = await client.transcripts.transcribe({
      audio: file.buffer, // Use the buffer directly
    });

    return transcript.text || '';
  } catch (error) {
    console.error('Error during transcription:', error);
    throw new Error('Failed to transcribe audio');
  }
};
