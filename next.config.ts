import type { NextConfig } from "next";

const repo = "kairsvp"; // your GitHub repo name

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? `/${repo}` : "",
  assetPrefix: process.env.NODE_ENV === "production" ? `/${repo}/` : "",
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;