import { Suspense } from 'react';
import GuildSettingsContent from '@/components/GuildSettingsContent';

export default function GuildPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-discord-bg flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-discord-muted">
            <div className="h-8 w-8 rounded-full border-2 border-discord-blurple border-t-transparent animate-spin" />
            <p className="text-sm">読み込み中...</p>
          </div>
        </div>
      }
    >
      <GuildSettingsContent />
    </Suspense>
  );
}
