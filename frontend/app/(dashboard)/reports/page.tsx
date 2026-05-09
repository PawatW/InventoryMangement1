'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAuthedSWR } from '@/lib/swr';
import { TableSkeleton } from '@/components/SkeletonLoader';
import type { StockTransaction } from '@/lib/types';

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function ReportsPage() {
  const { token } = useAuth();
  const { data: transactions } = useAuthedSWR<StockTransaction[]>('/stock/transactions', token);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(toDateStr(firstOfMonth));
  const [endDate, setEndDate] = useState(toDateStr(today));
  const [productFilter, setProductFilter] = useState('');

  const outTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      if (t.type !== 'OUT') return false;
      const d = t.transactionDate.split('T')[0];
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      if (productFilter && !(t.productName ?? '').toLowerCase().includes(productFilter.toLowerCase())) return false;
      return true;
    });
  }, [transactions, startDate, endDate, productFilter]);

  const grouped = useMemo(() => {
    const map: Record<string, { productName: string; totalQty: number; txCount: number }> = {};
    outTransactions.forEach(t => {
      if (!map[t.productId]) {
        map[t.productId] = { productName: t.productName ?? t.productId, totalQty: 0, txCount: 0 };
      }
      map[t.productId].totalQty += t.quantity;
      map[t.productId].txCount += 1;
    });
    return Object.entries(map)
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.totalQty - a.totalQty);
  }, [outTransactions]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">รายงาน</h1>
          <p className="text-gray-500 text-sm mt-1">รายงานการเบิกจ่ายสินค้า</p>
        </div>
        <button onClick={handlePrint}
          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors font-medium print:hidden">
          พิมพ์ / บันทึก PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 print:hidden">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">วันที่เริ่มต้น</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">วันที่สิ้นสุด</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">สินค้า</label>
            <input value={productFilter} onChange={e => setProductFilter(e.target.value)}
              placeholder="กรองตามชื่อสินค้า..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-48" />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'รายการเบิกจ่าย', value: outTransactions.length + ' รายการ' },
          { label: 'จำนวนสินค้าที่เบิก', value: outTransactions.reduce((s, t) => s + t.quantity, 0).toLocaleString('th-TH') + ' ชิ้น' },
          { label: 'ประเภทสินค้า', value: grouped.length + ' รายการ' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">{c.label}</div>
            <div className="text-xl font-bold text-gray-800">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Grouped by product */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">สรุปตามสินค้า</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {startDate} ถึง {endDate}
          </p>
        </div>
        {!transactions ? <div className="p-4"><TableSkeleton /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>{['สินค้า','จำนวนเบิก (ชิ้น)','จำนวนครั้ง'].map(h =>
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grouped.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">ไม่มีข้อมูลในช่วงเวลาที่เลือก</td></tr>
              ) : grouped.map(g => (
                <tr key={g.productId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{g.productName}</td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{g.totalQty.toLocaleString('th-TH')}</td>
                  <td className="px-4 py-3 text-gray-500">{g.txCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-700">รายการเบิกจ่ายทั้งหมด</h2>
        </div>
        {!transactions ? <div className="p-4"><TableSkeleton /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>{['วันที่','สินค้า','จำนวน','พนักงาน','อ้างอิง'].map(h =>
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {outTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">ไม่มีรายการ</td></tr>
                ) : outTransactions.map(t => (
                  <tr key={t.transactionId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{new Date(t.transactionDate).toLocaleDateString('th-TH')}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{t.productName ?? t.productId}</td>
                    <td className="px-4 py-3 text-red-600 font-semibold">-{t.quantity}</td>
                    <td className="px-4 py-3 text-gray-500">{t.staffName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{t.referenceId ?? t.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
