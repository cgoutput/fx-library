'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AdminGuard } from '@/components/admin-guard';
import type { AssetListResponse } from '@fx-library/shared';

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}

function DashboardContent() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const all = await api<AssetListResponse>('/assets?pageSize=1&sort=new');
      const published = all.total;
      return { total: published, published, downloads: 0 };
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link
          href="/admin/assets"
          className="rounded bg-white px-4 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200 transition-colors"
        >
          Manage Assets
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <p className="text-xs text-gray-500 font-mono uppercase">Total Assets</p>
          <p className="mt-2 text-3xl font-bold">{data?.total ?? '—'}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <p className="text-xs text-gray-500 font-mono uppercase">Published</p>
          <p className="mt-2 text-3xl font-bold">{data?.published ?? '—'}</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <p className="text-xs text-gray-500 font-mono uppercase">Total Downloads</p>
          <p className="mt-2 text-3xl font-bold">{data?.downloads ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
