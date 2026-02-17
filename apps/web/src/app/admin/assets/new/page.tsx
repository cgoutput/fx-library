'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AdminGuard } from '@/components/admin-guard';
import { AssetForm, type AssetFormData } from '@/components/asset-form';

export default function NewAssetPage() {
  return (
    <AdminGuard>
      <NewAssetContent />
    </AdminGuard>
  );
}

function NewAssetContent() {
  const router = useRouter();

  async function handleSubmit(data: AssetFormData) {
    const res = await api<{ id: string }>('/admin/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    router.push(`/admin/assets/${res.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">New Asset</h1>
      <AssetForm onSubmit={handleSubmit} submitLabel="Save as Draft" />
    </div>
  );
}
