
import { GoogleGenAI } from "@google/genai";

// Function no longer requires apiKey to be passed in, it uses process.env.API_KEY
export const askAiTutor = async (
  question: string,
  context: string
): Promise<string> => {
  try {
    // Initialize client dynamically with the env key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const model = 'gemini-3-flash-preview';
    const systemInstruction = `
      You are an expert AI Tutor for the CatalogiX Course Portal.
      Your goal is to help students understand the course material based on the provided lesson context.
      
      Rules:
      1. ALWAYS answer in INDONESIAN (Bahasa Indonesia), unless the user explicitly asks in English.
      2. Be concise, encouraging, and professional.
      3. Use the "Context" provided to answer the specific question.
      4. If the answer isn't in the context, use your general knowledge but mention that it's general advice.
      5. Keep answers under 150 words unless asked for a detailed explanation.
    `;

    const prompt = `
      Context (Lesson Description/Transcript):
      ${context}

      Student Question:
      ${question}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "Mohon maaf, saya tidak bisa memberikan jawaban saat ini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ada masalah koneksi. Silakan cek internet Anda.";
  }
};
