'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AdminGuard } from '@/components/admin-guard';
import { AssetForm, type AssetFormData } from '@/components/asset-form';

const RENDERERS = ['MANTRA', 'KARMA', 'REDSHIFT', 'OCTANE', 'ARNOLD', 'VRAY', 'NONE'];
const OS_OPTIONS = ['WINDOWS', 'LINUX', 'MACOS', 'ANY'];

interface AssetDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  descriptionMd: string | null;
  howToMd: string | null;
  breakdownMd: string | null;
  category: string;
  difficulty: string;
  status: string;
  tags: { id: string; name: string; kind: string }[];
  previews: { id: string; type: string; url: string; sortOrder: number }[];
  versions: {
    id: string;
    versionString: string;
    houdiniMin: string;
    houdiniMax: string | null;
    renderer: string;
    os: string;
    notesMd: string | null;
    fileSize: number;
    createdAt: string;
  }[];
}

export default function EditAssetPage() {
  return (
    <AdminGuard>
      <EditAssetContent />
    </AdminGuard>
  );
}

function EditAssetContent() {
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: assetData } = useQuery({
    queryKey: ['admin-asset-detail', id],
    queryFn: async () => {
      const list = await api<{ items: { id: string; slug: string }[] }>('/assets?pageSize=100');
      const found = list.items.find((a) => a.id === id);
      if (!found) return null;
      return api<AssetDetail>(`/assets/${found.slug}`);
    },
  });

  async function handleUpdate(data: AssetFormData) {
    await api(`/admin/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    queryClient.invalidateQueries({ queryKey: ['admin-asset-detail', id] });
  }

  async function handlePublish() {
    await api(`/admin/assets/${id}/publish`, { method: 'POST' });
    queryClient.invalidateQueries({ queryKey: ['admin-asset-detail', id] });
  }

  async function handleUnpublish() {
    await api(`/admin/assets/${id}/unpublish`, { method: 'POST' });
    queryClient.invalidateQueries({ queryKey: ['admin-asset-detail', id] });
  }

  if (!assetData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-800" />
          <div className="h-64 rounded bg-gray-800" />
        </div>
      </div>
    );
  }

  const initial: Partial<AssetFormData> = {
    title: assetData.title,
    summary: assetData.summary,
    category: assetData.category,
    difficulty: assetData.difficulty,
    descriptionMd: assetData.descriptionMd ?? '',
    howToMd: assetData.howToMd ?? '',
    breakdownMd: assetData.breakdownMd ?? '',
    tagIds: assetData.tags.map((t) => t.id),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit: {assetData.title}</h1>
        <div className="flex gap-2">
          {assetData.status === 'PUBLISHED' ? (
            <button
              onClick={handleUnpublish}
              className="rounded border border-yellow-700 px-3 py-1.5 text-sm text-yellow-400 hover:bg-gray-800 transition-colors"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={handlePublish}
              className="rounded bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-600 transition-colors"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <AssetForm initial={initial} onSubmit={handleUpdate} submitLabel="Update Asset" />

      {/* Upload Previews */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold mb-4">Previews</h2>
        <PreviewUpload assetId={id} previews={assetData.previews} />
      </section>

      {/* Upload Versions */}
      <section className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold mb-4">Versions</h2>
        <VersionUpload assetId={id} versions={assetData.versions} />
      </section>
    </div>
  );
}

function PreviewUpload({
  assetId,
  previews,
}: {
  assetId: string;
  previews: AssetDetail['previews'];
}) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setUploading(true);
    try {
      await api(`/admin/assets/${assetId}/previews`, {
        method: 'POST',
        body: formData,
        headers: {},
      });
      queryClient.invalidateQueries({ queryKey: ['admin-asset-detail', assetId] });
      e.currentTarget.reset();
    } catch {
      // handled by api
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {previews.length > 0 && (
        <div className="mb-4 space-y-2">
          {previews.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded border border-gray-800 bg-gray-900 px-4 py-2 text-sm"
            >
              <span>
                <span className="font-mono text-xs text-gray-400">{p.type}</span>{' '}
                <span className="text-gray-300">{p.url}</span>{' '}
                <span className="text-xs text-gray-500">order: {p.sortOrder}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleUpload} className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="mb-1 block text-xs text-gray-400">File</label>
          <input
            type="file"
            name="file"
            required
            accept="image/*,video/*,.gif"
            className="text-sm text-gray-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Type</label>
          <select
            name="type"
            className="rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-white"
          >
            <option value="IMAGE">IMAGE</option>
            <option value="VIDEO">VIDEO</option>
            <option value="GIF">GIF</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue="0"
            className="w-16 rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-gray-950 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Preview'}
        </button>
      </form>
    </div>
  );
}

function VersionUpload({
  assetId,
  versions,
}: {
  assetId: string;
  versions: AssetDetail['versions'];
}) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setUploading(true);
    try {
      await api(`/admin/assets/${assetId}/versions`, {
        method: 'POST',
        body: formData,
        headers: {},
      });
      queryClient.invalidateQueries({ queryKey: ['admin-asset-detail', assetId] });
      e.currentTarget.reset();
    } catch {
      // handled by api
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {versions.length > 0 && (
        <div className="mb-4 space-y-2">
          {versions.map((v) => (
            <div
              key={v.id}
              className="rounded border border-gray-800 bg-gray-900 px-4 py-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">v{v.versionString}</span>
                <span className="text-xs text-gray-500">
                  {(v.fileSize / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Houdini {v.houdiniMin}
                {v.houdiniMax ? `–${v.houdiniMax}` : '+'} &middot; {v.renderer} &middot; {v.os}
              </p>
              {v.notesMd && <p className="text-xs text-gray-500 mt-1">{v.notesMd}</p>}
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleUpload} className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Zip File</label>
            <input
              type="file"
              name="file"
              required
              accept=".zip"
              className="text-sm text-gray-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Version</label>
            <input
              type="text"
              name="versionString"
              required
              placeholder="1.0"
              className="w-full rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Houdini Min</label>
            <input
              type="text"
              name="houdiniMin"
              required
              placeholder="20.0"
              className="w-full rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Houdini Max</label>
            <input
              type="text"
              name="houdiniMax"
              placeholder="20.5"
              className="w-full rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Renderer</label>
            <select
              name="renderer"
              className="w-full rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-white"
            >
              {RENDERERS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">OS</label>
            <select
              name="os"
              className="w-full rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-white"
            >
              {OS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Notes (Markdown)</label>
          <textarea
            name="notesMd"
            rows={2}
            className="w-full rounded border border-gray-700 bg-gray-900 px-2 py-1.5 text-sm text-white font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded bg-white px-3 py-1.5 text-sm font-medium text-gray-950 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Uploading...' : 'Upload Version'}
        </button>
      </form>
    </div>
  );
}
