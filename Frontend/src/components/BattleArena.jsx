import { useState, useMemo } from "react";
import { invokeBattleApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../context/ConversationContext";
import { generateConversationTitle } from "../utils/titleHelper";
import BattleResult from "./BattleResult";
import Sidebar from "./Sidebar";

export default function BattleArena() {
  const { user, logout } = useAuth();
  const {
    currentConversation,
    conversationLoading,
    createConversation,
    saveBattleMessage,
  } = useConversations();

  const [question, setQuestion] = useState("");
  const [battleLoading, setBattleLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Reconstruct chronological battle rounds from current conversation messages
  const messageRounds = useMemo(() => {
    if (!currentConversation || !currentConversation.messages) return [];
    const messages = currentConversation.messages;
    const rounds = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.role === "user") {
        const nextMsg = messages[i + 1];
        if (nextMsg && nextMsg.role === "assistant") {
          rounds.push({
            userMessage: msg.content,
            assistant: {
              ai1: nextMsg.ai1,
              ai2: nextMsg.ai2,
              judge: nextMsg.judge,
            },
          });
          i++; // Skip assistant message in next loop
        } else {
          rounds.push({ userMessage: msg.content, assistant: null });
        }
      }
    }
    return rounds;
  }, [currentConversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = question.trim();
    if (!prompt) return;

    setBattleLoading(true);
    setError("");
    setSaveError("");

    let invokeData = null;

    try {
      // Step 1: Run AI Battle through /invoke
      invokeData = await invokeBattleApi(prompt);
      if (!invokeData || !invokeData.success) {
        setError(invokeData?.message || "Something went wrong running the battle");
        setBattleLoading(false);
        return;
      }
    } catch (err) {
      setError("Failed to connect to the server. Make sure the backend is running.");
      setBattleLoading(false);
      return;
    }

    setBattleLoading(false);

    // Map LangGraph result into backend assistant schema
    const rawResult = invokeData.result || {};
    const assistantPayload = {
      ai1: {
        model: "Gemini",
        response: rawResult.solution_1 || "",
      },
      ai2: {
        model: "Cohere",
        response: rawResult.solution_2 || "",
      },
      judge: {
        model: "Groq",
        winner: rawResult.judge?.winner || "Tie",
        explanation:
          rawResult.judge?.verdict ||
          rawResult.judge?.solution_1_reasoning ||
          rawResult.judge?.solution_2_reasoning ||
          "Evaluation complete",
      },
    };

    // Step 2: Save to MongoDB Conversation
    setSaveLoading(true);
    try {
      let targetConvId = currentConversation?._id;

      if (!targetConvId) {
        // Create conversation if first prompt in new battle
        const newTitle = generateConversationTitle(prompt);
        const newConv = await createConversation(newTitle);
        targetConvId = newConv._id;
      }

      await saveBattleMessage(targetConvId, {
        userMessage: prompt,
        assistant: assistantPayload,
      });

      setQuestion("");
    } catch (err) {
      console.error("[saveBattleMessage failed]", err);
      setSaveError(
        "AI Battle completed, but failed to save to history: " + (err.message || "Unknown error")
      );
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar with History */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Arena Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="shrink-0 border-b border-gray-800/50 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-1.5 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-900"
                title="Open battle history"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-2xl">⚔️</span>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Battle Arena
                </h1>
              </div>

              <span className="text-xs text-gray-500 border border-gray-700 rounded-full px-2 py-0.5 hidden sm:inline-block">
                Gemini vs Cohere (Judged by Groq)
              </span>
            </div>

            {/* User Badge & Logout */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-900/60 border border-gray-800 rounded-xl text-xs text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-medium text-gray-200 truncate max-w-[120px] sm:max-w-none">
                    {user.username || user.email}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 bg-gray-800/60 hover:bg-red-900/30 border border-gray-700 hover:border-red-700/50 text-gray-300 hover:text-red-300 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Battle Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Input Form Section */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-400">
                    {currentConversation
                      ? `Conversation: "${currentConversation.title}" — Continue battle`
                      : "Ask a question and watch two AIs battle it out"}
                  </label>
                  {saveLoading && (
                    <span className="text-xs text-cyan-400 animate-pulse flex items-center gap-1">
                      <span>💾</span> Saving battle to history...
                    </span>
                  )}
                </div>

                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Write a Java binary search algorithm with edge case handling..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition text-sm"
                  rows={3}
                  disabled={battleLoading || saveLoading}
                />

                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={battleLoading || saveLoading || !question.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    {battleLoading ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
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

            {/* Error Banners */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-3.5 text-red-400 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {saveError && (
              <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-3.5 text-yellow-400 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{saveError}</span>
              </div>
            )}

            {/* Loading Conversation State */}
            {conversationLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-3 border-gray-700 rounded-full animate-spin border-t-purple-500"></div>
                <p className="text-gray-400 text-xs">Loading conversation history...</p>
              </div>
            )}

            {/* Active AI Invocation Loading */}
            {battleLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-gray-700 rounded-full animate-spin border-t-purple-500"></div>
                  <div
                    className="absolute inset-0 w-14 h-14 border-4 border-transparent rounded-full animate-spin border-b-cyan-500"
                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                  ></div>
                </div>
                <p className="text-gray-400 text-xs text-center">
                  Two AIs are generating responses and the judge is preparing verdict...
                </p>
              </div>
            )}

            {/* Chronological Battle Rounds in Current Conversation */}
            {!conversationLoading && messageRounds.length > 0 && (
              <div className="space-y-10">
                {messageRounds.map((round, idx) => (
                  <div key={idx} className="space-y-4 pt-4 border-t border-gray-800/40 first:border-0 first:pt-0">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <span>Round {idx + 1}</span>
                    </div>

                    <BattleResult
                      problem={round.userMessage}
                      result={{
                        solution_1: round.assistant?.ai1?.response,
                        solution_2: round.assistant?.ai2?.response,
                        ai1: round.assistant?.ai1,
                        ai2: round.assistant?.ai2,
                        judge: {
                          winner: round.assistant?.judge?.winner,
                          verdict: round.assistant?.judge?.explanation,
                          explanation: round.assistant?.judge?.explanation,
                          model: round.assistant?.judge?.model,
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State when no battles in current conversation */}
            {!conversationLoading && !battleLoading && messageRounds.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-5xl mb-4">⚔️</span>
                <h2 className="text-lg font-semibold text-gray-400 mb-1">Ready for Battle</h2>
                <p className="text-gray-600 text-xs max-w-md">
                  Ask a question and watch Gemini AI and Cohere AI compete. A Groq-powered judge will evaluate both responses and declare a winner.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
