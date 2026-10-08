# Convex setup

Convex powers the Battle tab: nickname-only two-player rooms, 10 scenario
questions, server-enforced 60-second deadlines, answer reveals, and weekly and
all-time leaderboards. Existing solo quizzes and scores still use browser
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

- A host occupies Side 1; joining occupies Side 2. Both must press Ready.
- Both players see the same shuffled options. Both must press Next after reveal.
- A correct answer earns 1 point, with no speed bonus. Missing answers earn 0.
- Only completed matches count. Leaving a running match cancels it for both.
- Rooms expire after 2 hours. Reloading resumes the room in the same browser.
- Nicknames and leaderboard totals are public; browser identity tokens are not.
- Nicknames are unverified and can be duplicated. This is a casual leaderboard,
  not a competition-grade identity or anti-cheat system. Clearing storage creates
  a new profile. Never share the browser identity token.
- Weekly standings reset on Monday at 00:00 UTC. Historical weeks remain stored.

Run `npm test` for backend tests. Development test matches are separate from
production standings.

See the [Convex Next.js setup](https://docs.convex.dev/quickstart/nextjs) and
[Vercel hosting guide](https://docs.convex.dev/production/hosting/vercel).
