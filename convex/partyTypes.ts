import { v } from "convex/values";

export const questionType = v.union(v.literal("scenario"), v.literal("mc"), v.literal("tf2"), v.literal("tf"), v.literal("multi"), v.literal("blank"), v.literal("match"));
export const modeType = v.union(v.literal("mixed"), v.literal("M1"), v.literal("M2"), v.literal("M3"));
export const answerType = v.union(v.string(), v.array(v.string()));
export const settingsType = v.object({ mode: modeType, types: v.array(questionType), count: v.number(), seconds: v.number(), capacity: v.number(), moduleCounts: v.optional(v.object({ M1: v.optional(v.number()), M2: v.optional(v.number()), M3: v.optional(v.number()) })) });
export const questionShape = v.object({
  kind: questionType, module: v.string(), prompt: v.string(), options: v.array(v.string()),
  correct: v.array(v.string()), accept: v.array(v.string()), rows: v.array(v.string()), explanation: v.string(), source: v.string(),
});
export const submissionShape = v.object({ answer: answerType, at: v.number(), correct: v.boolean(), points: v.number() });
