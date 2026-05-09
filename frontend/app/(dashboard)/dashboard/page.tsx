'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { CardSkeleton } from '@/components/SkeletonLoader';
import type { Product, Order, Request, StockTransaction } from '@/lib/types';

interface StatCard {
  icon: string;
  label: string;
  value: number | undefined;
  href: string;
  color: string;
}

export default function DashboardPage() {
  const { role, token } = useAuth();

  const { data: products }     = useAuthedSWR<Product[]>('/products', token);
  const { data: confirmed }    = useAuthedSWR<Order[]>(
    ['TECHNICIAN','SALES','ADMIN'].includes(role ?? '') ? '/orders/confirmed' : null, token);
  const { data: pending }      = useAuthedSWR<Request[]>(
    ['FOREMAN','ADMIN'].includes(role ?? '') ? '/requests/pending' : null, token);
  const { data: approved }     = useAuthedSWR<Request[]>(
    ['WAREHOUSE','ADMIN'].includes(role ?? '') ? '/stock/approved-requests' : null, token);
  const { data: transactions } = useAuthedSWR<StockTransaction[]>(
    role === 'ADMIN' ? '/stock/transactions' : null, token);

  const cards: StatCard[] = [
    { icon: '📦', label: 'สินค้าทั้งหมด',     value: products?.length,     href: '/inventory',       color: 'text-blue-600 bg-blue-50' },
    ...(['TECHNICIAN','SALES','ADMIN'].includes(role ?? '') ? [
      { icon: '🛒', label: 'คำสั่งซื้อที่ยืนยัน', value: confirmed?.length, href: '/orders',          color: 'text-amber-600 bg-amber-50' } as StatCard,
    ] : []),
    ...(['FOREMAN','ADMIN'].includes(role ?? '') ? [
      { icon: '⏳', label: 'คำขอรอการอนุมัติ', value: pending?.length,     href: '/requests',        color: 'text-orange-600 bg-orange-50' } as StatCard,
    ] : []),
    ...(['WAREHOUSE','ADMIN'].includes(role ?? '') ? [
      { icon: '✅', label: 'คำขอพร้อมจัดส่ง',  value: approved?.length,   href: '/requests',        color: 'text-emerald-600 bg-emerald-50' } as StatCard,
    ] : []),
    ...(role === 'ADMIN' ? [
      { icon: '🔄', label: 'รายการเคลื่อนไหว',  value: transactions?.length, href: '/stock',          color: 'text-purple-600 bg-purple-50' } as StatCard,
    ] : []),
  ];

  const quickLinks: { label: string; href: string; roles: string[] }[] = [
    { label: '➕ เพิ่มสินค้า',         href: '/inventory',       roles: ['WAREHOUSE','PROCUREMENT','ADMIN'] },
    { label: '🛒 สร้างคำสั่งซื้อ',    href: '/orders',          roles: ['SALES','ADMIN'] },
    { label: '📋 สร้างคำขอเบิก',      href: '/requests',        roles: ['TECHNICIAN'] },
    { label: '🔄 รับสินค้าเข้าคลัง',  href: '/stock',           roles: ['WAREHOUSE'] },
    { label: '📄 สร้างใบสั่งซื้อ',    href: '/purchase-orders', roles: ['WAREHOUSE','PROCUREMENT','ADMIN'] },
  ].filter(l => l.roles.includes(role ?? ''));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
        <p className="text-gray-500 text-sm mt-1">ภาพรวมระบบคลังสินค้า</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!products ? (
          [1,2,3,4].map(i => <CardSkeleton key={i} />)
        ) : cards.map(c => (
          <Link key={c.href + c.label} href={c.href}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${c.color} mb-3`}>
                {c.icon}
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {c.value ?? '—'}
              </div>
              <div className="text-sm text-gray-500">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      {quickLinks.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-3">ทางลัด</h2>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map(l => (
              <Link key={l.href + l.label} href={l.href}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm hover:bg-primary-100 transition-colors font-medium">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
