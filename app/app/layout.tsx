import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/providers/WalletProvider";
import { Toaster } from "sonner";
import { TermsBanner } from "@/components/TermsBanner";

const font = Space_Grotesk({ subsets: ["latin"], weight: ["400","500","600","700"] });

export const metadata: Metadata = {
  title: "Aegis — AI Agent Vaults on Solana",
  description: "Secure, yield-bearing smart contract vaults for autonomous AI agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} bg-[#0a0a0f] text-white antialiased`}>
        <SolanaWalletProvider>
          {children}
          
          {/* Global UI Components */}
          <TermsBanner />
          
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { 
                background: "#1a1a2e", 
                border: "1px solid #2a2a4a", 
                color: "#e2e8f0" 
              },
            }}
          />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}