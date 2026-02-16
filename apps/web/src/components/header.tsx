'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-mono text-lg font-bold tracking-tight text-white">
            FX Library
          </Link>
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            <Link href="/assets" className="text-gray-400 hover:text-white transition-colors">
              Catalog
            </Link>
            {user && (
              <Link href="/me" className="text-gray-400 hover:text-white transition-colors">
                Collections
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-5 w-20 animate-pulse rounded bg-gray-800" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">{user.email}</span>
              <button
                onClick={() => logout()}
                className="rounded border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded bg-white px-3 py-1.5 text-sm font-medium text-gray-950 hover:bg-gray-200 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
