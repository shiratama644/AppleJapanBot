'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Hash, ChevronDown, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { getMe, getGuildDetail, updateGuildConfig } from '@/lib/api';
import type { DashboardUser, GuildDetail, Channel } from '@/lib/types';

export default function GuildSettingsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const guildId = params.get('id');

  const [user, setUser] = useState<DashboardUser | null>(null);
  const [guild, setGuild] = useState<GuildDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!guildId) { router.replace('/dashboard'); return; }

    (async () => {
      try {
        const me = await getMe();
        setUser(me);
        const detail = await getGuildDetail(guildId);
        setGuild(detail);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'エラーが発生しました。';
        if (msg === 'Not authenticated') {
          router.replace('/');
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [guildId, router]);

  const handleSave = useCallback(
    async (key: string, value: string, label: string) => {
      if (!guildId || !value) {
        toast.error('チャンネルを選択してください。');
        return;
      }
      try {
        await updateGuildConfig(guildId, key, value);
        setGuild(prev =>
          prev ? { ...prev, config: { ...prev.config, [key]: value } } : prev,
        );
        toast.success(`✅ ${label} を保存しました。`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '保存に失敗しました。');
      }
    },
    [guildId],
  );

  const breadcrumbs = [
    { label: 'サーバー一覧', href: '/dashboard' },
    { label: guild?.name ?? 'サーバー設定' },
  ];

  return (
    <div className="min-h-screen bg-discord-bg">
      <Navbar user={user} breadcrumbs={breadcrumbs} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <SettingsSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : guild ? (
          <>
            {/* ページヘッダー */}
            <div className="flex items-center gap-4 mb-8 animate-fadeIn">
              {guild.icon ? (
                <Image
                  src={guild.icon}
                  alt={guild.name}
                  width={56}
                  height={56}
                  className="rounded-full"
                  unoptimized
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-discord-blurple text-white font-bold text-2xl">
                  {guild.name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{guild.name}</h1>
                <p className="text-discord-muted text-sm font-mono">{guild.id}</p>
              </div>
            </div>

            <div className="space-y-4 animate-fadeIn">
              <SettingsCard
                title="⌨️ コマンド受付チャンネル"
                description="スラッシュコマンドを受け付けるチャンネルを設定します。特権ロールを持たないユーザーはここで選択したチャンネル以外でコマンドを使用できなくなります。"
                configKey="command_input_channel"
                channels={guild.channels}
                currentValue={guild.config.command_input_channel ?? ''}
                onSave={v => handleSave('command_input_channel', v, 'コマンド受付チャンネル')}
              />

              <SettingsCard
                title="📋 連携リスト表示チャンネル"
                description="/link コマンドで登録された Minecraft プレイヤーの連携リストを表示するチャンネルを設定します。"
                configKey="link_list_channel"
                channels={guild.channels}
                currentValue={guild.config.link_list_channel ?? ''}
                onSave={v => handleSave('link_list_channel', v, '連携リスト表示チャンネル')}
              />
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

interface SettingsCardProps {
  title: string;
  description: string;
  configKey: string;
  channels: Channel[];
  currentValue: string;
  onSave: (value: string) => Promise<void>;
}

function SettingsCard({
  title,
  description,
  channels,
  currentValue,
  onSave,
}: SettingsCardProps) {
  const [selected, setSelected] = useState(currentValue);
  const [saving, setSaving] = useState(false);
  const isDirty = selected !== currentValue;

  const handleSave = async () => {
    setSaving(true);
    await onSave(selected);
    setSaving(false);
  };

  return (
    <div className="rounded-2xl bg-discord-card border border-discord-border/50 p-6">
      <h2 className="font-semibold text-white text-base mb-1">{title}</h2>
      <p className="text-discord-muted text-sm mb-5 leading-relaxed">{description}</p>

      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-discord-muted">
          チャンネルを選択
        </label>

        {channels.length === 0 ? (
          <p className="text-discord-muted text-sm py-2">
            テキストチャンネルが見つかりません。
          </p>
        ) : (
          <div className="relative">
            <Hash
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-discord-muted"
            />
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full appearance-none rounded-xl bg-discord-bg border border-discord-border pl-9 pr-10 py-2.5 text-sm text-discord-text focus:border-discord-blurple focus:ring-1 focus:ring-discord-blurple transition-colors cursor-pointer"
            >
              <option value="">未設定</option>
              {channels.map(ch => (
                <option key={ch.id} value={ch.id}>
                  #{ch.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-discord-muted"
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !selected || !isDirty}
            className="flex items-center gap-2 rounded-xl bg-discord-blurple px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-discord-blurple-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={14} />
            {saving ? '保存中...' : '保存する'}
          </button>

          {currentValue && (
            <span className="text-xs text-discord-muted">
              現在: <span className="font-mono text-discord-text">#{channels.find(c => c.id === currentValue)?.name ?? currentValue}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="skeleton h-14 w-14 rounded-full shrink-0" />
        <div className="space-y-2">
          <div className="skeleton h-6 w-40 rounded-lg" />
          <div className="skeleton h-3 w-28 rounded-lg" />
        </div>
      </div>
      {[...Array(2)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-discord-card border border-discord-border/50 p-6 space-y-4">
          <div className="skeleton h-5 w-48 rounded-lg" />
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-4 w-3/4 rounded-lg" />
          <div className="skeleton h-11 w-full rounded-xl" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-discord-red/10 border border-discord-red/30 mb-5">
        <AlertCircle size={32} className="text-discord-red" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">エラーが発生しました</h2>
      <p className="text-discord-muted text-sm">{message}</p>
      <a
        href="/dashboard"
        className="mt-5 text-discord-blurple text-sm hover:underline"
      >
        サーバー一覧に戻る
      </a>
    </div>
  );
}
