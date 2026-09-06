import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getConversationsApi,
  getConversationApi,
  createConversationApi,
  updateConversationApi,
  deleteConversationApi,
  addBattleMessageApi,
} from "../services/api";
import { useAuth } from "./AuthContext";

const ConversationContext = createContext(null);
const CURRENT_CONVERSATION_KEY = "ai_battle_arena_current_conversation";

export function ConversationProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load conversation metadata list
  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getConversationsApi();
      if (data && data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("[loadConversations error]", err);
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Select/Open a single conversation
  const selectConversation = useCallback(
    async (id) => {
      if (!id) {
        setCurrentConversation(null);
        localStorage.removeItem(CURRENT_CONVERSATION_KEY);
        return null;
      }

      setConversationLoading(true);
      setError(null);
      try {
        const data = await getConversationApi(id);
        if (data && data.conversation) {
          setCurrentConversation(data.conversation);
          localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
          return data.conversation;
        }
      } catch (err) {
        console.error("[selectConversation error]", err);
        setError(err.message || "Failed to load conversation");
        setCurrentConversation(null);
        localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      } finally {
        setConversationLoading(false);
      }
    },
    []
  );

  // Start a new blank conversation in UI
  const startNewConversation = useCallback(() => {
    setCurrentConversation(null);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  }, []);

  // Create a new conversation on backend
  const createConversation = useCallback(async (title) => {
    try {
      const data = await createConversationApi(title);
      if (data && data.conversation) {
        setConversations((prev) => [
          {
            _id: data.conversation._id,
            title: data.conversation.title,
            pinned: data.conversation.pinned,
            createdAt: data.conversation.createdAt,
            updatedAt: data.conversation.updatedAt,
          },
          ...prev,
        ]);
        setCurrentConversation(data.conversation);
        localStorage.setItem(CURRENT_CONVERSATION_KEY, data.conversation._id);
        return data.conversation;
      }
    } catch (err) {
      console.error("[createConversation error]", err);
      throw err;
    }
  }, []);

  // Rename a conversation
  const renameConversation = useCallback(
    async (id, title) => {
      if (!title || !title.trim()) return;
      try {
        const data = await updateConversationApi(id, { title: title.trim() });
        if (data && data.conversation) {
          setConversations((prev) =>
            prev.map((c) =>
              c._id === id ? { ...c, title: data.conversation.title, updatedAt: data.conversation.updatedAt } : c
            )
          );
          if (currentConversation && currentConversation._id === id) {
            setCurrentConversation((prev) => (prev ? { ...prev, title: data.conversation.title } : prev));
          }
        }
      } catch (err) {
        console.error("[renameConversation error]", err);
        throw err;
      }
    },
    [currentConversation]
  );

  // Toggle Pin state
  const togglePin = useCallback(
    async (id) => {
      const target = conversations.find((c) => c._id === id);
      if (!target) return;
      const nextPinned = !target.pinned;
      try {
        const data = await updateConversationApi(id, { pinned: nextPinned });
        if (data && data.conversation) {
          setConversations((prev) =>
            prev.map((c) =>
              c._id === id ? { ...c, pinned: data.conversation.pinned, updatedAt: data.conversation.updatedAt } : c
            )
          );
          if (currentConversation && currentConversation._id === id) {
            setCurrentConversation((prev) => (prev ? { ...prev, pinned: data.conversation.pinned } : prev));
          }
        }
      } catch (err) {
        console.error("[togglePin error]", err);
        throw err;
      }
    },
    [conversations, currentConversation]
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (id) => {
      try {
        await deleteConversationApi(id);
        setConversations((prev) => prev.filter((c) => c._id !== id));
        if (currentConversation && currentConversation._id === id) {
          setCurrentConversation(null);
          localStorage.removeItem(CURRENT_CONVERSATION_KEY);
        }
      } catch (err) {
        console.error("[deleteConversation error]", err);
        throw err;
      }
    },
    [currentConversation]
  );

  // Save battle interaction (user message + assistant battle result)
  const saveBattleMessage = useCallback(
    async (id, { userMessage, assistant }) => {
      try {
        const data = await addBattleMessageApi(id, { userMessage, assistant });
        if (data && data.conversation) {
          setCurrentConversation(data.conversation);
          // Update conversation in sidebar list (e.g. updatedAt)
          setConversations((prev) =>
            prev.map((c) =>
              c._id === id
                ? {
                    ...c,
                    title: data.conversation.title,
                    updatedAt: data.conversation.updatedAt,
                  }
                : c
            )
          );
          return data.conversation;
        }
      } catch (err) {
        console.error("[saveBattleMessage error]", err);
        throw err;
      }
    },
    []
  );

  // Initial load when user logs in or page refreshes
  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setCurrentConversation(null);
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
      return;
    }

    async function init() {
      await loadConversations();
      const savedId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
      if (savedId) {
        await selectConversation(savedId);
      }
    }
    init();
  }, [isAuthenticated, loadConversations, selectConversation]);

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        loading,
        conversationLoading,
        error,
        loadConversations,
        selectConversation,
        startNewConversation,
        createConversation,
        renameConversation,
        togglePin,
        deleteConversation,
        saveBattleMessage,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversations must be used within a ConversationProvider");
  }
  return context;
}
