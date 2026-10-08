import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { settingsType, questionShape, submissionShape } from "./partyTypes";

export default defineSchema({
  parties: defineTable({
    host: v.id("players"), title: v.string(), settings: settingsType,
    phase: v.union(v.literal("lobby"), v.literal("question"), v.literal("reveal"), v.literal("finished"), v.literal("cancelled")),
    questions: v.array(questionShape), index: v.number(), startedAt: v.number(), deadline: v.number(), expiresAt: v.number(),
    revision: v.number(),
  }).index("by_phase", ["phase"]).index("by_host", ["host"]),
  partyMembers: defineTable({
    party: v.id("parties"), player: v.id("players"), name: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("left")),
    ready: v.boolean(), score: v.number(), answers: v.array(submissionShape), participated: v.boolean(),
  }).index("by_party", ["party"]).index("by_party_player", ["party", "player"]).index("by_player", ["player"]),
  players: defineTable({ token: v.string(), name: v.string(), nameKey: v.optional(v.string()), lastRoomAt: v.number() }).index("by_token", ["token"]).index("by_name", ["nameKey"]),
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
