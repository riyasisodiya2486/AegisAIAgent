import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/providers/WalletProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aegis — Secure AI Agent Vaults",
  description: "Secure, yield-bearing on-chain vaults for AI agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SolanaWalletProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </SolanaWalletProvider>
      </body>
    </html>
  );
}