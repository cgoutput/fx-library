'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AdminGuard } from '@/components/admin-guard';

interface AdminAsset {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  downloadCount: number;
}

export default function AdminAssetsPage() {
  return (
    <AdminGuard>
      <AssetsListContent />
    </AdminGuard>
  );
}

function AssetsListContent() {
  const queryClient = useQueryClient();
  const { data: assets, isLoading } = useQuery({
    queryKey: ['admin-assets'],
    queryFn: async () => {
      // Fetch all assets (published) through public endpoint
      // In a real app, admin would have a dedicated list endpoint
      const res = await api<{ items: AdminAsset[] }>('/assets?pageSize=100&sort=new');
      return res.items;
    },
  });

  async function handlePublish(id: string) {
    await api(`/admin/assets/${id}/publish`, { method: 'POST' });
    queryClient.invalidateQueries({ queryKey: ['admin-assets'] });
  }

  async function handleUnpublish(id: string) {
    await api(`/admin/assets/${id}/unpublish`, { method: 'POST' });
    queryClient.invalidateQueries({ queryKey: ['admin-assets'] });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assets</h1>
        <Link
          href="/admin/assets/new"
          className="rounded bg-white px-4 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200 transition-colors"
        >
          New Asset
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase">
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Slug</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Downloads</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets?.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-800/50">
                  <td className="py-3 pr-4 font-medium">{asset.title}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{asset.slug}</td>
                  <td className="py-3 pr-4 text-xs">{asset.category}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        asset.status === 'PUBLISHED'
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {asset.status ?? 'PUBLISHED'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-400">{asset.downloadCount}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/assets/${asset.id}`}
                        className="rounded border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        Edit
                      </Link>
                      {asset.status === 'PUBLISHED' ? (
                        <button
                          onClick={() => handleUnpublish(asset.id)}
                          className="rounded border border-gray-700 px-2 py-1 text-xs text-yellow-400 hover:bg-gray-800 transition-colors"
                        >
                          Unpublish
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePublish(asset.id)}
                          className="rounded border border-gray-700 px-2 py-1 text-xs text-green-400 hover:bg-gray-800 transition-colors"
                        >
                          Publish
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!assets || assets.length === 0) && (
            <p className="text-center text-gray-500 py-8">No assets yet</p>
          )}
        </div>
      )}
    </div>
  );
}
