'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCollections } from '@/lib/hooks';
import { api } from '@/lib/api';

interface Props {
  assetId: string;
  onClose: () => void;
}

export function AddToCollectionModal({ assetId, onClose }: Props) {
  const { data: collections, isLoading } = useCollections();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function handleAdd(collectionId: string) {
    setAdding(collectionId);
    setMessage('');
    try {
      await api(`/collections/${collectionId}/items`, {
        method: 'POST',
        body: JSON.stringify({ assetId }),
      });
      setMessage('Added!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setTimeout(onClose, 600);
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to add');
    } finally {
      setAdding(null);
    }
  }

  async function handleCreateAndAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setMessage('');
    try {
      const col = await api<{ id: string }>('/collections', {
        method: 'POST',
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      await api(`/collections/${col.id}/items`, {
        method: 'POST',
        body: JSON.stringify({ assetId }),
      });
      setMessage('Created & added!');
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setTimeout(onClose, 600);
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Save to Collection</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">
            &times;
          </button>
        </div>

        {message && (
          <div className="mb-3 rounded bg-gray-800 px-3 py-2 text-sm text-gray-300">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-800" />
            ))}
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => handleAdd(col.id)}
                disabled={adding === col.id}
                className="w-full text-left rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm hover:border-gray-500 disabled:opacity-50 transition-colors"
              >
                <span className="font-medium">{col.title}</span>
                <span className="ml-2 text-xs text-gray-500">
                  {col.itemCount} {col.itemCount === 1 ? 'item' : 'items'}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-sm text-gray-500">No collections yet.</p>
        )}

        <form onSubmit={handleCreateAndAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="New collection..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="shrink-0 rounded bg-white px-3 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {creating ? '...' : 'Create & Add'}
          </button>
        </form>
      </div>
    </div>
  );
}
