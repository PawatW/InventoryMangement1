'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import { TableSkeleton } from '@/components/SkeletonLoader';
import type { Supplier } from '@/lib/types';

interface Form { supplierName: string; phone: string; email: string; address: string }
const EMPTY: Form = { supplierName: '', phone: '', email: '', address: '' };

export default function SuppliersPage() {
  const { token, role } = useAuth();
  const { data: suppliers, mutate } = useAuthedSWR<Supplier[]>('/suppliers', token);

  const canEdit = ['PROCUREMENT','ADMIN'].includes(role ?? '');
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState<'create'|'edit'|null>(null);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [form, setForm]         = useState<Form>(EMPTY);
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState('');
  const [success, setSuccess]   = useState('');

  function openCreate() { setForm(EMPTY); setSelected(null); setErr(''); setModal('create'); }
  function openEdit(s: Supplier) {
    setForm({ supplierName: s.supplierName, phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '' });
    setSelected(s); setErr(''); setModal('edit');
  }

  const filtered = (suppliers ?? []).filter(s =>
    s.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    s.supplierId.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      if (modal === 'create') {
        await apiFetch('/suppliers', { method: 'POST', body: JSON.stringify(form), token: token! });
        setSuccess('เพิ่มซัพพลายเออร์สำเร็จ');
      } else if (selected) {
        await apiFetch(`/suppliers/${selected.supplierId}`, { method: 'PUT', body: JSON.stringify(form), token: token! });
        setSuccess('แก้ไขข้อมูลสำเร็จ');
      }
      mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handleDeactivate(s: Supplier) {
    if (!confirm(`ยืนยันการลบ ${s.supplierName}?`)) return;
    try {
      await apiFetch(`/suppliers/${s.supplierId}`, { method: 'DELETE', token: token! });
      setSuccess('ลบสำเร็จ'); mutate();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ซัพพลายเออร์</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการข้อมูลซัพพลายเออร์</p>
        </div>
        {canEdit && (
          <button onClick={openCreate}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium">
            + เพิ่มซัพพลายเออร์
          </button>
        )}
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {err     && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาซัพพลายเออร์..."
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        {!suppliers ? <div className="p-4"><TableSkeleton /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>{['รหัส','ชื่อ','เบอร์โทร','อีเมล','การดำเนินการ'].map(h =>
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td></tr>
              ) : filtered.map(s => (
                <tr key={s.supplierId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.supplierId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.supplierName}</td>
                  <td className="px-4 py-3 text-gray-500">{s.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{s.email ?? '—'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {canEdit && <>
                      <button onClick={() => openEdit(s)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-xs hover:bg-gray-50">แก้ไข</button>
                      <button onClick={() => handleDeactivate(s)}
                        className="px-3 py-1 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50">ลบ</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'เพิ่มซัพพลายเออร์' : 'แก้ไขซัพพลายเออร์'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
          {[
            { key: 'supplierName', label: 'ชื่อซัพพลายเออร์ *', required: true },
            { key: 'phone',        label: 'เบอร์โทร' },
            { key: 'email',        label: 'อีเมล', type: 'email' },
            { key: 'address',      label: 'ที่อยู่' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type ?? 'text'} required={f.required}
                value={(form as Record<string,string>)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          ))}
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
    </div>
  );
}
