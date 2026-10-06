/** @type {import('next').NextConfig} */
const nextConfig = {
  // Notes HTML is read from /content at build time.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};
export default nextConfig;
