
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

// Security + performance middlewares
app.use(cors({
  origin: "*", // later replace with frontend domain
}));

app.use(express.json({ limit: "1mb" }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Health check (important for Docker + CI/CD)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.send("SpeakMate AI Backend Running 🚀");
});

app.post("/api/chat", async (req, res) => {
  try {
    const text = req.body?.text;

    // validation
    if (!text || typeof text !== "string") {
      return res.status(400).json({
        reply: "Please provide valid text input.",
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a friendly English conversation partner. Reply only in English. Keep replies short and ask one follow-up question.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 100,
    });

    const reply =
      chatCompletion.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    res.json({ reply });

  } catch (error) {
    console.error("Groq API Error:", error);

    res.status(500).json({
      reply: "Internal Server Error",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});