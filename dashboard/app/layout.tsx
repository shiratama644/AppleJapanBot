import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'AppleJapanBot Dashboard',
  description: 'AppleJapanBot の設定管理ダッシュボード',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: 'bg-discord-card border border-discord-border text-discord-text rounded-xl shadow-2xl',
              success: '!border-discord-green',
              error: '!border-discord-red',
            },
          }}
        />
      </body>
    </html>
  );
}
