'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Category, Difficulty } from '@fx-library/shared';
import { useAssets, useTags } from '@/lib/hooks';

const CATEGORIES = ['PYRO', 'FLIP', 'VELLUM', 'RBD', 'PARTICLES', 'OCEAN', 'USD', 'TOOLS', 'OTHER'];
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const SORTS = [
  { value: 'new', label: 'Newest' },
  { value: 'updated', label: 'Updated' },
  { value: 'popular', label: 'Popular' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-900/50 text-green-300 border-green-800',
  INTERMEDIATE: 'bg-yellow-900/50 text-yellow-300 border-yellow-800',
  ADVANCED: 'bg-red-900/50 text-red-300 border-red-800',
};

export default function AssetsPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<Category | ''>('');
  const [difficulty, setDifficulty] = useState<Difficulty | ''>('');
  const [sort, setSort] = useState<'new' | 'updated' | 'popular'>('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: tagsData } = useTags();
  const { data, isLoading } = useAssets({
    page,
    pageSize: 20,
    category: category || undefined,
    difficulty: difficulty || undefined,
    sort,
    searchQuery: searchQuery || undefined,
    tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
  });

  const allTags = tagsData ? Object.values(tagsData).flat() : [];

  function toggleTag(name: string) {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    );
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catalog</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-white focus:outline-none w-64"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as Category | '');
            setPage(1);
          }}
          className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value as Difficulty | '');
            setPage(1);
          }}
          className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as typeof sort);
            setPage(1);
          }}
          className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.name)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selectedTags.includes(tag.name)
                  ? 'border-white bg-white text-gray-950'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Asset grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-800 bg-gray-900 p-4"
            >
              <div className="h-40 rounded bg-gray-800 mb-3" />
              <div className="h-4 w-3/4 rounded bg-gray-800 mb-2" />
              <div className="h-3 w-full rounded bg-gray-800" />
            </div>
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets/${asset.slug}`}
                className="group rounded-lg border border-gray-800 bg-gray-900 overflow-hidden hover:border-gray-600 transition-colors"
              >
                {/* Cover placeholder */}
                <div className="h-40 bg-gray-800 flex items-center justify-center">
                  <span className="font-mono text-xs text-gray-600 uppercase">
                    {asset.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white group-hover:text-gray-200 line-clamp-1">
                    {asset.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{asset.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-gray-800 px-2 py-0.5 font-mono text-xs text-gray-400">
                      {asset.category}
                    </span>
                    <span
                      className={`rounded border px-2 py-0.5 text-xs ${DIFFICULTY_COLORS[asset.difficulty] ?? ''}`}
                    >
                      {asset.difficulty}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {asset.tags.map((tag) => (
                      <span key={tag.id} className="text-xs text-gray-500">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">{asset.downloadCount} downloads</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500 py-12">No assets found</p>
      )}
    </div>
  );
}
