/** @type {import('next').NextConfig} */
const nextConfig = {
  // Notes HTML is read from /content at build time.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
  // Old test URLs (before the single Test tab) keep working.
  async redirects() {
    return [
      { source: "/:subject/scores", destination: "/:subject/test/scores", permanent: true },
      { source: "/:subject/:module/test", destination: "/:subject/test/:module", permanent: true },
      { source: "/:subject/midterm", destination: "/:subject/test/midterm", permanent: true },
    ];
  },
};
export default nextConfig;
