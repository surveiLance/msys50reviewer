import { query } from "./_generated/server";

// Public summaries deliberately contain no questions, answers, tokens, or join requests.
export const ongoing = query({
  args: {},
  handler: async ctx => {
    const groups = await Promise.all((["question", "reveal"] as const).map(phase =>
      ctx.db.query("parties").withIndex("by_phase", q => q.eq("phase", phase)).order("desc").take(25)));
    return Promise.all(groups.flat().filter(p => p.expiresAt > Date.now()).sort((a, b) => b._creationTime - a._creationTime).slice(0, 25).map(async p => {
      const members = await ctx.db.query("partyMembers").withIndex("by_party", q => q.eq("party", p._id)).collect();
      return { id: p._id, title: p.title, round: p.index + 1, total: p.questions.length,
        betweenQuestions: p.phase === "reveal", scoring: p.settings.scoring,
        players: members.filter(m => m.status === "approved").map(m => ({ name: m.name, score: m.score })) };
    }));
  },
});

export const history = query({
  args: {},
  handler: async ctx => {
    const parties = await ctx.db.query("parties").withIndex("by_phase_completed", q => q.eq("phase", "finished")).order("desc").take(30);
    return Promise.all(parties.map(async p => {
      const members = (await ctx.db.query("partyMembers").withIndex("by_party", q => q.eq("party", p._id)).collect()).filter(m => m.participated);
      const active = members.filter(m => m.status === "approved");
      const highest = Math.max(...active.map(m => m.score));
      const winners = active.filter(m => m.score === highest).map(m => m.name);
      return { id: p._id, title: p.title, completedAt: p.completedAt ?? null, total: p.questions.length,
        scoring: p.settings.scoring, winners, resultsHidden: p.settings.showPlayerResults === false,
        players: members.sort((a, b) => Number(a.status === "left") - Number(b.status === "left") || b.score - a.score || a.name.localeCompare(b.name)).map(m => {
          const submitted = m.answers.filter(a => Array.isArray(a.answer) ? a.answer.length > 0 : !!a.answer);
          const timed = submitted.filter(a => a.responseMs !== undefined);
          return { name: m.name, score: m.score, left: m.status === "left",
            rank: m.status === "left" ? null : 1 + active.filter(other => other.score > m.score).length,
            stats: p.settings.showPlayerResults === false ? null : {
              correct: submitted.filter(a => a.correct).length,
              wrong: submitted.filter(a => !a.correct).length,
              unanswered: p.questions.length - submitted.length,
              averageMs: timed.length === submitted.length && timed.length > 0 ? timed.reduce((sum, a) => sum + a.responseMs!, 0) / timed.length : null,
            } };
        }) };
    }));
  },
});
