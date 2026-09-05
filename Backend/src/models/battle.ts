const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

/**
 * @typedef {{ solution_1_score: number; solution_2_score: number; solution_1_reasoning: string; solution_2_reasoning: string; winner: string; verdict: string }} JudgeResult
 */

/**
 * @typedef {{ _id: unknown; problem: string; solution_1: string; solution_2: string; judge: JudgeResult; status: 'pending' | 'in_progress' | 'completed' | 'failed'; metadata: Record<string, unknown>; createdAt: Date; updatedAt: Date; }} BattleDocument
 */

const JudgeSchema = new Schema(
  {
    solution_1_score: { type: Number, required: true, default: 0, min: 0, max: 10 },
    solution_2_score: { type: Number, required: true, default: 0, min: 0, max: 10 },
    solution_1_reasoning: { type: String, required: true, default: '' },
    solution_2_reasoning: { type: String, required: true, default: '' },
    winner: { type: String, required: true, default: 'Tie', trim: true },
    verdict: { type: String, required: true, default: '' },
  },
  { _id: false }
);

const battleSchema = new Schema(
  {
    problem: { type: String, required: true, trim: true },
    solution_1: { type: String, required: true },
    solution_2: { type: String, required: true },
    judge: { type: JudgeSchema, required: true, default: () => ({}) },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      required: true,
      default: 'pending',
      index: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

const Battle = models.Battle || model('Battle', battleSchema);

module.exports = Battle;
