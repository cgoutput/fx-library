'use client';

import { useState, useEffect } from 'react';
import { ApiError } from '@/lib/api';
import { useTags } from '@/lib/hooks';

const CATEGORIES = ['PYRO', 'FLIP', 'VELLUM', 'RBD', 'PARTICLES', 'OCEAN', 'USD', 'TOOLS', 'OTHER'];
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export interface AssetFormData {
  title: string;
  summary: string;
  category: string;
  difficulty: string;
  descriptionMd: string;
  howToMd: string;
  breakdownMd: string;
  tagIds: string[];
}

interface Props {
  initial?: Partial<AssetFormData>;
  onSubmit: (data: AssetFormData) => Promise<void>;
  submitLabel: string;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }
  return fallback;
}

export function AssetForm({ initial, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<AssetFormData>({
    title: '',
    summary: '',
    category: 'PYRO',
    difficulty: 'BEGINNER',
    descriptionMd: '',
    howToMd: '',
    breakdownMd: '',
    tagIds: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { data: tagsData } = useTags();

  useEffect(() => {
    if (initial) {
      setForm((prev) => ({ ...prev, ...initial }));
    }
  }, [initial]);

  const allTags = tagsData ? Object.values(tagsData).flat() : [];

  function toggleTag(id: string) {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id) ? prev.tagIds.filter((t) => t !== id) : [...prev.tagIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded bg-red-950/50 border border-red-800 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
          />
          {form.title && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              slug:{' '}
              {form.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Summary</label>
          <input
            type="text"
            required
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">Tags</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                form.tagIds.includes(tag.id)
                  ? 'border-white bg-white text-gray-950'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Markdown fields */}
      {[
        { key: 'descriptionMd' as const, label: 'Description (Markdown)' },
        { key: 'howToMd' as const, label: 'How to Use (Markdown)' },
        { key: 'breakdownMd' as const, label: 'Breakdown (Markdown)' },
      ].map(({ key, label }) => (
        <div key={key}>
          <label className="mb-1 block text-sm font-medium text-gray-300">{label}</label>
          <textarea
            rows={5}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white font-mono focus:border-white focus:outline-none"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-white px-6 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
