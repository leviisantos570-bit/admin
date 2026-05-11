import { GoogleGenAI } from "@google/genai";

export async function generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment. Please select a key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-lite-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  
  if (!downloadLink) {
    throw new Error("Failed to generate video: No download link returned.");
  }

  // Fetch the video data as a blob using the API key
  const response = await fetch(downloadLink, {
    method: 'GET',
    headers: {
      'x-goog-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }

  return await response.blob();
}

export async function hasApiKey() {
  return await (window as any).aistudio.hasSelectedApiKey();
}

export async function openApiKeyDialog() {
  await (window as any).aistudio.openSelectKey();
}
