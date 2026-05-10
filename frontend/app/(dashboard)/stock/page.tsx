'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/SkeletonLoader';
import type { StockTransaction, Product } from '@/lib/types';

interface StockInForm { productId: string; productName: string; quantity: string; unitCost: string; description: string; expiryDate: string }
interface AdjustForm { productId: string; productName: string; quantity: string; description: string }

export default function StockPage() {
  const { token, role } = useAuth();
  const { data: transactions, mutate } = useAuthedSWR<StockTransaction[]>('/stock/transactions', token);
  const { data: products } = useAuthedSWR<Product[]>('/products', token);

  const canEdit = ['WAREHOUSE', 'ADMIN'].includes(role ?? '');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [modal, setModal] = useState<'in' | 'adjust' | null>(null);

  const [inForm, setInForm] = useState<StockInForm>({ productId: '', productName: '', quantity: '1', unitCost: '0', description: '', expiryDate: '' });
  const [adjustForm, setAdjustForm] = useState<AdjustForm>({ productId: '', productName: '', quantity: '0', description: '' });
  const [inSearch, setInSearch] = useState('');
  const [adjSearch, setAdjSearch] = useState('');

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const filtered = (transactions ?? []).filter(t => {
    const matchType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchSearch = t.productName?.toLowerCase().includes(search.toLowerCase()) ||
      t.transactionId.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  function openStockIn() {
    setInForm({ productId: '', productName: '', quantity: '1', unitCost: '0', description: '', expiryDate: '' });
    setInSearch(''); setErr(''); setModal('in');
  }
  function openAdjust() {
    setAdjustForm({ productId: '', productName: '', quantity: '0', description: '' });
    setAdjSearch(''); setErr(''); setModal('adjust');
  }

  async function handleStockIn(e: React.FormEvent) {
    e.preventDefault();
    if (!inForm.productId) { setErr('กรุณาเลือกสินค้า'); return; }
    setBusy(true); setErr('');
    try {
      await apiFetch('/stock/in', {
        method: 'POST',
        body: JSON.stringify({
          productId: inForm.productId,
          quantity: parseInt(inForm.quantity),
          unitCost: parseFloat(inForm.unitCost),
          description: inForm.description || undefined,
          expiryDate: inForm.expiryDate || undefined,
        }),
        token: token!,
      });
      setSuccess('รับสินค้าเข้าคลังสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustForm.productId) { setErr('กรุณาเลือกสินค้า'); return; }
    setBusy(true); setErr('');
    try {
      await apiFetch('/stock/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId: adjustForm.productId,
          quantity: parseInt(adjustForm.quantity),
          description: adjustForm.description || undefined,
        }),
        token: token!,
      });
      setSuccess('ปรับสต็อกสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  const filteredProdsIn = (products ?? []).filter(p =>
    p.active && (p.productName.toLowerCase().includes(inSearch.toLowerCase()) ||
    p.productId.toLowerCase().includes(inSearch.toLowerCase()))
  );
  const filteredProdsAdj = (products ?? []).filter(p =>
    p.active && (p.productName.toLowerCase().includes(adjSearch.toLowerCase()) ||
    p.productId.toLowerCase().includes(adjSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">สต็อกสินค้า</h1>
          <p className="text-gray-500 text-sm mt-1">รายการเคลื่อนไหวสินค้า</p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <button onClick={openStockIn}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium">
              + รับสินค้าเข้าคลัง
            </button>
            <button onClick={openAdjust}
              className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors font-medium">
              ปรับสต็อก
            </button>
          </div>
        )}
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {err     && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..."
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <div className="flex gap-1">
            {['ALL', 'IN', 'OUT', 'ADJUST'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === t ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>
                {t === 'ALL' ? 'ทั้งหมด' : t}
              </button>
            ))}
          </div>
        </div>
        {!transactions ? <div className="p-4"><TableSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>{['วันที่','ประเภท','สินค้า','จำนวน','พนักงาน','หมายเหตุ'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">ไม่พบรายการ</td></tr>
                ) : filtered.map(t => (
                  <tr key={t.transactionId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{new Date(t.transactionDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.type} /></td>
                    <td className="px-4 py-3 font-medium text-gray-800">{t.productName ?? t.productId}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${t.type === 'IN' ? 'text-green-600' : t.type === 'OUT' ? 'text-red-600' : 'text-amber-600'}`}>
                        {t.type === 'IN' ? '+' : t.type === 'OUT' ? '-' : '±'}{t.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.staffName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{t.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock In Modal */}
      <Modal open={modal === 'in'} onClose={() => setModal(null)} title="รับสินค้าเข้าคลัง" size="md">
        <form onSubmit={handleStockIn} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สินค้า *</label>
            <div className="relative">
              <input
                value={inForm.productId ? inForm.productName : inSearch}
                onChange={e => { setInSearch(e.target.value); setInForm(f => ({ ...f, productId: '', productName: '' })); }}
                placeholder="ค้นหาสินค้า..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {inSearch && !inForm.productId && filteredProdsIn.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredProdsIn.slice(0, 10).map(p => (
                    <button key={p.productId} type="button"
                      onClick={() => { setInForm(f => ({ ...f, productId: p.productId, productName: p.productName, unitCost: String(p.costPrice) })); setInSearch(p.productName); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{p.productName}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน *</label>
              <input type="number" min="1" required value={inForm.quantity}
                onChange={e => setInForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ราคาทุน/หน่วย</label>
              <input type="number" min="0" step="0.01" value={inForm.unitCost}
                onChange={e => setInForm(f => ({ ...f, unitCost: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">วันหมดอายุ</label>
            <input type="date" value={inForm.expiryDate} onChange={e => setInForm(f => ({ ...f, expiryDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <input value={inForm.description} onChange={e => setInForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">ยกเลิก</button>
            <button type="submit" disabled={busy}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60">
              {busy ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Modal */}
      <Modal open={modal === 'adjust'} onClose={() => setModal(null)} title="ปรับสต็อก" size="md">
        <form onSubmit={handleAdjust} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สินค้า *</label>
            <div className="relative">
              <input
                value={adjustForm.productId ? adjustForm.productName : adjSearch}
                onChange={e => { setAdjSearch(e.target.value); setAdjustForm(f => ({ ...f, productId: '', productName: '' })); }}
                placeholder="ค้นหาสินค้า..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {adjSearch && !adjustForm.productId && filteredProdsAdj.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredProdsAdj.slice(0, 10).map(p => (
                    <button key={p.productId} type="button"
                      onClick={() => { setAdjustForm(f => ({ ...f, productId: p.productId, productName: p.productName })); setAdjSearch(p.productName); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{p.productName} (คงเหลือ: {p.quantity})</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">จำนวน (บวก=เพิ่ม, ลบ=ลด)</label>
            <input type="number" required value={adjustForm.quantity}
              onChange={e => setAdjustForm(f => ({ ...f, quantity: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ *</label>
            <input required value={adjustForm.description} onChange={e => setAdjustForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">ยกเลิก</button>
            <button type="submit" disabled={busy}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-60">
              {busy ? 'กำลังบันทึก...' : 'ปรับสต็อก'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
