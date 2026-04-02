import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // AI Recommendation Endpoint
  app.post("/api/recommendations", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }
    const aiClient = new GoogleGenAI({ apiKey });
    const { user, schedule, workout } = req.body;

    const prompt = `
      You are FITKIT AI, a senior nutritionist specializing in Indian hostel diets.
      User Profile: ${JSON.stringify(user)}
      User Metabolism: ${user.metabolism} (Adjust portion sizes and meal timing accordingly)
      Weekly Mess Schedule: ${JSON.stringify(schedule)}
      Today's Workout: ${JSON.stringify(workout)}

      Based on the user's goal (${user.goal}) and metabolism (${user.metabolism}), provide a detailed diet recommendation for today.
      Consider:
      1. "Mess Reality Mode": ${user.messRealityMode ? "ON (Assume food is oily and portions are inconsistent)" : "OFF"}
      2. Budget-friendly add-ons within ₹${user.budget || 50}/day.
      3. Macro breakdown (Calories, Protein, Carbs, Fats).
      4. Specific advice on what to eat from the mess and what to supplement.
      5. "Lazy Mode" tip: 1 simple action to stay on track.
      6. Metabolism Advice: How the user's ${user.metabolism} metabolism affects their digestion and when they should eat their heaviest meals.

      Return the response in JSON format with the following structure:
      {
        "dailyPlan": {
          "breakfast": { "mess": "string", "supplement": "string", "advice": "string" },
          "lunch": { "mess": "string", "supplement": "string", "advice": "string" },
          "dinner": { "mess": "string", "supplement": "string", "advice": "string" }
        },
        "macros": { "calories": number, "protein": number, "carbs": number, "fats": number },
        "gap": { "protein": number, "calories": number },
        "lazyTip": "string"
      }
    `;

    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("AI Recommendation Error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // AI Schedule Analysis Endpoint
  app.post("/api/analyze-schedule", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }
    const aiClient = new GoogleGenAI({ apiKey });
    const { image } = req.body; // base64 image data

    const prompt = `
      Analyze this image of an Indian hostel mess menu. 
      Extract the weekly schedule for Breakfast, Lunch, and Dinner for all 7 days (Monday to Sunday).
      
      Return the response in JSON format matching this structure:
      {
        "schedule": {
          "monday": { "breakfast": "string", "lunch": "string", "dinner": "string" },
          "tuesday": { "breakfast": "string", "lunch": "string", "dinner": "string" },
          ... (all days)
        }
      }
      
      If a meal is not clear, use a common Indian mess meal as a placeholder (e.g., "Poha", "Dal Rice").
    `;

    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: image.split(",")[1] || image
            }
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("AI Schedule Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze schedule image" });
    }
  });

  // AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }
    const aiClient = new GoogleGenAI({ apiKey });
    const { message, history, user } = req.body;

    const systemInstruction = `
      You are FITKIT AI Coach. You help Indian hostel students with their fitness and diet.
      User Goal: ${user.goal}.
      Be encouraging, practical, and use student-friendly language.
      Suggest budget-friendly Indian options (eggs, soya, paneer, etc.).
    `;

    try {
      const chat = aiClient.chats.create({
        model: "gemini-3-flash-preview",
        config: { systemInstruction }
      });

      // Send history if provided
      // For simplicity, we just send the current message with context
      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: "Failed to chat" });
    }
  });

  // AI Workout Recommendation Endpoint
  app.post("/api/workout-recommendations", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }
    const aiClient = new GoogleGenAI({ apiKey });
    const { user, history } = req.body;

    const prompt = `
      You are a world-class fitness coach. Generate a personalized workout plan for a hostel student in India.
      
      User Profile:
      - Goal: ${user.goal}
      - Weight: ${user.weight}kg, Height: ${user.height}cm, Age: ${user.age}
      - Metabolism: ${user.metabolism}
      - Available Equipment: ${user.availableEquipment?.join(", ") || "Bodyweight only"}
      
      Recent Workout History:
      ${JSON.stringify(history)}

      Constraints:
      - Workouts should be effective but realistic for a hostel room or small college gym.
      - Focus on the user's goal (${user.goal}).
      - Provide clear instructions.

      Return a JSON object matching this structure:
      {
        "title": "Workout Name",
        "duration": 45,
        "intensity": "medium",
        "exercises": [
          { "name": "Exercise Name", "sets": 3, "reps": "10-12", "rest": 60, "instructions": "..." }
        ],
        "coachingTip": "A motivational or technical tip"
      }
    `;

    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("AI Workout Recommendation Error:", error);
      res.status(500).json({ error: "Failed to generate workout" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
