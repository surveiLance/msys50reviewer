import { query } from "./_generated/server";

/** Read-only connection check; no player data or authentication required. */
export const status = query({
  args: {},
  handler: () => ({ service: "MAGS", ready: true }),
});
