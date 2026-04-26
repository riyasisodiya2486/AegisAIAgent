import { NavBar } from "./NavBar";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="container max-w-screen-xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}