import express from 'express';
import runGraph from "./ai/graph.ai.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import conversationRoutes from "./routes/conversation.routes.js"
import { authUser } from "./middlewares/auth.middleware.js"

const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
   origin: [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:5174",
    "https://ai-battle-arena.vercel.app"

  ]
  ,  methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
}))


app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Battle Arena backend is running",
    });
});
app.post("/invoke", authUser, async (req, res) => {
    try {
        const { input } = req.body

        if (!input || typeof input !== "string") {
            res.status(400).json({ message: "Invalid input", success: false })
            return
        }

        const result = await runGraph(input)

        res.status(200).json({
            message: "Graph executed successfully",
            success: true,
            result
        })
    } catch (error: any) {
        console.error("[/invoke error]", error?.message || error)
        res.status(500).json({
            message: error?.message || "Internal server error",
            success: false,
        })
    }
})

app.use("/api/auth", authRoutes)
app.use("/api/conversations", conversationRoutes)

export default app;
