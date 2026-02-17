'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useCollection } from '@/lib/hooks';
import { api } from '@/lib/api';
import { AuthGuard } from '@/components/auth-guard';

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-900/50 text-green-300 border-green-800',
  INTERMEDIATE: 'bg-yellow-900/50 text-yellow-300 border-yellow-800',
  ADVANCED: 'bg-red-900/50 text-red-300 border-red-800',
};

export default function CollectionPage() {
  return (
    <AuthGuard>
      <CollectionContent />
    </AuthGuard>
  );
}

function CollectionContent() {
  const params = useParams();
  const id = params.id as string;
  const { data: collection, isLoading } = useCollection(id);
  const queryClient = useQueryClient();

  async function handleRemove(assetId: string) {
    try {
      await api(`/collections/${id}/items/${assetId}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['collection', id] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    } catch {
      // handled by api client
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-800" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Collection not found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/me" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
        &larr; Back to profile
      </Link>

      <h1 className="text-2xl font-bold mb-6">{collection.title}</h1>

      {collection.items.length === 0 ? (
        <p className="text-center text-gray-500 py-12">
          No assets in this collection.{' '}
          <Link href="/assets" className="text-white hover:underline">
            Browse catalog
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collection.items.map((asset) => (
            <div
              key={asset.id}
              className="rounded-lg border border-gray-800 bg-gray-900 overflow-hidden"
            >
              <Link href={`/assets/${asset.slug}`}>
                <div className="h-32 bg-gray-800 flex items-center justify-center">
                  <span className="font-mono text-xs text-gray-600 uppercase">
                    {asset.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white line-clamp-1">{asset.title}</h3>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{asset.summary}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-gray-800 px-2 py-0.5 font-mono text-xs text-gray-400">
                      {asset.category}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-xs ${DIFFICULTY_COLORS[asset.difficulty] ?? ''}`}
                    >
                      {asset.difficulty}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="border-t border-gray-800 px-4 py-2">
                <button
                  onClick={() => handleRemove(asset.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove from collection
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
