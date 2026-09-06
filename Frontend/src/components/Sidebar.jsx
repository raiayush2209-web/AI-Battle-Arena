import { useState, useMemo } from "react";
import { useConversations } from "../context/ConversationContext";
import ConversationItem from "./ConversationItem";

export default function Sidebar({ isOpen, onClose }) {
  const {
    conversations,
    currentConversation,
    loading,
    selectConversation,
    startNewConversation,
    renameConversation,
    togglePin,
    deleteConversation,
  } = useConversations();

  const [searchQuery, setSearchQuery] = useState("");

  // Categorize conversations
  const { pinnedList, todayList, previousList } = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? conversations.filter((c) => (c.title || "").toLowerCase().includes(query))
      : conversations;

    const pinned = [];
    const today = [];
    const previous = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    filtered.forEach((conv) => {
      if (conv.pinned) {
        pinned.push(conv);
      } else {
        const itemDate = new Date(conv.updatedAt || conv.createdAt).getTime();
        if (itemDate >= todayStart) {
          today.push(conv);
        } else {
          previous.push(conv);
        }
      }
    });

    return { pinnedList: pinned, todayList: today, previousList: previous };
  }, [conversations, searchQuery]);

  const handleSelect = (id) => {
    selectConversation(id);
    if (onClose) onClose();
  };

  const handleNewBattle = () => {
    startNewConversation();
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-gray-950/95 md:bg-gray-950/60 border-r border-gray-800/60 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Header: New Battle Button */}
        <div className="p-4 border-b border-gray-800/40 space-y-3">
          <div className="flex items-center justify-between md:hidden">
            <span className="text-sm font-semibold text-gray-300">History</span>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-200 rounded-lg"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewBattle}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600/90 to-cyan-600/90 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>+</span>
            <span>New Battle</span>
          </button>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search battles..."
              className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-gray-500">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {loading && conversations.length === 0 && (
            <div className="text-center py-6 text-xs text-gray-500">
              Loading conversations...
            </div>
          )}

          {!loading && conversations.length === 0 && (
            <div className="text-center py-8 px-4 text-xs text-gray-500">
              No battle history yet. Start a new fight to build your history!
            </div>
          )}

          {/* Pinned Section */}
          {pinnedList.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <span>📌</span>
                <span>Pinned</span>
              </div>
              {pinnedList.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isActive={currentConversation?._id === conv._id}
                  onSelect={handleSelect}
                  onRename={renameConversation}
                  onTogglePin={togglePin}
                  onDelete={deleteConversation}
                />
              ))}
            </div>
          )}

          {/* Today Section */}
          {todayList.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Today
              </div>
              {todayList.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isActive={currentConversation?._id === conv._id}
                  onSelect={handleSelect}
                  onRename={renameConversation}
                  onTogglePin={togglePin}
                  onDelete={deleteConversation}
                />
              ))}
            </div>
          )}

          {/* Previous Section */}
          {previousList.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Previous
              </div>
              {previousList.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isActive={currentConversation?._id === conv._id}
                  onSelect={handleSelect}
                  onRename={renameConversation}
                  onTogglePin={togglePin}
                  onDelete={deleteConversation}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
