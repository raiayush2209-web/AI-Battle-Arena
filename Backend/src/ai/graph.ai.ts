import { StateGraph, Annotation, START, END } from "@langchain/langgraph"
import { mistralAIModel, cohereModel, judgeModel } from "./model.ai.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const StateAnnotation = Annotation.Root({
    problem: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
    solution_1: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
    solution_2: Annotation<string>({ reducer: (_, b) => b, default: () => "" }),
    judge: Annotation<{
        solution_1_score: number;
        solution_2_score: number;
        solution_1_reasoning: string;
        solution_2_reasoning: string;
        winner: string;
        verdict: string;
    }>({
        reducer: (_, b) => b,
        default: () => ({
            solution_1_score: 0,
            solution_2_score: 0,
            solution_1_reasoning: "",
            solution_2_reasoning: "",
            winner: "",
            verdict: "",
        }),
    }),
});

const solutionNode = async (state: typeof StateAnnotation.State) => {
    const [mistralResponse, cohereResponse] = await Promise.all([
        mistralAIModel.invoke(state.problem),
        cohereModel.invoke(state.problem),
    ]);

    return {
        solution_1: typeof mistralResponse.content === "string" ? mistralResponse.content : JSON.stringify(mistralResponse.content),
        solution_2: typeof cohereResponse.content === "string" ? cohereResponse.content : JSON.stringify(cohereResponse.content),
    };
};

const judgeNode = async (state: typeof StateAnnotation.State) => {
    const { problem, solution_1, solution_2 } = state;

    const judgeResponse = await judgeModel.invoke([
        new SystemMessage(
            `You are an expert AI judge. Evaluate two AI-generated solutions to a problem. 
You MUST respond ONLY with a valid JSON object (no markdown, no code fences) in this exact format:
{
  "solution_1_score": <number 0-10>,
  "solution_2_score": <number 0-10>,
  "solution_1_reasoning": "<string>",
  "solution_2_reasoning": "<string>",
  "winner": "<'Solution 1 (Mistral)' or 'Solution 2 (Cohere)' or 'Tie'>",
  "verdict": "<string explaining why the winner is better>"
}`
        ),
        new HumanMessage(
            `Problem: ${problem}\n\nSolution 1 (Mistral AI):\n${solution_1}\n\nSolution 2 (Cohere AI):\n${solution_2}\n\nEvaluate both solutions and respond with the JSON.`
        ),
    ]);

    const responseText = typeof judgeResponse.content === "string" ? judgeResponse.content : JSON.stringify(judgeResponse.content);

    try {
        const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);

        return {
            judge: {
                solution_1_score: Number(parsed.solution_1_score) || 0,
                solution_2_score: Number(parsed.solution_2_score) || 0,
                solution_1_reasoning: parsed.solution_1_reasoning || "",
                solution_2_reasoning: parsed.solution_2_reasoning || "",
                winner: parsed.winner || "Tie",
                verdict: parsed.verdict || "",
            },
        };
    } catch {
        return {
            judge: {
                solution_1_score: 0,
                solution_2_score: 0,
                solution_1_reasoning: "Failed to parse judge response",
                solution_2_reasoning: "Failed to parse judge response",
                winner: "Error",
                verdict: responseText,
            },
        };
    }
};

const graph = new StateGraph(StateAnnotation)
    .addNode("solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_node")
    .addEdge("judge_node", END)
    .compile();

export default async function (problem: string) {
    const result = await graph.invoke({
        problem: problem,
    });

    return result;
}
