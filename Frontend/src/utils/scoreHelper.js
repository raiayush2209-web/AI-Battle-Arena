export const getScoreColor = (score) => {
  if (score >= 8) return "text-emerald-400";
  if (score >= 5) return "text-yellow-400";
  return "text-red-400";
};

export const getScoreRing = (score) => {
  if (score >= 8) return "ring-emerald-500/40";
  if (score >= 5) return "ring-yellow-500/40";
  return "ring-red-500/40";
};
