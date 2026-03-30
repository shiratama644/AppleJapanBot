'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut, ChevronRight } from 'lucide-react';
import type { DashboardUser } from '@/lib/types';

interface NavbarProps {
  user: DashboardUser | null;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function Navbar({ user, breadcrumbs }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-discord-sidebar/95 backdrop-blur border-b border-discord-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* ロゴ */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 font-bold text-white hover:opacity-80 transition-opacity shrink-0"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-discord-blurple text-lg">
            🤖
          </span>
          <span className="hidden sm:inline text-sm">AppleJapanBot</span>
        </Link>

        {/* パンくずリスト */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm overflow-hidden">
            <ChevronRight size={14} className="text-discord-border shrink-0" />
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight size={14} className="text-discord-border shrink-0" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-discord-muted hover:text-discord-text transition-colors truncate"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-discord-text font-medium truncate">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* ユーザー情報 + ログアウト */}
        <div className="ml-auto flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <Image
                src={user.avatar}
                alt={user.username}
                width={28}
                height={28}
                className="rounded-full"
                unoptimized
              />
              <span className="hidden sm:inline text-discord-muted font-medium">
                {user.username}
              </span>
            </div>
          )}
          <a
            href="/auth/logout"
            className="flex items-center gap-1.5 text-discord-muted hover:text-discord-red transition-colors text-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">ログアウト</span>
          </a>
        </div>
      </div>
    </header>
  );
}
