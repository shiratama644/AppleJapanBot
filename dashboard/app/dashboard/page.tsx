'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Server } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { getMe, getGuilds } from '@/lib/api';
import type { DashboardUser, Guild } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setUser(me);
        const gs = await getGuilds();
        setGuilds(gs);
      } catch {
        router.replace('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <div className="min-h-screen bg-discord-bg">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-2xl font-bold text-white">サーバー一覧</h1>
          <p className="mt-1 text-discord-muted text-sm">
            Botが参加しており、あなたが管理権限を持つサーバーです。
          </p>
        </div>

        {loading ? (
          <GuildSkeleton />
        ) : guilds.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
            {guilds.map(guild => (
              <GuildCard key={guild.id} guild={guild} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function GuildCard({ guild }: { guild: Guild }) {
  return (
    <Link
      href={`/guild?id=${encodeURIComponent(guild.id)}`}
      className="group flex items-center gap-4 rounded-2xl bg-discord-card border border-discord-border/50 p-5 transition-all duration-200 hover:bg-discord-card-hover hover:border-discord-blurple/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
    >
      {guild.icon ? (
        <Image
          src={guild.icon}
          alt={guild.name}
          width={52}
          height={52}
          className="rounded-full shrink-0"
          unoptimized
        />
      ) : (
        <GuildIconPlaceholder name={guild.name} />
      )}

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white truncate">{guild.name}</p>
        <p className="text-xs text-discord-muted mt-0.5 font-mono truncate">{guild.id}</p>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-discord-border group-hover:text-discord-blurple transition-colors"
      />
    </Link>
  );
}

function GuildIconPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-discord-blurple text-white font-bold text-xl">
      {name[0]?.toUpperCase() ?? <Server size={22} />}
    </div>
  );
}

function GuildSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-discord-card border border-discord-border/50 p-5">
          <div className="skeleton h-[52px] w-[52px] rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3 rounded-lg" />
            <div className="skeleton h-3 w-1/2 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-discord-card border border-discord-border mb-5">
        <Server size={36} className="text-discord-muted" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">サーバーが見つかりません</h2>
      <p className="text-discord-muted text-sm max-w-xs">
        Botを招待し、サーバーの管理権限があることを確認してから再度お試しください。
      </p>
    </div>
  );
}
