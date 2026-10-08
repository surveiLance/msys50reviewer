# Convex setup

Convex is connected for development. Existing quizzes and scores still use
browser storage; multiplayer battles and a leaderboard are not implemented yet.
No player sign-in has been added.

## Local development

Run `npm run convex:dev` alongside `npm run dev`. The Convex CLI manages the
deployment settings in `.env.local`, which must not be committed.

To check the backend connection, run `npx convex run health:status`.

## Production on Vercel

Deploy the backend with `npm run convex:deploy`. Set `NEXT_PUBLIC_CONVEX_URL`
in Vercel to the **production** deployment URL shown in the Convex dashboard,
then redeploy the Next.js app. Do not use the development deployment URL for
the public site. Until that variable is configured, the existing study site
continues working without a Convex connection.

See the [Convex Next.js setup](https://docs.convex.dev/quickstart/nextjs) and
[Vercel hosting guide](https://docs.convex.dev/production/hosting/vercel).
