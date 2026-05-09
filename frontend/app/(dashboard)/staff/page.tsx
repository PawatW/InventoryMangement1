'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/Modal';
import { TableSkeleton } from '@/components/SkeletonLoader';
import type { Staff } from '@/lib/types';

interface Form { staffName: string; email: string; password: string; role: string; phone: string }
const EMPTY: Form = { staffName: '', email: '', password: '', role: 'WAREHOUSE', phone: '' };

const ROLES = ['ADMIN','WAREHOUSE','PROCUREMENT','SALES','TECHNICIAN','FOREMAN'];
const ROLE_TH: Record<string, string> = {
  ADMIN: 'ผู้ดูแลระบบ', WAREHOUSE: 'คลังสินค้า', PROCUREMENT: 'จัดซื้อ',
  SALES: 'ขาย', TECHNICIAN: 'ช่างเทคนิค', FOREMAN: 'หัวหน้างาน',
};

export default function StaffPage() {
  const { token } = useAuth();
  const { data: staff, mutate } = useAuthedSWR<Staff[]>('/staff', token);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');

  const filtered = (staff ?? []).filter(s =>
    s.staffName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.staffId.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() { setForm(EMPTY); setErr(''); setModal('create'); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await apiFetch('/staff', { method: 'POST', body: JSON.stringify(form), token: token! });
      setSuccess('เพิ่มพนักงานสำเร็จ'); mutate(); setModal(null);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
    finally { setBusy(false); }
  }

  async function handleToggleActive(s: Staff) {
    if (!confirm(`${s.active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'} ${s.staffName}?`)) return;
    try {
      await apiFetch(`/staff/${s.staffId}/${s.active ? 'deactivate' : 'activate'}`, { method: 'PATCH', token: token! });
      setSuccess('อัปเดตสถานะสำเร็จ'); mutate();
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด'); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">พนักงาน</h1>
          <p className="text-gray-500 text-sm mt-1">จัดการบัญชีผู้ใช้งานระบบ</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium">
          + เพิ่มพนักงาน
        </button>
      </div>

      {success && <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}
      {err     && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{err}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาพนักงาน..."
            className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        {!staff ? <div className="p-4"><TableSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>{['รหัส','ชื่อ','อีเมล','เบอร์โทร','บทบาท','สถานะ','การดำเนินการ'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">ไม่พบพนักงาน</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.staffId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.staffId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.staffName}</td>
                    <td className="px-4 py-3 text-gray-500">{s.email}</td>
                    <td className="px-4 py-3 text-gray-500">{s.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {ROLE_TH[s.role] ?? s.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(s)}
                        className={`px-3 py-1 rounded-lg text-xs ${s.active
                          ? 'border border-red-200 text-red-600 hover:bg-red-50'
                          : 'border border-green-200 text-green-600 hover:bg-green-50'}`}>
                        {s.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title="เพิ่มพนักงาน" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
            <input required value={form.staffName} onChange={e => setForm(f => ({ ...f, staffName: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน *</label>
            <input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทร</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท *</label>
            <select required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {ROLES.map(r => (
                <option key={r} value={r}>{ROLE_TH[r]}</option>
              ))}
            </select>
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
    </div>
  );
}
