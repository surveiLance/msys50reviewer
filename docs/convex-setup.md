# Convex setup

Convex powers the Battle tab: nickname-only public parties for 2–12 players,
host approval and game settings, speed scoring, server-enforced deadlines,
answer reveals, and weekly and all-time leaderboards. Existing solo quizzes and scores still use browser
storage. No player sign-in is required.

## Local development

Run `npm run convex:dev` alongside `npm run dev`. The Convex CLI manages the
deployment settings in `.env.local`, which must not be committed.

To check the backend connection, run `npx convex run health:status`.

## Production on Vercel

Production backend: `https://impressive-wolf-858.convex.cloud`.
Vercel's Production `NEXT_PUBLIC_CONVEX_URL` is configured with that URL.
Frontend changes deploy from Git; backend changes must also be deployed with
`npm run convex:deploy` before shipping clients that depend on them.
An optional future CI setup can use a production Convex deploy key with the
Vercel build command in the linked hosting guide. No deploy keys are committed.

## Rules and privacy

- Register a nickname before discovering, creating, or requesting to join a party.
- Open parties appear on the Battle page without room codes. The host approves
  or declines requests and can remove players before starting. Declined or
  removed players may request again while the lobby is open; approval is still required.
- The host checks which Modules 1–3 to include and enters 1–20 questions per
  selected module. The total is automatic (up to 60); games draw those exact
  counts and exclude unchecked modules. Insufficient banks require lowering
  the module count or adding question types. Older lobbies remain compatible.
- The host also selects seven question types,
  30/60/90/120 seconds per question, and a capacity of 2–12 players.
- Approved players press Ready; only the host can Start or advance Next.
  Changing settings resets readiness. The roster locks when the game starts.
- Everyone gets the same shuffled choices. Answers are immutable once locked;
  answers and grading remain hidden until everyone locks or time expires.
- Scoring is chosen by the host before starting: every fully correct answer
  gets 1 point; fastest correct only gets 1 point (the default for old lobbies);
  or speed-ranked points, where a correct answer earns the active player count
  minus the number of earlier correct submissions (3/2/1 with three players).
  Exact server-timestamp ties get equal points. Incorrect, missing, or partially
  correct answers earn 0 in every mode. Settings cannot change mid-game.
  Server receipt time is authoritative, so network latency can affect close races.
- The final question ends the game automatically after all locks or timeout.
  Leaderboards rank only by game wins, with equal wins sharing a rank. Accuracy
  is not displayed; existing win totals are preserved.
- Only completed games count. Host departure cancels the game; other departures
  let the game continue if at least two players remain. Departed players cannot
  earn further points; they still receive a completed-game record if it finishes.
- Parties expire after 2 hours. Reloading resumes the party in the same browser.
- Nicknames and leaderboard totals are public; browser identity tokens are not.
- Nicknames are unverified and can be duplicated. This is a casual leaderboard,
  not a competition-grade identity or anti-cheat system. Clearing storage creates
  a new profile. Never share the browser identity token.
- Weekly standings reset on Monday at 00:00 UTC. Historical weeks remain stored.

Run `npm test` for backend tests. Development test matches are separate from
production standings.

Legacy `battle` room functions and data remain for compatibility with older
clients. New parties use `parties` and `partyMembers`; existing standings survive.

See the [Convex Next.js setup](https://docs.convex.dev/quickstart/nextjs) and
[Vercel hosting guide](https://docs.convex.dev/production/hosting/vercel).
