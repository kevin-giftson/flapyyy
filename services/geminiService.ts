
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGameCommentary = async (score: number, highScore: number): Promise<string> => {
  try {
    const isNewRecord = score > highScore && highScore > 0;
    const prompt = `
      Act as a witty, slightly sarcastic AI game commentator for a Flappy Bird style game. 
      The player just finished a round.
      Player Score: ${score}
      Previous High Score: ${highScore}
      ${isNewRecord ? "THEY SET A NEW PERSONAL RECORD!" : ""}
      
      Give a short (max 20 words) reaction. 
      If the score is very low (under 5), be funny and a bit roasting. 
      If the score is decent (5-20), be encouraging but cool. 
      If the score is high (20+), be impressed.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Better luck next time, featherweight!";
  } catch (error) {
    console.error("Gemini commentary error:", error);
    return score < 5 ? "Gravity is your worst enemy, isn't it?" : "That was... a performance. Of some kind.";
  }
};
