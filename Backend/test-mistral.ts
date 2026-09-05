import { ChatMistralAI } from "@langchain/mistralai";

import config from "./src/config/config.js";



const model = new ChatMistralAI({
    model: "mistral-small-2603",
    apiKey: config.MISTRAL_API_KEY,
});

const response = await model.invoke([
    {
        role: "user",
        content: "Say hello",
    },
]);

console.log(response.content);