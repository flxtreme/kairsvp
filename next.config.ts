import type { NextConfig } from "next";

const repo = "kairsvp"; // your GitHub repo name


const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === "production" ? `/${repo}` : "",
  assetPrefix: process.env.NODE_ENV === "production" ? `/${repo}/` : "",
  images: {
    unoptimized: true, // required for static export
  },
  /* config options here */
  allowedDevOrigins: [
    "*.ngrok.io",
    "*.ngrok-free.app",
    "*.ngrok.app",
   "jacalyn-performative-unhypothetically.ngrok-free.dev"
  ],
};

export default nextConfig;
