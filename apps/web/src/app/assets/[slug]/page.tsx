'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useAsset, useAssets } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { LoginModal } from '@/components/login-modal';
import { AddToCollectionModal } from '@/components/add-to-collection-modal';

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-900/50 text-green-300 border-green-800',
  INTERMEDIATE: 'bg-yellow-900/50 text-yellow-300 border-yellow-800',
  ADVANCED: 'bg-red-900/50 text-red-300 border-red-800',
};

type Tab = 'versions' | 'howto' | 'breakdown';

export default function AssetDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: asset, isLoading } = useAsset(slug);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('versions');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Related assets (same category)
  const { data: related } = useAssets({
    category: asset?.category,
    pageSize: 5,
    page: 1,
  });
  const relatedAssets = related?.items.filter((a) => a.slug !== slug).slice(0, 4) ?? [];

  // Track VIEW_ASSET event
  useEffect(() => {
    if (asset?.id) {
      api('/events', {
        method: 'POST',
        body: JSON.stringify({ type: 'VIEW_ASSET', payload: { assetId: asset.id } }),
      }).catch(() => {});
    }
  }, [asset?.id]);

  async function handleDownload(versionId: string) {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setDownloading(versionId);
    try {
      const data = await api<{ url: string; expiresInSec: number }>(
        `/assets/${slug}/versions/${versionId}/download`,
        { method: 'POST' },
      );
      window.open(data.url, '_blank');
    } catch {
      // error handled by api client
    } finally {
      setDownloading(null);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 rounded-lg bg-gray-800" />
          <div className="h-8 w-1/2 rounded bg-gray-800" />
          <div className="h-4 w-3/4 rounded bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Asset not found</h1>
        <Link href="/assets" className="mt-4 inline-block text-sm text-gray-400 hover:text-white">
          Back to catalog
        </Link>
      </div>
    );
  }

  const latestVersion = asset.versions[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero preview */}
      <div className="mb-6 rounded-lg bg-gray-800 h-72 flex items-center justify-center">
        {asset.previews.length > 0 ? (
          <span className="font-mono text-sm text-gray-500">Preview: {asset.previews[0].url}</span>
        ) : (
          <span className="font-mono text-sm text-gray-600 uppercase">{asset.category}</span>
        )}
      </div>

      {/* Title + badges */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{asset.title}</h1>
            <p className="mt-2 text-gray-400">{asset.summary}</p>
          </div>
          <button
            onClick={() => {
              if (!user) { setShowLoginModal(true); return; }
              setShowCollectionModal(true);
            }}
            className="shrink-0 rounded border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-gray-800 px-2 py-1 font-mono text-xs text-gray-400">
            {asset.category}
          </span>
          <span className={`rounded border px-2 py-1 text-xs ${DIFFICULTY_COLORS[asset.difficulty] ?? ''}`}>
            {asset.difficulty}
          </span>
          {asset.tags.map((tag) => (
            <span key={tag.id} className="text-xs text-gray-500">#{tag.name}</span>
          ))}
        </div>
      </div>

      {/* Quick facts */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded border border-gray-800 bg-gray-900 p-3">
          <p className="text-xs text-gray-500 font-mono">Houdini</p>
          <p className="text-sm font-medium">
            {latestVersion ? `${latestVersion.houdiniMin}${latestVersion.houdiniMax ? ` – ${latestVersion.houdiniMax}` : '+'}` : '—'}
          </p>
        </div>
        <div className="rounded border border-gray-800 bg-gray-900 p-3">
          <p className="text-xs text-gray-500 font-mono">Renderer</p>
          <p className="text-sm font-medium">{latestVersion?.renderer ?? '—'}</p>
        </div>
        <div className="rounded border border-gray-800 bg-gray-900 p-3">
          <p className="text-xs text-gray-500 font-mono">Downloads</p>
          <p className="text-sm font-medium">{asset.downloadCount}</p>
        </div>
        <div className="rounded border border-gray-800 bg-gray-900 p-3">
          <p className="text-xs text-gray-500 font-mono">Published</p>
          <p className="text-sm font-medium">
            {asset.publishedAt ? new Date(asset.publishedAt).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-800">
        {(['versions', 'howto', 'breakdown'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-white text-white'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'versions' ? 'Versions' : tab === 'howto' ? 'How to Use' : 'Breakdown'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'versions' && (
        <div className="space-y-3">
          {asset.versions.length === 0 ? (
            <p className="text-gray-500 text-sm">No versions available</p>
          ) : (
            asset.versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between rounded border border-gray-800 bg-gray-900 p-4"
              >
                <div>
                  <p className="font-medium">v{version.versionString}</p>
                  <p className="text-xs text-gray-500">
                    Houdini {version.houdiniMin}{version.houdiniMax ? ` – ${version.houdiniMax}` : '+'} &middot;{' '}
                    {version.renderer} &middot; {version.os} &middot;{' '}
                    {(version.fileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {version.notesMd && (
                    <p className="mt-1 text-xs text-gray-400">{version.notesMd}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDownload(version.id)}
                  disabled={downloading === version.id}
                  className="shrink-0 rounded bg-white px-4 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {downloading === version.id ? 'Downloading...' : 'Download'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'howto' && (
        <div className="prose prose-invert prose-sm max-w-none">
          {asset.howToMd ? (
            <ReactMarkdown>{asset.howToMd}</ReactMarkdown>
          ) : (
            <p className="text-gray-500">No usage guide available</p>
          )}
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div className="prose prose-invert prose-sm max-w-none">
          {asset.breakdownMd ? (
            <ReactMarkdown>{asset.breakdownMd}</ReactMarkdown>
          ) : (
            <p className="text-gray-500">No breakdown available</p>
          )}
        </div>
      )}

      {/* Related assets */}
      {relatedAssets.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold mb-4">Related Assets</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedAssets.map((a) => (
              <Link
                key={a.id}
                href={`/assets/${a.slug}`}
                className="rounded-lg border border-gray-800 bg-gray-900 p-4 hover:border-gray-600 transition-colors"
              >
                <h3 className="font-medium text-white line-clamp-1">{a.title}</h3>
                <p className="mt-1 text-xs text-gray-400 line-clamp-2">{a.summary}</p>
                <p className="mt-2 text-xs text-gray-500">{a.downloadCount} downloads</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Login modal */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {showCollectionModal && asset && (
        <AddToCollectionModal
          assetId={asset.id}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </div>
  );
}
