import { getScoreColor, getScoreRing } from "../utils/scoreHelper";

export default function BattleResult({ result, problem }) {
  if (!result) return null;

  const sol1Score = result.judge?.solution_1_score;
  const sol2Score = result.judge?.solution_2_score;
  const winner = result.judge?.winner;

  const isSol1Winner = winner?.includes("Solution 1") || winner?.includes("Gemini") || winner?.includes("Gemini");
  const isSol2Winner = winner?.includes("Solution 2") || winner?.includes("Cohere");

  return (
    <div className="space-y-6">
      {/* Problem Prompt Banner (if provided) */}
      {problem && (
        <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 text-xs text-gray-400">
          <span className="font-semibold text-purple-400 uppercase tracking-wider block mb-1">
            Prompt
          </span>
          <p className="text-gray-200 text-sm">{problem}</p>
        </div>
      )}

      {/* AI Responses Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solution 1 - Gemini / Mistral */}
        <div
          className={`bg-gray-900/50 border rounded-2xl overflow-hidden ${
            isSol1Winner
              ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
              : "border-gray-800"
          }`}
        >
          <div className="px-5 py-3 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <h3 className="font-semibold text-sm text-gray-300">
                {result.ai1?.model || "Gemini AI"}
              </h3>
              {isSol1Winner && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  🏆 Winner
                </span>
              )}
            </div>
            {sol1Score !== undefined && (
              <div
                className={`text-2xl font-bold ${getScoreColor(sol1Score)} ring-2 ${getScoreRing(
                  sol1Score
                )} rounded-full w-10 h-10 flex items-center justify-center text-sm`}
              >
                {sol1Score}
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {result.solution_1 || result.ai1?.response}
            </p>
          </div>
        </div>

        {/* Solution 2 - Cohere */}
        <div
          className={`bg-gray-900/50 border rounded-2xl overflow-hidden ${
            isSol2Winner
              ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
              : "border-gray-800"
          }`}
        >
          <div className="px-5 py-3 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <h3 className="font-semibold text-sm text-gray-300">
                {result.ai2?.model || "Cohere AI"}
              </h3>
              {isSol2Winner && (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  🏆 Winner
                </span>
              )}
            </div>
            {sol2Score !== undefined && (
              <div
                className={`text-2xl font-bold ${getScoreColor(sol2Score)} ring-2 ${getScoreRing(
                  sol2Score
                )} rounded-full w-10 h-10 flex items-center justify-center text-sm`}
              >
                {sol2Score}
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {result.solution_2 || result.ai2?.response}
            </p>
          </div>
        </div>
      </div>

      {/* Judge Section */}
      <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800/50 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖️</span>
            <h3 className="font-semibold text-gray-200">Judge Verdict</h3>
            <span className="text-xs text-gray-500">
              Powered by {result.judge?.model || "Groq / Gemini"}
            </span>
          </div>
        </div>
        <div className="p-5 space-y-5">
          {/* Score Comparison (if scores exist) */}
          {(sol1Score !== undefined || sol2Score !== undefined) && (
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">{result.ai1?.model || "AI 1"}</p>
                <p className={`text-3xl font-bold ${getScoreColor(sol1Score)}`}>
                  {sol1Score}
                  <span className="text-sm text-gray-500">/10</span>
                </p>
              </div>
              <div className="text-2xl text-gray-600">vs</div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">{result.ai2?.model || "AI 2"}</p>
                <p className={`text-3xl font-bold ${getScoreColor(sol2Score)}`}>
                  {sol2Score}
                  <span className="text-sm text-gray-500">/10</span>
                </p>
              </div>
            </div>
          )}

          {/* Winner Banner */}
          <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 border border-emerald-800/30 rounded-xl p-4 text-center">
            <p className="text-emerald-400 font-semibold">
              🏆 {winner || "Tie"}
            </p>
          </div>

          {/* Verdict or Explanation */}
          {(result.judge?.verdict || result.judge?.explanation) && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Overall Verdict
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {result.judge?.verdict || result.judge?.explanation}
              </p>
            </div>
          )}

          {/* Reasoning */}
          {(result.judge?.solution_1_reasoning || result.judge?.solution_2_reasoning) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.judge?.solution_1_reasoning && (
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h4 className="text-xs font-medium text-orange-400/70 uppercase tracking-wider mb-2">
                    {result.ai1?.model || "AI 1"} Reasoning
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {result.judge.solution_1_reasoning}
                  </p>
                </div>
              )}
              {result.judge?.solution_2_reasoning && (
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <h4 className="text-xs font-medium text-blue-400/70 uppercase tracking-wider mb-2">
                    {result.ai2?.model || "AI 2"} Reasoning
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {result.judge.solution_2_reasoning}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
