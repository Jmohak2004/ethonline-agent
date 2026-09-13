import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gotrade — Your AI Trading Team",
  description: "Discover, subscribe to, and manage AI agents that research financial markets, track whales, and execute trades — all through WhatsApp. Powered by Web3, invisible to users.",
  keywords: "AI agents, DeFi, WhatsApp, crypto, automated trading, agent marketplace, Web3",
  authors: [{ name: "Gotrade" }],
  openGraph: {
    title: "Gotrade — Your AI Trading Team",
    description: "AI agents that work for you, paid in crypto, accessible via WhatsApp.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
