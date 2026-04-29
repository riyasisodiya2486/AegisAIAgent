"use client";

import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { ActivityFeed } from "@/components/feed/ActivityFeed";

export default function ActivityPage() {
  return (
    <PageShell>
      <ConnectGuard>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Agent Activity
            </h1>
            <p className="text-sm text-white/40 mt-2 max-w-2xl leading-relaxed">
              Real-time log of all agent transactions and runs. 
              Updates live via WebSocket when the agent is running.
            </p>
          </div>

          {/* Activity Feed Container */}
          <div className="min-h-[600px] h-[calc(100vh-280px)]">
            <ActivityFeed />
          </div>
        </div>
      </ConnectGuard>
    </PageShell>
  );
}