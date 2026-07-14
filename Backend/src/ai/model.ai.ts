import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import { ChatGroq } from "@langchain/groq";
import config from "../config/config.js";

export const judgeModel = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: config.GROQ_API_KEY,
    temperature: 0,
});

export const mistralAIModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: config.MISTRALAI_API_KEY,
})


export const cohereModel = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY,
})
