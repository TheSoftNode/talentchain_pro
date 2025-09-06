import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
// Phase 1: Web3Auth Integration - Import proper provider following official examples
import { ProperWeb3AuthProvider } from "@/components/providers/ProperWeb3AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "TalentChain Pro | Blockchain Talent Ecosystem",
  description: "Advanced Web3 talent ecosystem built on Hedera Hashgraph. Create verifiable skill tokens, build reputation, and discover talent through AI-powered matching.",
  keywords: "blockchain, talent, skills, Hedera, Web3, reputation, soulbound tokens, AI matching",
  authors: [{ name: "TalentChain Pro Team" }],
  creator: "TalentChain Pro",
  publisher: "TalentChain Pro",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://talentchainpro.io",
    title: "TalentChain Pro | Blockchain Talent Ecosystem",
    description: "Advanced Web3 talent ecosystem built on Hedera Hashgraph",
    siteName: "TalentChain Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentChain Pro | Blockchain Talent Ecosystem",
    description: "Advanced Web3 talent ecosystem built on Hedera Hashgraph",
    creator: "@TalentChainPro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ProperWeb3AuthProvider>
            {children}
          </ProperWeb3AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
