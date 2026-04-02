'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Server, Settings, Shield } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE}/api/me`)
      .then(r => { if (r.ok) router.replace('/dashboard'); })
      .catch(err => { console.debug('[auth check]', err); });
  }, [router]);

  return (
    <div className="min-h-screen bg-discord-bg flex flex-col">
      {/* 背景グラデーション */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-gradient-to-br from-discord-blurple/10 via-transparent to-discord-green/5"
      />

      <main className="relative flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fadeIn">
          {/* ヒーローセクション */}
          <div className="text-center mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-discord-blurple shadow-lg shadow-discord-blurple/30 text-4xl mb-5">
              🤖
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              AppleJapanBot
            </h1>
            <p className="text-discord-muted text-base">
              サーバーの設定を管理するダッシュボード
            </p>
          </div>

          {/* ログインカード */}
          <div className="bg-discord-card rounded-2xl p-7 shadow-2xl border border-discord-border/50">
            <a
              href={`${API_BASE}/auth/login`}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-discord-blurple px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-discord-blurple/25 transition-all duration-200 hover:bg-discord-blurple-dark hover:-translate-y-0.5 hover:shadow-lg hover:shadow-discord-blurple/30 active:translate-y-0"
            >
              <DiscordLogo />
              Discordでログイン
            </a>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {features.map(f => (
                <div
                  key={f.label}
                  className="flex flex-col items-center gap-2 rounded-xl bg-discord-bg/60 p-3.5 text-center"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-discord-blurple/10 text-discord-blurple">
                    <f.Icon size={18} />
                  </div>
                  <p className="text-xs font-medium text-discord-muted leading-snug">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative text-center pb-8 text-discord-muted text-xs">
        © AppleJapanBot Dashboard
      </footer>
    </div>
  );
}

const features = [
  { Icon: Settings, label: 'チャンネル設定' },
  { Icon: Server, label: 'サーバー管理' },
  { Icon: Shield, label: '安全な認証' },
] as const;

function DiscordLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}
