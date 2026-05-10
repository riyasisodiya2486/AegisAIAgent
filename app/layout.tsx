import type { Metadata } from "next";
import "./globals.css";
import { SolanaWalletProvider } from "@/providers/WalletProvider";
import { Toaster } from "sonner";
import { TermsBanner } from "@/components/TermsBanner";
import { NavBar } from "@/components/NavBar";
import { Preloader } from "@/components/Preloader";



export const metadata: Metadata = {
  title: "Aegis — AI Agent Vaults on Solana",
  description: "Secure, yield-bearing smart contract vaults for autonomous AI agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0f] text-white antialiased">
        <SolanaWalletProvider>
          <Preloader />
          <div className="relative z-50">
            <NavBar />
          </div>
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