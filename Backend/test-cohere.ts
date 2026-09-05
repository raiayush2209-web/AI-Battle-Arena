import "dotenv/config";
import { ChatCohere } from "@langchain/cohere";

const model = new ChatCohere({
    model: "command-a-03-2025",
    apiKey: process.env.COHERE_API_KEY,
});

try {
    const response = await model.invoke([
        {
            role: "user",
            content: "Say hello in one sentence.",
        },
    ]);

    console.log("✅ COHERE WORKS");
    console.log(response.content);
} catch (error: any) {
    console.error("❌ COHERE FAILED");
    console.error("Message:", error?.message);
    console.error("Cause:", error?.cause);
}