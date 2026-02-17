import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  AssetListResponse,
  AssetDetail,
  AssetListQuery,
  CollectionResponse,
  CollectionDetail,
} from '@fx-library/shared';

export function useAssets(query: Partial<AssetListQuery>) {
  return useQuery({
    queryKey: ['assets', query],
    queryFn: () => {
      const params = new URLSearchParams();
      if (query.page) params.set('page', String(query.page));
      if (query.pageSize) params.set('pageSize', String(query.pageSize));
      if (query.category) params.set('category', query.category);
      if (query.difficulty) params.set('difficulty', query.difficulty);
      if (query.tags) params.set('tags', query.tags);
      if (query.searchQuery) params.set('searchQuery', query.searchQuery);
      if (query.sort) params.set('sort', query.sort);
      return api<AssetListResponse>(`/assets?${params.toString()}`);
    },
  });
}

export function useAsset(slug: string) {
  return useQuery({
    queryKey: ['asset', slug],
    queryFn: () => api<AssetDetail>(`/assets/${slug}`),
    enabled: !!slug,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () =>
      api<Record<string, { id: string; name: string; kind: string }[]>>('/tags'),
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: () => api<CollectionResponse[]>('/collections'),
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: ['collection', id],
    queryFn: () => api<CollectionDetail>(`/collections/${id}`),
    enabled: !!id,
  });
}
