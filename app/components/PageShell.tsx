import { ReactNode } from "react";
import { DisclaimerFooter } from "./DisclaimerFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    /* flex-col + min-h-screen ensures the footer stays at the bottom */
    <div className="flex flex-col min-h-screen bg-[#030303] text-white selection:bg-violet-500/30">
      
      {/* Main Content Area */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          {children}
        </div>
      </main>

      {/* Legal & Compliance Footer */}
      <DisclaimerFooter />
      
    </div>
  );
}