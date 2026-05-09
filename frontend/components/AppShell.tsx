'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/config';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const ALL_NAV: Record<string, NavItem[]> = {
  ADMIN: [
    { label: 'แดชบอร์ด',       href: '/dashboard',        icon: '📊' },
    { label: 'คลังสินค้า',      href: '/inventory',        icon: '📦' },
    { label: 'คำสั่งซื้อ',      href: '/orders',           icon: '🛒' },
    { label: 'คำขอเบิก',        href: '/requests',         icon: '📋' },
    { label: 'จัดการสต็อก',     href: '/stock',            icon: '🔄' },
    { label: 'ลูกค้า',          href: '/customers',        icon: '👥' },
    { label: 'ซัพพลายเออร์',    href: '/suppliers',        icon: '🏭' },
    { label: 'ใบสั่งซื้อ',      href: '/purchase-orders',  icon: '📄' },
    { label: 'ส่งออกรายงาน',    href: '/reports',          icon: '📈' },
    { label: 'พนักงาน',         href: '/staff',            icon: '👤' },
  ],
  SALES: [
    { label: 'แดชบอร์ด',   href: '/dashboard',  icon: '📊' },
    { label: 'สินค้า',     href: '/inventory',  icon: '📦' },
    { label: 'คำสั่งซื้อ', href: '/orders',     icon: '🛒' },
    { label: 'ลูกค้า',    href: '/customers',   icon: '👥' },
  ],
  TECHNICIAN: [
    { label: 'แดชบอร์ด',  href: '/dashboard', icon: '📊' },
    { label: 'คำสั่งซื้อ', href: '/orders',    icon: '🛒' },
    { label: 'คำขอเบิก',  href: '/requests',   icon: '📋' },
  ],
  FOREMAN: [
    { label: 'แดชบอร์ด', href: '/dashboard', icon: '📊' },
    { label: 'คำขอเบิก',  href: '/requests',  icon: '📋' },
  ],
  WAREHOUSE: [
    { label: 'แดชบอร์ด',    href: '/dashboard',       icon: '📊' },
    { label: 'คลังสินค้า',  href: '/inventory',        icon: '📦' },
    { label: 'จัดการสต็อก', href: '/stock',            icon: '🔄' },
    { label: 'ใบสั่งซื้อ',  href: '/purchase-orders',  icon: '📄' },
  ],
  PROCUREMENT: [
    { label: 'แดชบอร์ด',     href: '/dashboard',       icon: '📊' },
    { label: 'ซัพพลายเออร์', href: '/suppliers',       icon: '🏭' },
    { label: 'ใบสั่งซื้อ',   href: '/purchase-orders', icon: '📄' },
  ],
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { role, staffId, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = ALL_NAV[role ?? ''] ?? ALL_NAV['ADMIN'];
  const roleLabel = ROLE_LABELS[role ?? ''] ?? role;
  const roleColor = ROLE_COLORS[role ?? ''] ?? 'bg-gray-100 text-gray-700';

  const Sidebar = (
    <aside className="w-64 flex-shrink-0 bg-primary-900 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            INV
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">Inventory</div>
            <div className="text-white/50 text-xs">Management</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-white/15 text-white font-medium border-l-4 border-white pl-2'
                  : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom user info */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
            {staffId?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">{staffId}</div>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-xs transition-colors flex items-center gap-2"
        >
          <span>🚪</span>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col">{Sidebar}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 flex flex-col h-full w-64">{Sidebar}</div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColor}`}>
            {roleLabel}
          </span>
          <span className="text-sm text-gray-500 hidden sm:block">{staffId}</span>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="ออกจากระบบ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
