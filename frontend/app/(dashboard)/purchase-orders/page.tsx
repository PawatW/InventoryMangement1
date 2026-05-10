'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/SkeletonLoader';
import type { PurchaseOrder, PurchaseItem, Supplier, Product } from '@/lib/types';

interface LineItem { productId: string; productName: string; quantity: string; unitPrice: string }

const TABS = [
  { key: '', label: 'ทั้งหมด' },
  { key: 'Pending', label: 'รอดำเนินการ' },
  { key: 'Received', label: 'รับแล้ว' },
  { key: 'Cancelled', label: 'ยกเลิก' },
];

export default function PurchaseOrdersPage() {
  const { token, role } = useAuth();
  const { data: pos, mutate } = useAuthedSWR<PurchaseOrder[]>('/purchase-orders', token);
  const { data: suppliers } = useAuthedSWR<Supplier[]>('/suppliers', token);
  const { data: products } = useAuthedSWR<Product[]>('/products', token);

  const canCreate = ['WAREHOUSE', 'PROCUREMENT', 'ADMIN'].includes(role ?? '');
  const canReceive = ['WAREHOUSE', 'ADMIN'].includes(role ?? '');

  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'detail' | 'receive' | null>(null);
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [poItems, setPoItems] = useState<PurchaseItem[]>([]);

  const [supplierId, setSupplierId] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ productId: '', productName: '', quantity: '1', unitPrice: '0' }]);
  const [prodSearch, setProdSearch] = useState<string[]>(['']);

  const [receiveItems, setReceiveItems] = useState<Record<string, { quantity: string; expiryDate: string }>>({});
  const [slipFile, setSlipFile] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const filtered = (pos ?? []).filter(p => {
    const matchTab = !tab || p.status === tab;
    const matchSearch = p.poId.toLowerCase().includes(search.toLowerCase()) ||
      (p.supplierName ?? '').toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const filteredSuppliers = (suppliers ?? []).filter(s =>
    s.supplierName.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  function openCreate() {
    setSupplierId(''); setSupplierSearch('');
    setLines([{ productId: '', productName: '', quantity: '1', unitPrice: '0' }]);
    setProdSearch(['']); setErr(''); setModal('create');
  }

  async function openDetail(po: PurchaseOrder) {
    setSelected(po); setErr('');
    try {
      const data = await apiFetch<PurchaseOrder>(`/purchase-orders/${po.poId}`, { token: token! });
      setPoItems(data.items ?? []);
    } catch { setPoItems([]); }
    setModal('detail');
  }

  async function openReceive(po: PurchaseOrder) {
    setSelected(po); setErr(''); setSlipFile(null);
    try {
      const data = await apiFetch<PurchaseOrder>(`/purchase-orders/${po.poId}`, { token: token! });
      const items = data.items ?? [];
      setPoItems(items);
      const init: Record<string, { quantity: string; expiryDate: string }> = {};
      items.forEach(it => { init[it.poItemId] = { quantity: String(it.quantity), expiryDate: '' }; });
      setReceiveItems(init);
    } catch { setPoItems([]); }
    setModal('receive');
  }

  function addLine() {
    setLines(l => [...l, { productId: '', productName: '', quantity: '1', unitPrice: '0' }]);
    setProdSearch(s => [...s, '']);
  }
  function removeLine(i: number) {
    setLines(l => l.filter((_, idx) => idx !== i));
    setProdSearch(s => s.filter((_, idx) => idx !== i));
  }
  function selectProduct(lineIdx: number, p: Product) {
    setLines(l => l.map((line, i) => i === lineIdx
      ? { ...line, productId: p.productId, productName: p.productName, unitPrice: String(p.costPrice) }
      : line));
    setProdSearch(s => s.map((v, i) => i === lineIdx ? p.productName : v));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) { setErr('กรุณาเลือกซัพพลายเออร์'); return; }
    if (lines.some(l => !l.productId)) { setErr('กรุณาเลือกสินค้าทุกรายการ'); return; }
    setBusy(true); setErr('');
    try {
      const body = {
        supplierId,
        items: lines.map(l => ({ productId: l.productId, quantity: parseInt(l.quantity), unitPrice: parseFloat(l.unitPrice) })),
      };
      await apiFetch('/purchase-orders', { method: 'POST', body: JSON.stringify(body), token: token! });
      setSuccess('สร้างใบสั่งซื้อสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handleReceive(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const fd = new FormData();
      const items = poItems.map(it => ({
        poItemId: it.poItemId,
        quantity: parseInt(receiveItems[it.poItemId]?.quantity ?? String(it.quantity)),
        expiryDate: receiveItems[it.poItemId]?.expiryDate || undefined,
      }));
      fd.append('items', JSON.stringify(items));
      if (slipFile) fd.append('slip', slipFile);
      await apiFetch(`/purchase-orders/${selected!.poId}/receive`, {
        method: 'POST', token: token!, body: fd,
      });
      setSuccess('รับสินค้าสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handleCancel(po: PurchaseOrder) {
    if (!confirm('ยกเลิกใบสั่งซื้อ?')) return;
    try {
      await apiFetch(`/purchase-orders/${po.poId}/cancel`, { method: 'PATCH', token: token! });
      setSuccess('ยกเลิกสำเร็จ'); mutate();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ใบสั่งซื้อ</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการใบสั่งซื้อสินค้า</p>
        </div>
        {canCreate && (
          <button onClick={openCreate}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium">
            + สร้างใบสั่งซื้อ
          </button>
        )}
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {err     && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาใบสั่งซื้อ..."
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === t.key ? 'bg-primary-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}>{t.label}</button>
            ))}
          </div>
        </div>
        {!pos ? <div className="p-4"><TableSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>{['รหัส','วันที่','ซัพพลายเออร์','ยอดรวม','สถานะ','การดำเนินการ'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">ไม่พบใบสั่งซื้อ</td></tr>
                ) : filtered.map(po => (
                  <tr key={po.poId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{po.poId}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(po.poDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{po.supplierName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{po.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} ฿</td>
                    <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                    <td className="px-4 py-3 flex gap-2 flex-wrap">
                      <button onClick={() => openDetail(po)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">รายละเอียด</button>
                      {canReceive && po.status === 'Pending' && (
                        <button onClick={() => openReceive(po)}
                          className="px-3 py-1 border border-green-200 text-green-600 rounded-lg text-xs hover:bg-green-50">รับสินค้า</button>
                      )}
                      {canCreate && po.status === 'Pending' && (
                        <button onClick={() => handleCancel(po)}
                          className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50">ยกเลิก</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create PO Modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="สร้างใบสั่งซื้อ" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ซัพพลายเออร์ *</label>
            <div className="relative">
              <input
                value={supplierId ? (suppliers ?? []).find(s => s.supplierId === supplierId)?.supplierName ?? supplierSearch : supplierSearch}
                onChange={e => { setSupplierSearch(e.target.value); setSupplierId(''); }}
                placeholder="ค้นหาซัพพลายเออร์..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {supplierSearch && !supplierId && filteredSuppliers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredSuppliers.map(s => (
                    <button key={s.supplierId} type="button"
                      onClick={() => { setSupplierId(s.supplierId); setSupplierSearch(s.supplierName); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{s.supplierName}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">รายการสินค้า</label>
              <button type="button" onClick={addLine}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium">+ เพิ่มรายการ</button>
            </div>
            <div className="space-y-2">
              {lines.map((line, i) => {
                const filteredProds = (products ?? []).filter(p =>
                  p.active && (p.productName.toLowerCase().includes(prodSearch[i]?.toLowerCase() ?? '') ||
                  p.productId.toLowerCase().includes(prodSearch[i]?.toLowerCase() ?? ''))
                );
                return (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="flex-1 relative">
                      <input
                        value={line.productId ? line.productName : (prodSearch[i] ?? '')}
                        onChange={e => {
                          setProdSearch(s => s.map((v, idx) => idx === i ? e.target.value : v));
                          setLines(l => l.map((ln, idx) => idx === i ? { ...ln, productId: '', productName: '' } : ln));
                        }}
                        placeholder="ค้นหาสินค้า..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      {(prodSearch[i] ?? '') && !line.productId && filteredProds.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredProds.slice(0, 10).map(p => (
                            <button key={p.productId} type="button" onClick={() => selectProduct(i, p)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                              {p.productName}
                              <span className="text-gray-400 ml-2 text-xs">ราคาทุน: {p.costPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
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
              {busy ? 'กำลังสร้าง...' : 'สร้างใบสั่งซื้อ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="รายละเอียดใบสั่งซื้อ" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['รหัสใบสั่งซื้อ', selected.poId],
                ['วันที่', new Date(selected.poDate).toLocaleDateString('th-TH')],
                ['ซัพพลายเออร์', selected.supplierName ?? '—'],
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
            {selected.slipUrl && (
              <div>
                <div className="text-gray-400 text-xs mb-1">สลิป</div>
                <img src={selected.slipUrl} alt="slip" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">รายการสินค้า</h3>
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>{['สินค้า','จำนวน','ราคา/หน่วย','รวม'].map(h =>
                    <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {poItems.map(it => (
                    <tr key={it.poItemId}>
                      <td className="px-3 py-2">{it.productName}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
                      <td className="px-3 py-2">{it.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2">{(it.quantity * it.unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Receive Modal */}
      <Modal open={modal === 'receive'} onClose={() => setModal(null)} title="รับสินค้าเข้าคลัง" size="lg">
        {selected && (
          <form onSubmit={handleReceive} className="space-y-4">
            {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
            <p className="text-sm text-gray-600">ใบสั่งซื้อ: <span className="font-mono font-medium">{selected.poId}</span></p>
            <div className="space-y-3">
              {poItems.map(it => (
                <div key={it.poItemId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{it.productName}</div>
                    <div className="text-xs text-gray-400">จำนวนในใบสั่งซื้อ: {it.quantity}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <input type="number" min="0" max={it.quantity}
                      value={receiveItems[it.poItemId]?.quantity ?? String(it.quantity)}
                      onChange={e => setReceiveItems(r => ({ ...r, [it.poItemId]: { ...r[it.poItemId], quantity: e.target.value } }))}
                      placeholder="จำนวน"
                      className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <input type="date"
                      value={receiveItems[it.poItemId]?.expiryDate ?? ''}
                      onChange={e => setReceiveItems(r => ({ ...r, [it.poItemId]: { ...r[it.poItemId], expiryDate: e.target.value } }))}
                      className="w-36 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สลิปการชำระเงิน</label>
              <input type="file" accept="image/*" onChange={e => setSlipFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">ยกเลิก</button>
              <button type="submit" disabled={busy}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-60">
                {busy ? 'กำลังบันทึก...' : 'ยืนยันการรับสินค้า'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
