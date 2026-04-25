import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing GoogleGenAI SDK...");
try {
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "dummy");
  console.log("Success: new GoogleGenAI(string) works");
  console.log("genAI has getGenerativeModel:", typeof (genAI as any).getGenerativeModel);
  console.log("genAI has models (property):", typeof (genAI as any).models);
  console.log("genAI instance keys:", Object.keys(genAI));
} catch (e) {
  console.log("Error with new GoogleGenAI(string):", e.message);
}
