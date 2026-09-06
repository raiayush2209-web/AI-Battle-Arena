import { useState } from "react";

export default function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(conversation.title || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isSavingRename, setIsSavingRename] = useState(false);

  const handleSaveRename = async (e) => {
    if (e) e.stopPropagation();
    if (!titleInput.trim() || titleInput.trim() === conversation.title) {
      setIsEditing(false);
      setTitleInput(conversation.title);
      return;
    }
    setIsSavingRename(true);
    try {
      await onRename(conversation._id, titleInput.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingRename(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTitleInput(conversation.title);
    }
  };

  const handlePin = async (e) => {
    e.stopPropagation();
    setIsPinning(true);
    try {
      await onTogglePin(conversation._id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPinning(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${conversation.title}"?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(conversation._id);
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 p-2 bg-gray-900 border border-purple-500/50 rounded-xl text-xs">
        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          disabled={isSavingRename}
          className="flex-1 bg-transparent text-gray-100 focus:outline-none text-xs"
        />
        <button
          onClick={handleSaveRename}
          disabled={isSavingRename}
          className="text-emerald-400 hover:text-emerald-300 p-1"
          title="Save"
        >
          ✓
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
            setTitleInput(conversation.title);
          }}
          className="text-gray-400 hover:text-gray-200 p-1"
          title="Cancel"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(conversation._id)}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
        isActive
          ? "bg-purple-950/40 text-purple-200 border border-purple-500/40 shadow-xs"
          : "text-gray-300 hover:bg-gray-900/60 hover:text-gray-100 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden mr-2">
        <span className="text-gray-500 shrink-0 text-xs">
          {conversation.pinned ? "📌" : "⚔️"}
        </span>
        <span className="truncate font-medium">{conversation.title || "Untitled Battle"}</span>
      </div>

      {/* Action Buttons */}
      <div className="hidden group-hover:flex items-center gap-1 shrink-0 bg-gray-950/80 px-1 py-0.5 rounded-lg border border-gray-800/80">
        {/* Pin / Unpin */}
        <button
          onClick={handlePin}
          disabled={isPinning}
          title={conversation.pinned ? "Unpin battle" : "Pin battle"}
          className="p-1 hover:text-purple-300 text-gray-400 text-xs transition"
        >
          {conversation.pinned ? "Unpin" : "Pin"}
        </button>

        {/* Rename */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          title="Rename battle"
          className="p-1 hover:text-cyan-300 text-gray-400 text-xs transition"
        >
          ✎
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete battle"
          className="p-1 hover:text-red-400 text-gray-400 text-xs transition"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
