'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useCollections } from '@/lib/hooks';
import { api } from '@/lib/api';
import { AuthGuard } from '@/components/auth-guard';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const { data: collections, isLoading } = useCollections();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await api('/collections', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      setNewTitle('');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    } catch {
      // handled by api client
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile info */}
      <div className="mb-8 rounded-lg border border-gray-800 bg-gray-900 p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500 font-mono">Email</p>
            <p className="text-sm">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-mono">Role</p>
            <p className="text-sm">{user?.role}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-mono">Member since</p>
            <p className="text-sm">—</p>
          </div>
        </div>
      </div>

      {/* Collections */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Collections</h2>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New collection name..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={creating || !newTitle.trim()}
          className="rounded bg-white px-4 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {creating ? 'Creating...' : 'Create'}
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded border border-gray-800 bg-gray-900 p-4">
              <div className="h-4 w-1/3 rounded bg-gray-800" />
            </div>
          ))}
        </div>
      ) : collections && collections.length > 0 ? (
        <div className="space-y-3">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className="flex items-center justify-between rounded border border-gray-800 bg-gray-900 p-4 hover:border-gray-600 transition-colors"
            >
              <div>
                <h3 className="font-medium">{col.title}</h3>
                <p className="text-xs text-gray-500">
                  {col.itemCount} {col.itemCount === 1 ? 'asset' : 'assets'}
                </p>
              </div>
              <span className="text-gray-600 text-sm">&rarr;</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No collections yet. Create one above!</p>
      )}
    </div>
  );
}
