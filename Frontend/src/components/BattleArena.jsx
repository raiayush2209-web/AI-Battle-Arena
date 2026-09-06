import { useState } from "react";
import { invokeBattleApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function BattleArena() {
  const { user, logout } = useAuth();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await invokeBattleApi(question);
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-emerald-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreRing = (score) => {
    if (score >= 8) return "ring-emerald-500/40";
    if (score >= 5) return "ring-yellow-500/40";
    return "ring-red-500/40";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI Battle Arena
              </h1>
            </div>
            <span className="text-xs text-gray-500 border border-gray-700 rounded-full px-2 py-0.5 hidden sm:inline-block">
              Mistral vs Cohere
            </span>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="font-medium text-gray-200">{user.username || user.email}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="px-3.5 py-1.5 bg-gray-800/60 hover:bg-red-900/30 border border-gray-700 hover:border-red-700/50 text-gray-300 hover:text-red-300 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Input Section */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Ask a question and watch two AIs battle it out
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Explain quantum computing in simple terms..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition"
              rows={3}
              disabled={loading}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AIs are thinking...
                  </>
                ) : (
                  <>
                    <span>⚡</span> Battle!
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-8 bg-red-900/20 border border-red-800/50 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-700 rounded-full animate-spin border-t-purple-500"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-b-cyan-500"
                style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
              ></div>
            </div>
            <p className="text-gray-400 text-sm">Two AIs are generating responses and the judge is preparing...</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-8 animate-in">
            {/* AI Responses Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Solution 1 - Mistral */}
              <div
                className={`bg-gray-900/50 border rounded-2xl overflow-hidden ${
                  result.judge?.winner?.includes("Solution 1") || result.judge?.winner?.includes("Mistral")
                    ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                    : "border-gray-800"
                }`}
              >
                <div className="px-5 py-3 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <h3 className="font-semibold text-sm text-gray-300">Mistral AI</h3>
                    {(result.judge?.winner?.includes("Solution 1") || result.judge?.winner?.includes("Mistral")) && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                        🏆 Winner
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(result.judge?.solution_1_score)} ring-2 ${getScoreRing(
                      result.judge?.solution_1_score
                    )} rounded-full w-10 h-10 flex items-center justify-center text-sm`}
                  >
                    {result.judge?.solution_1_score}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{result.solution_1}</p>
                </div>
              </div>

              {/* Solution 2 - Cohere */}
              <div
                className={`bg-gray-900/50 border rounded-2xl overflow-hidden ${
                  result.judge?.winner?.includes("Solution 2") || result.judge?.winner?.includes("Cohere")
                    ? "border-emerald-500/50 ring-1 ring-emerald-500/20"
                    : "border-gray-800"
                }`}
              >
                <div className="px-5 py-3 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <h3 className="font-semibold text-sm text-gray-300">Cohere AI</h3>
                    {(result.judge?.winner?.includes("Solution 2") || result.judge?.winner?.includes("Cohere")) && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                        🏆 Winner
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-2xl font-bold ${getScoreColor(result.judge?.solution_2_score)} ring-2 ${getScoreRing(
                      result.judge?.solution_2_score
                    )} rounded-full w-10 h-10 flex items-center justify-center text-sm`}
                  >
                    {result.judge?.solution_2_score}
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{result.solution_2}</p>
                </div>
              </div>
            </div>

            {/* Judge Section */}
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-800/50 bg-gradient-to-r from-purple-900/20 to-cyan-900/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚖️</span>
                  <h3 className="font-semibold text-gray-200">Judge Verdict</h3>
                  <span className="text-xs text-gray-500">Powered by Gemini</span>
                </div>
              </div>
              <div className="p-5 space-y-5">
                {/* Score Comparison */}
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Mistral</p>
                    <p className={`text-3xl font-bold ${getScoreColor(result.judge?.solution_1_score)}`}>
                      {result.judge?.solution_1_score}
                      <span className="text-sm text-gray-500">/10</span>
                    </p>
                  </div>
                  <div className="text-2xl text-gray-600">vs</div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Cohere</p>
                    <p className={`text-3xl font-bold ${getScoreColor(result.judge?.solution_2_score)}`}>
                      {result.judge?.solution_2_score}
                      <span className="text-sm text-gray-500">/10</span>
                    </p>
                  </div>
                </div>

                {/* Winner Banner */}
                <div className="bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 border border-emerald-800/30 rounded-xl p-4 text-center">
                  <p className="text-emerald-400 font-semibold">
                    🏆 {result.judge?.winner || "Tie"}
                  </p>
                </div>

                {/* Verdict */}
                {result.judge?.verdict && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Overall Verdict</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{result.judge.verdict}</p>
                  </div>
                )}

                {/* Reasoning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-orange-400/70 uppercase tracking-wider mb-2">Mistral Reasoning</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{result.judge?.solution_1_reasoning}</p>
                  </div>
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <h4 className="text-xs font-medium text-blue-400/70 uppercase tracking-wider mb-2">Cohere Reasoning</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{result.judge?.solution_2_reasoning}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">⚔️</span>
            <h2 className="text-xl font-semibold text-gray-400 mb-2">Ready for Battle</h2>
            <p className="text-gray-600 text-sm max-w-md">
              Ask a question and watch Mistral AI and Cohere AI compete. A Gemini-powered judge will score both responses out of 10 and declare a winner.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
