export function generateConversationTitle(input) {
  if (!input || typeof input !== "string") return "New Battle";
  const trimmed = input.trim();
  if (trimmed.length <= 40) return trimmed;
  return trimmed.slice(0, 40) + "...";
}
