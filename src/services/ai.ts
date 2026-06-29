// AI Service Mock/Integration for Recommendations
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const aiService = {
  getRecommendations: async (prompt: string) => {
    if (!GEMINI_API_KEY) {
      // Mock response if no API key is provided
      return `Based on your interest in "${prompt}", you might enjoy "Interstellar" for its sci-fi depth and "The Dark Knight" for its intense atmosphere. (Mock AI Response)`;
    }

    try {
      // Example integration with Gemini API (placeholder endpoint)
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: `Recommend some movies or TV shows based on this: ${prompt}. Give a brief explanation for each.` }] }],
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('AI Service Error:', error);
      return 'Sorry, I couldn\'t get recommendations at this time.';
    }
  },
};
