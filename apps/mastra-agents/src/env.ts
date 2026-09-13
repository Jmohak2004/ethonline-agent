import * as dotenv from "dotenv";
import * as path from "path";

// Load from root .env and local .env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// Ensure Google Generative AI API key is recognized by Mastra
if (process.env.GEMINI_API_KEY) {
  if (!process.env.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GEMINI_API_KEY;
  }
}

export const DEFAULT_MODEL = "google/gemini-2.5-flash";
