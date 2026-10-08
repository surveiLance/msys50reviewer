import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  players: defineTable({ token: v.string(), name: v.string(), lastRoomAt: v.number() }).index("by_token", ["token"]),
  standings: defineTable({
    player: v.id("players"), period: v.string(), name: v.string(), wins: v.number(),
    draws: v.number(), matches: v.number(), correct: v.number(), answered: v.number(),
  }).index("by_player_period", ["player", "period"]).index("by_period_wins", ["period", "wins"]),
  rooms: defineTable({
    code: v.string(), owner: v.id("players"), guest: v.optional(v.id("players")),
    mode: v.string(), phase: v.union(v.literal("lobby"), v.literal("question"), v.literal("reveal"), v.literal("finished"), v.literal("cancelled")),
    questions: v.array(v.string()), index: v.number(), ownerReady: v.boolean(), guestReady: v.boolean(),
    ownerNext: v.boolean(), guestNext: v.boolean(), ownerAnswers: v.array(v.number()), guestAnswers: v.array(v.number()),
    // Shared shuffled option indices, generated on the server for each question.
    orders: v.array(v.array(v.number())), deadline: v.number(), expiresAt: v.number(),
  }).index("by_code", ["code"]).index("by_owner", ["owner"]).index("by_guest", ["guest"]),
});
