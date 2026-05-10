'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import { TableSkeleton } from '@/components/SkeletonLoader';
import type { Product, Supplier, ProductBatch } from '@/lib/types';

interface ProductForm {
  productName: string; description: string; unit: string;
  supplierId: string; initialQty: string; initialCost: string; sellPrice: string;
}
const EMPTY_FORM: ProductForm = { productName: '', description: '', unit: '', supplierId: '', initialQty: '0', initialCost: '0', sellPrice: '0' };

interface PriceForm { sellPrice: string }

export default function InventoryPage() {
  const { token, role } = useAuth();
  const { data: products, mutate } = useAuthedSWR<Product[]>('/products', token);
  const { data: suppliers } = useAuthedSWR<Supplier[]>('/suppliers', token);

  const canEdit = ['WAREHOUSE', 'PROCUREMENT', 'ADMIN'].includes(role ?? '');
  const canSell  = ['SALES', 'ADMIN'].includes(role ?? '');

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'detail' | 'price' | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [priceForm, setPriceForm] = useState<PriceForm>({ sellPrice: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = (products ?? []).filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.productId.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuppliers = (suppliers ?? []).filter(s =>
    s.supplierName.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  function openCreate() {
    setForm(EMPTY_FORM); setImageFile(null); setErr('');
    setSupplierSearch(''); setModal('create');
  }

  async function openDetail(p: Product) {
    setSelected(p); setErr('');
    try {
      const data = await apiFetch<ProductBatch[]>(`/products/${p.productId}/batches`, { token: token! });
      setBatches(data);
    } catch { setBatches([]); }
    setModal('detail');
  }

  function openEdit(p: Product) {
    setForm({
      productName: p.productName, description: p.description ?? '',
      unit: p.unit ?? '', supplierId: p.supplierId ?? '',
      initialQty: String(p.quantity), initialCost: String(p.costPrice),
      sellPrice: String(p.sellPrice),
    });
    setSupplierSearch(p.supplierName ?? '');
    setSelected(p); setErr(''); setModal('edit');
  }

  function openPrice(p: Product) {
    setSelected(p); setPriceForm({ sellPrice: String(p.sellPrice) }); setErr(''); setModal('price');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('productName', form.productName);
      fd.append('description', form.description);
      fd.append('unit', form.unit);
      fd.append('supplierId', form.supplierId);
      fd.append('initialQty', form.initialQty);
      fd.append('initialCost', form.initialCost);
      fd.append('sellPrice', form.sellPrice);
      if (imageFile) fd.append('image', imageFile);

      if (modal === 'create') {
        await apiFetch('/products', {
          method: 'POST', token: token!,
          body: fd,
        });
        setSuccess('เพิ่มสินค้าสำเร็จ');
      } else if (selected) {
        await apiFetch(`/products/${selected.productId}`, {
          method: 'PUT', token: token!,
          body: fd,
        });
        setSuccess('แก้ไขสินค้าสำเร็จ');
      }
      mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handlePriceUpdate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await apiFetch(`/products/${selected!.productId}/sell-price`, {
        method: 'PATCH', token: token!,
        body: JSON.stringify({ sellPrice: parseFloat(priceForm.sellPrice) }),
      });
      setSuccess('อัปเดตราคาขายสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handleToggle(p: Product) {
    if (!confirm(`${p.active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'} ${p.productName}?`)) return;
    try {
      await apiFetch(`/products/${p.productId}/${p.active ? 'deactivate' : 'activate'}`, { method: 'PATCH', token: token! });
      setSuccess('อัปเดตสถานะสำเร็จ'); mutate();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  }

  const selectedSupplier = (suppliers ?? []).find(s => s.supplierId === form.supplierId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">คลังสินค้า</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการสินค้าและสต็อก</p>
        </div>
        {canEdit && (
          <button onClick={openCreate}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium">
            + เพิ่มสินค้า
          </button>
        )}
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {err     && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาสินค้า..."
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        {!products ? <div className="p-4"><TableSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>{['รหัส','ชื่อสินค้า','หน่วย','ราคาทุน','ราคาขาย','คงเหลือ','สถานะ','การดำเนินการ'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">ไม่พบสินค้า</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.productId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.imageUrl && <img src={p.imageUrl} alt={p.productName} className="w-8 h-8 rounded-lg object-cover" />}
                        <div>
                          <div className="font-medium text-gray-800">{p.productName}</div>
                          {p.supplierName && <div className="text-xs text-gray-400">{p.supplierName}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.unit ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.costPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-gray-600">{p.sellPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.quantity <= 0 ? 'text-red-600' : p.quantity <= 10 ? 'text-amber-600' : 'text-gray-800'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 flex-wrap">
                      <button onClick={() => openDetail(p)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">รายละเอียด</button>
                      {canEdit && (
                        <button onClick={() => openEdit(p)}
                          className="px-3 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">แก้ไข</button>
                      )}
                      {canSell && (
                        <button onClick={() => openPrice(p)}
                          className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg text-xs hover:bg-blue-50">ราคาขาย</button>
                      )}
                      {canEdit && (
                        <button onClick={() => handleToggle(p)}
                          className={`px-3 py-1 rounded-lg text-xs ${p.active ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-green-200 text-green-600 hover:bg-green-50'}`}>
                          {p.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'create' ? 'เพิ่มสินค้า' : 'แก้ไขสินค้า'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า *</label>
              <input required value={form.productName} onChange={e => setForm(p => ({ ...p, productName: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หน่วย</label>
              <input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ซัพพลายเออร์</label>
              <div className="relative">
                <input value={selectedSupplier ? selectedSupplier.supplierName : supplierSearch}
                  onChange={e => { setSupplierSearch(e.target.value); setForm(p => ({ ...p, supplierId: '' })); }}
                  placeholder="ค้นหาซัพพลายเออร์..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {supplierSearch && !form.supplierId && filteredSuppliers.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSuppliers.map(s => (
                      <button key={s.supplierId} type="button"
                        onClick={() => { setForm(p => ({ ...p, supplierId: s.supplierId })); setSupplierSearch(s.supplierName); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{s.supplierName}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {modal === 'create' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเริ่มต้น</label>
                  <input type="number" min="0" value={form.initialQty} onChange={e => setForm(p => ({ ...p, initialQty: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ราคาทุนเริ่มต้น</label>
                  <input type="number" min="0" step="0.01" value={form.initialCost} onChange={e => setForm(p => ({ ...p, initialCost: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย</label>
              <input type="number" min="0" step="0.01" value={form.sellPrice} onChange={e => setForm(p => ({ ...p, sellPrice: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">รูปภาพสินค้า</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            </div>
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

      {/* Price Modal */}
      <Modal open={modal === 'price'} onClose={() => setModal(null)} title="แก้ไขราคาขาย" size="sm">
        <form onSubmit={handlePriceUpdate} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ราคาขาย *</label>
            <input type="number" min="0" step="0.01" required value={priceForm.sellPrice}
              onChange={e => setPriceForm({ sellPrice: e.target.value })}
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

      {/* Detail Modal */}
      <Modal open={modal === 'detail'} onClose={() => setModal(null)} title="รายละเอียดสินค้า" size="xl">
        {selected && (
          <div className="space-y-4">
            <div className="flex gap-4">
              {selected.imageUrl && (
                <img src={selected.imageUrl} alt={selected.productName} className="w-24 h-24 rounded-xl object-cover" />
              )}
              <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                {[
                  ['รหัส', selected.productId],
                  ['ชื่อสินค้า', selected.productName],
                  ['หน่วย', selected.unit ?? '—'],
                  ['ซัพพลายเออร์', selected.supplierName ?? '—'],
                  ['ราคาทุน', selected.costPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })],
                  ['ราคาขาย', selected.sellPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })],
                  ['คงเหลือ', String(selected.quantity)],
                  ['สถานะ', selected.active ? 'ใช้งาน' : 'ปิดใช้งาน'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="text-gray-400 text-xs">{label}</div>
                    <div className="font-medium text-gray-800">{val}</div>
                  </div>
                ))}
              </div>
            </div>
            {selected.description && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selected.description}</div>
            )}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">ล็อตสินค้า (FIFO)</h3>
              {batches.length === 0 ? (
                <p className="text-gray-400 text-sm">ไม่มีล็อตสินค้า</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>{['รหัสล็อต','วันที่รับ','จำนวนรับ','คงเหลือ','ราคาทุน/หน่วย','วันหมดอายุ'].map(h =>
                        <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {batches.map(b => (
                        <tr key={b.batchId}>
                          <td className="px-3 py-2 font-mono">{b.batchId}</td>
                          <td className="px-3 py-2">{new Date(b.receivedDate).toLocaleDateString('th-TH')}</td>
                          <td className="px-3 py-2">{b.quantityIn}</td>
                          <td className="px-3 py-2 font-semibold">{b.quantityRemaining}</td>
                          <td className="px-3 py-2">{b.unitCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                          <td className="px-3 py-2">{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('th-TH') : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
