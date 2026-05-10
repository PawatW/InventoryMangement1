'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/SkeletonLoader';
import type { Order, OrderItem, Customer, Product } from '@/lib/types';

interface LineItem { productId: string; productName: string; quantity: string; unitPrice: string }

export default function OrdersPage() {
  const { token, role } = useAuth();

  const endpoint = role === 'TECHNICIAN' ? '/orders/confirmed'
    : role === 'SALES' ? '/orders/my'
    : '/orders';

  const { data: orders, mutate } = useAuthedSWR<Order[]>(endpoint, token);
  const { data: customers } = useAuthedSWR<Customer[]>(
    ['SALES','ADMIN'].includes(role ?? '') ? '/customers' : null, token);
  const { data: products } = useAuthedSWR<Product[]>('/products', token);

  const canCreate = ['SALES','ADMIN'].includes(role ?? '');

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'detail' | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', productName: '', quantity: '1', unitPrice: '0' }]);
  const [productSearch, setProductSearch] = useState<string[]>(['']);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const filtered = (orders ?? []).filter(o =>
    o.orderId.toLowerCase().includes(search.toLowerCase()) ||
    (o.customerName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredCustomers = (customers ?? []).filter(c =>
    c.customerName.toLowerCase().includes(customerSearch.toLowerCase())
  );

  function openCreate() {
    setCustomerId(''); setCustomerSearch('');
    setLines([{ productId: '', productName: '', quantity: '1', unitPrice: '0' }]);
    setProductSearch(['']); setErr(''); setModal('create');
  }

  async function openDetail(o: Order) {
    setSelected(o); setErr('');
    try {
      const data = await apiFetch<OrderItem[]>(`/orders/${o.orderId}/items`, { token: token! });
      setItems(data);
    } catch { setItems([]); }
    setModal('detail');
  }

  function addLine() {
    setLines(l => [...l, { productId: '', productName: '', quantity: '1', unitPrice: '0' }]);
    setProductSearch(s => [...s, '']);
  }

  function removeLine(i: number) {
    setLines(l => l.filter((_, idx) => idx !== i));
    setProductSearch(s => s.filter((_, idx) => idx !== i));
  }

  function selectProduct(lineIdx: number, p: Product) {
    setLines(l => l.map((line, i) => i === lineIdx
      ? { ...line, productId: p.productId, productName: p.productName, unitPrice: String(p.sellPrice) }
      : line));
    setProductSearch(s => s.map((v, i) => i === lineIdx ? p.productName : v));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) { setErr('กรุณาเลือกลูกค้า'); return; }
    if (lines.some(l => !l.productId)) { setErr('กรุณาเลือกสินค้าทุกรายการ'); return; }
    setBusy(true); setErr('');
    try {
      const body = {
        customerId,
        items: lines.map(l => ({
          productId: l.productId,
          quantity: parseInt(l.quantity),
          unitPrice: parseFloat(l.unitPrice),
        })),
      };
      await apiFetch('/orders', { method: 'POST', body: JSON.stringify(body), token: token! });
      setSuccess('สร้างคำสั่งซื้อสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handleConfirm(o: Order) {
    if (!confirm('ยืนยันคำสั่งซื้อ?')) return;
    try {
      await apiFetch(`/orders/${o.orderId}/confirm`, { method: 'PATCH', token: token! });
      setSuccess('ยืนยันคำสั่งซื้อสำเร็จ'); mutate();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  }

  async function handleCancel(o: Order) {
    if (!confirm('ยกเลิกคำสั่งซื้อ?')) return;
    try {
      await apiFetch(`/orders/${o.orderId}/cancel`, { method: 'PATCH', token: token! });
      setSuccess('ยกเลิกคำสั่งซื้อสำเร็จ'); mutate();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">คำสั่งซื้อ</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการคำสั่งซื้อ</p>
        </div>
        {canCreate && (
          <button onClick={openCreate}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium">
            + สร้างคำสั่งซื้อ
          </button>
        )}
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {err     && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาคำสั่งซื้อ..."
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        {!orders ? <div className="p-4"><TableSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>{['รหัส','วันที่','ลูกค้า','ยอดรวม','สถานะ','การดำเนินการ'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">ไม่พบคำสั่งซื้อ</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.orderId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{o.orderId}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(o.orderDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{o.customerName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{o.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openDetail(o)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">รายละเอียด</button>
                      {canCreate && o.status === 'New order' && (
                        <>
                          <button onClick={() => handleConfirm(o)}
                            className="px-3 py-1 border border-green-200 text-green-600 rounded-lg text-xs hover:bg-green-50">ยืนยัน</button>
                          <button onClick={() => handleCancel(o)}
                            className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50">ยกเลิก</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="สร้างคำสั่งซื้อ" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}

          {/* Customer select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ลูกค้า *</label>
            <div className="relative">
              <input
                value={customerId ? (customers ?? []).find(c => c.customerId === customerId)?.customerName ?? customerSearch : customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setCustomerId(''); }}
                placeholder="ค้นหาลูกค้า..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {customerSearch && !customerId && filteredCustomers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <button key={c.customerId} type="button"
                      onClick={() => { setCustomerId(c.customerId); setCustomerSearch(c.customerName); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{c.customerName}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">รายการสินค้า</label>
              <button type="button" onClick={addLine}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium">+ เพิ่มรายการ</button>
            </div>
            <div className="space-y-2">
              {lines.map((line, i) => {
                const filteredProds = (products ?? []).filter(p =>
                  p.active && (p.productName.toLowerCase().includes(productSearch[i]?.toLowerCase() ?? '') ||
                  p.productId.toLowerCase().includes(productSearch[i]?.toLowerCase() ?? ''))
                );
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 relative">
                      <input
                        value={line.productId ? line.productName : (productSearch[i] ?? '')}
                        onChange={e => {
                          setProductSearch(s => s.map((v, idx) => idx === i ? e.target.value : v));
                          setLines(l => l.map((ln, idx) => idx === i ? { ...ln, productId: '', productName: '' } : ln));
                        }}
                        placeholder="ค้นหาสินค้า..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      {(productSearch[i] ?? '') && !line.productId && filteredProds.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredProds.slice(0, 10).map(p => (
                            <button key={p.productId} type="button" onClick={() => selectProduct(i, p)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                              <span className="font-medium">{p.productName}</span>
                              <span className="text-gray-400 ml-2 text-xs">{p.sellPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿ | คงเหลือ: {p.quantity}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="number" min="1" value={line.quantity}
                      onChange={e => setLines(l => l.map((ln, idx) => idx === i ? { ...ln, quantity: e.target.value } : ln))}
                      placeholder="จำนวน" className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input type="number" min="0" step="0.01" value={line.unitPrice}
                      onChange={e => setLines(l => l.map((ln, idx) => idx === i ? { ...ln, unitPrice: e.target.value } : ln))}
                      placeholder="ราคา" className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(i)}
                        className="text-red-400 hover:text-red-600 px-2 py-2 text-lg">×</button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-right text-sm font-semibold text-gray-700">
              ยอดรวม: {lines.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0), 0)
                .toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">ยกเลิก</button>
            <button type="submit" disabled={busy}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60">
              {busy ? 'กำลังสร้าง...' : 'สร้างคำสั่งซื้อ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="รายละเอียดคำสั่งซื้อ" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['รหัสคำสั่งซื้อ', selected.orderId],
                ['วันที่', new Date(selected.orderDate).toLocaleDateString('th-TH')],
                ['ลูกค้า', selected.customerName ?? '—'],
                ['พนักงาน', selected.staffName ?? '—'],
                ['สถานะ', selected.status],
                ['ยอดรวม', selected.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) + ' ฿'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="text-gray-400 text-xs">{label}</div>
                  <div className="font-medium text-gray-800">{label === 'สถานะ' ? <StatusBadge status={val} /> : val}</div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">รายการสินค้า</h3>
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>{['สินค้า','จำนวน','ราคา/หน่วย','รวม','จัดส่งแล้ว','คงเหลือ'].map(h =>
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map(it => (
                    <tr key={it.orderItemId}>
                      <td className="px-3 py-2">{it.productName}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
                      <td className="px-3 py-2">{it.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2">{it.lineTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2">{it.fulfilledQty}</td>
                      <td className="px-3 py-2 font-semibold">{it.remainingQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
