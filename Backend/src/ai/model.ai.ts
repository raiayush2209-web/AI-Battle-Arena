//import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGoogle } from "@langchain/google";
import { ChatCohere } from "@langchain/cohere";
import { ChatGroq } from "@langchain/groq";
import config from "../config/config.js";



export const judgeModel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: config.GROQ_API_KEY,
    temperature: 0,
});

export const geminiAIModel = new ChatGoogle({
    model: "gemini-3.6-flash",
    apiKey: config.GEMINI_API_KEY,
});


export const cohereModel = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY,
})
