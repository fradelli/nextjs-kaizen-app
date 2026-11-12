import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dieta", destination: "/nutrition", permanent: true },
      { source: "/treino/atividade/:id", destination: "/workout/activity/:id", permanent: true },
      { source: "/treino", destination: "/workout", permanent: true },
    ];
  },
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default createNextIntlPlugin()(nextConfig);
