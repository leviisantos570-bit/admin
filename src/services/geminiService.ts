import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateKeywordSuggestions(topic: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the YouTube niche for the topic: "${topic}". Provide a list of high-value keywords, their estimated search volume (relative 0-100), and competition level (0-100). Also suggest 3 unique "Blue Ocean" niche sub-topics. Return in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                volume: { type: Type.NUMBER },
                competition: { type: Type.NUMBER },
                difficulty: { type: Type.STRING }
              },
              required: ["term", "volume", "competition", "difficulty"]
            }
          },
          blueOceanNiches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                reasoning: { type: Type.STRING }
              }
            }
          }
        },
        required: ["keywords", "blueOceanNiches"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateTitles(topic: string, goal: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 viral, high-CTR YouTube titles for the topic: "${topic}". Goal: ${goal}. For each title, provide a "Click Score" (0-100) and why it works. Return in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            score: { type: Type.NUMBER },
            rationale: { type: Type.STRING }
          },
          required: ["title", "score", "rationale"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateScriptOutline(topic: string, title: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a high-retention YouTube script outline for the topic: "${topic}" and title: "${title}". Include: Hook (0-15s), Intro, 3 Main Value Points, and CTA. Return in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING },
          intro: { type: Type.STRING },
          points: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING },
                content: { type: Type.STRING }
              }
            }
          },
          cta: { type: Type.STRING }
        },
        required: ["hook", "intro", "points", "cta"]
      }
    }
  });

  return JSON.parse(response.text);
}
