const STATUS_MAP: Record<string, { label: string; className: string }> = {
  Confirmed:        { label: 'ยืนยันแล้ว',       className: 'bg-blue-100 text-blue-700' },
  Pending:          { label: 'กำลังดำเนินการ',    className: 'bg-yellow-100 text-yellow-700' },
  Closed:           { label: 'ปิดแล้ว',            className: 'bg-gray-100 text-gray-600' },
  'Awaiting Approval': { label: 'รอการอนุมัติ',   className: 'bg-orange-100 text-orange-700' },
  Approved:         { label: 'อนุมัติแล้ว',        className: 'bg-green-100 text-green-700' },
  Rejected:         { label: 'ถูกปฏิเสธ',          className: 'bg-red-100 text-red-700' },
  'New order':      { label: 'ใบสั่งซื้อใหม่',    className: 'bg-indigo-100 text-indigo-700' },
  Received:         { label: 'รับสินค้าแล้ว',      className: 'bg-emerald-100 text-emerald-700' },
  IN:               { label: 'รับเข้า',             className: 'bg-green-100 text-green-700' },
  OUT:              { label: 'จ่ายออก',             className: 'bg-red-100 text-red-700' },
  ADJUST:           { label: 'ปรับปรุง',            className: 'bg-purple-100 text-purple-700' },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
