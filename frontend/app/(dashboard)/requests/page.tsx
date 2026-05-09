'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/SkeletonLoader';
import type { Request, RequestItem, Order, Product } from '@/lib/types';

interface LineItem { productId: string; productName: string; quantity: string }

export default function RequestsPage() {
  const { token, role } = useAuth();

  const endpoint =
    role === 'TECHNICIAN' ? '/requests/my'
    : role === 'FOREMAN'   ? '/requests/pending'
    : role === 'WAREHOUSE' ? '/stock/approved-requests'
    : '/requests';

  const { data: requests, mutate } = useAuthedSWR<Request[]>(endpoint, token);
  const { data: orders } = useAuthedSWR<Order[]>(
    role === 'TECHNICIAN' ? '/orders/confirmed' : null, token);
  const { data: products } = useAuthedSWR<Product[]>('/products', token);

  const canCreate = role === 'TECHNICIAN';
  const canApprove = role === 'FOREMAN' || role === 'ADMIN';
  const canFulfill = role === 'WAREHOUSE' || role === 'ADMIN';

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'detail' | 'fulfill' | null>(null);
  const [selected, setSelected] = useState<Request | null>(null);
  const [reqItems, setReqItems] = useState<RequestItem[]>([]);

  const [orderId, setOrderId] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', productName: '', quantity: '1' }]);
  const [productSearch, setProductSearch] = useState<string[]>(['']);

  const [fulfillQtys, setFulfillQtys] = useState<Record<string, string>>({});

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const filtered = (requests ?? []).filter(r =>
    r.requestId.toLowerCase().includes(search.toLowerCase()) ||
    (r.customerName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (r.staffName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredOrders = (orders ?? []).filter(o =>
    o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.customerName ?? '').toLowerCase().includes(orderSearch.toLowerCase())
  );

  function openCreate() {
    setOrderId(''); setOrderSearch(''); setDescription('');
    setLines([{ productId: '', productName: '', quantity: '1' }]);
    setProductSearch(['']); setErr(''); setModal('create');
  }

  async function openDetail(r: Request) {
    setSelected(r); setErr('');
    try {
      const data = await apiFetch<RequestItem[]>(`/requests/${r.requestId}/items`, { token: token! });
      setReqItems(data);
    } catch { setReqItems([]); }
    setModal('detail');
  }

  async function openFulfill(r: Request) {
    setSelected(r); setErr('');
    try {
      const data = await apiFetch<RequestItem[]>(`/requests/${r.requestId}/items`, { token: token! });
      setReqItems(data);
      const qtys: Record<string, string> = {};
      data.forEach(it => { qtys[it.requestItemId] = String(it.remainingQty); });
      setFulfillQtys(qtys);
    } catch { setReqItems([]); }
    setModal('fulfill');
  }

  function addLine() {
    setLines(l => [...l, { productId: '', productName: '', quantity: '1' }]);
    setProductSearch(s => [...s, '']);
  }
  function removeLine(i: number) {
    setLines(l => l.filter((_, idx) => idx !== i));
    setProductSearch(s => s.filter((_, idx) => idx !== i));
  }
  function selectProduct(lineIdx: number, p: Product) {
    setLines(l => l.map((line, i) => i === lineIdx
      ? { ...line, productId: p.productId, productName: p.productName }
      : line));
    setProductSearch(s => s.map((v, i) => i === lineIdx ? p.productName : v));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (lines.some(l => !l.productId)) { setErr('กรุณาเลือกสินค้าทุกรายการ'); return; }
    setBusy(true); setErr('');
    try {
      const body = {
        orderId: orderId || undefined,
        description,
        items: lines.map(l => ({ productId: l.productId, quantity: parseInt(l.quantity) })),
      };
      await apiFetch('/requests', { method: 'POST', body: JSON.stringify(body), token: token! });
      setSuccess('สร้างคำขอเบิกสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handleApprove(r: Request) {
    if (!confirm('อนุมัติคำขอนี้?')) return;
    try {
      await apiFetch(`/requests/${r.requestId}/approve`, { method: 'PATCH', token: token! });
      setSuccess('อนุมัติสำเร็จ'); mutate();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  }

  async function handleReject(r: Request) {
    if (!confirm('ปฏิเสธคำขอนี้?')) return;
    try {
      await apiFetch(`/requests/${r.requestId}/reject`, { method: 'PATCH', token: token! });
      setSuccess('ปฏิเสธสำเร็จ'); mutate();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  }

  async function handleFulfill(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const fulfillItems = reqItems
        .filter(it => it.remainingQty > 0)
        .map(it => ({ requestItemId: it.requestItemId, quantity: parseInt(fulfillQtys[it.requestItemId] ?? '0') || 0 }))
        .filter(it => it.quantity > 0);
      await apiFetch(`/requests/${selected!.requestId}/fulfill`, {
        method: 'POST', body: JSON.stringify({ items: fulfillItems }), token: token!,
      });
      setSuccess('จัดส่งสินค้าสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">คำขอเบิกสินค้า</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการคำขอเบิกสินค้า</p>
        </div>
        {canCreate && (
          <button onClick={openCreate}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium">
            + สร้างคำขอเบิก
          </button>
        )}
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {err     && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาคำขอ..."
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        {!requests ? <div className="p-4"><TableSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>{['รหัส','วันที่','พนักงาน','ลูกค้า','สถานะ','การดำเนินการ'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">ไม่พบคำขอ</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.requestId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.requestId}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(r.requestDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3 text-gray-700">{r.staffName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{r.customerName ?? '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 flex gap-2 flex-wrap">
                      <button onClick={() => openDetail(r)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">รายละเอียด</button>
                      {canApprove && r.status === 'Awaiting Approval' && (
                        <>
                          <button onClick={() => handleApprove(r)}
                            className="px-3 py-1 border border-green-200 text-green-600 rounded-lg text-xs hover:bg-green-50">อนุมัติ</button>
                          <button onClick={() => handleReject(r)}
                            className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50">ปฏิเสธ</button>
                        </>
                      )}
                      {canFulfill && r.status === 'Approved' && (
                        <button onClick={() => openFulfill(r)}
                          className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg text-xs hover:bg-blue-50">จัดส่ง</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="สร้างคำขอเบิกสินค้า" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}

          {/* Order link (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เชื่อมโยงคำสั่งซื้อ (ไม่บังคับ)</label>
            <div className="relative">
              <input
                value={orderId ? (orders ?? []).find(o => o.orderId === orderId)?.orderId ?? orderSearch : orderSearch}
                onChange={e => { setOrderSearch(e.target.value); setOrderId(''); }}
                placeholder="ค้นหาคำสั่งซื้อ..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {orderSearch && !orderId && filteredOrders.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredOrders.map(o => (
                    <button key={o.orderId} type="button"
                      onClick={() => { setOrderId(o.orderId); setOrderSearch(`${o.orderId} — ${o.customerName ?? ''}`); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                      {o.orderId} — {o.customerName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">รายการสินค้าที่ขอเบิก</label>
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
                              {p.productName}
                              <span className="text-gray-400 ml-2 text-xs">คงเหลือ: {p.quantity}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input type="number" min="1" value={line.quantity}
                      onChange={e => setLines(l => l.map((ln, idx) => idx === i ? { ...ln, quantity: e.target.value } : ln))}
                      placeholder="จำนวน" className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    {lines.length > 1 && (
                      <button type="button" onClick={() => removeLine(i)}
                        className="text-red-400 hover:text-red-600 px-2 py-2 text-lg">×</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">ยกเลิก</button>
            <button type="submit" disabled={busy}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60">
              {busy ? 'กำลังส่ง...' : 'ส่งคำขอ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="รายละเอียดคำขอ" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['รหัส', selected.requestId],
                ['วันที่', new Date(selected.requestDate).toLocaleDateString('th-TH')],
                ['พนักงาน', selected.staffName ?? '—'],
                ['ลูกค้า', selected.customerName ?? '—'],
                ['คำสั่งซื้อ', selected.orderId ?? '—'],
                ['สถานะ', selected.status],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="text-gray-400 text-xs">{label}</div>
                  <div className="font-medium text-gray-800">{label === 'สถานะ' ? <StatusBadge status={val} /> : val}</div>
                </div>
              ))}
            </div>
            {selected.description && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selected.description}</div>
            )}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">รายการสินค้า</h3>
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>{['สินค้า','จำนวน','จัดส่งแล้ว','คงเหลือ'].map(h =>
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reqItems.map(it => (
                    <tr key={it.requestItemId}>
                      <td className="px-3 py-2">{it.productName}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
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

      {/* Fulfill Modal */}
      <Modal open={modal === 'fulfill'} onClose={() => setModal(null)} title="จัดส่งสินค้า" size="lg">
        {selected && (
          <form onSubmit={handleFulfill} className="space-y-4">
            {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
            <p className="text-sm text-gray-600">คำขอ: <span className="font-mono font-medium">{selected.requestId}</span></p>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">กำหนดจำนวนที่จัดส่ง (FIFO)</h3>
              <div className="space-y-3">
                {reqItems.filter(it => it.remainingQty > 0).map(it => (
                  <div key={it.requestItemId} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{it.productName}</div>
                      <div className="text-xs text-gray-400">คงเหลือที่ต้องจัดส่ง: {it.remainingQty}</div>
                    </div>
                    <input type="number" min="0" max={it.remainingQty}
                      value={fulfillQtys[it.requestItemId] ?? '0'}
                      onChange={e => setFulfillQtys(q => ({ ...q, [it.requestItemId]: e.target.value }))}
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">ยกเลิก</button>
              <button type="submit" disabled={busy}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60">
                {busy ? 'กำลังจัดส่ง...' : 'ยืนยันการจัดส่ง'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
