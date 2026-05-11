-- ============================================================
-- Mock Data for Development / Testing
-- รหัสผ่านทุกบัญชี: defaultPassword123
-- ============================================================

-- ============================================================
-- Staff (พนักงาน)
-- ============================================================
INSERT INTO Staff (staff_id, staff_name, role, phone, email, password, active) VALUES
('STF002', 'สมชาย คงดี',        'WAREHOUSE',   '081-111-0002', 'warehouse@company.com',   '$2a$12$XjqpAEgrAfjYiwizTtrR0e/uAS8ZMho5QH9vqG52/B196DQnvecCG', TRUE),
('STF003', 'สมหญิง ใจดี',       'PROCUREMENT', '081-111-0003', 'procurement@company.com', '$2a$12$XjqpAEgrAfjYiwizTtrR0e/uAS8ZMho5QH9vqG52/B196DQnvecCG', TRUE),
('STF004', 'สมศักดิ์ รักงาน',   'SALES',       '081-111-0004', 'sales@company.com',       '$2a$12$XjqpAEgrAfjYiwizTtrR0e/uAS8ZMho5QH9vqG52/B196DQnvecCG', TRUE),
('STF005', 'วิชัย มีฝีมือ',     'TECHNICIAN',  '081-111-0005', 'technician@company.com',  '$2a$12$XjqpAEgrAfjYiwizTtrR0e/uAS8ZMho5QH9vqG52/B196DQnvecCG', TRUE),
('STF006', 'อภิชาต ดูแล',       'FOREMAN',     '081-111-0006', 'foreman@company.com',     '$2a$12$XjqpAEgrAfjYiwizTtrR0e/uAS8ZMho5QH9vqG52/B196DQnvecCG', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Suppliers (ซัพพลายเออร์)
-- ============================================================
INSERT INTO Supplier (supplier_id, supplier_name, address, phone, email, active) VALUES
('SUP001', 'บริษัท อิเล็กทรอนิกส์ไทย จำกัด',     '123 ถ.พหลโยธิน แขวงลาดยาว กรุงเทพฯ 10900', '02-111-1111', 'sales@electrothai.co.th',  TRUE),
('SUP002', 'บริษัท อะไหล่ยนต์กรุงเทพ จำกัด',     '456 ถ.สุขุมวิท แขวงคลองเตย  กรุงเทพฯ 10110', '02-222-2222', 'info@bkkautopart.co.th',   TRUE),
('SUP003', 'บริษัท เครื่องมือช่าง ซัพพลาย จำกัด', '789 ถ.รัชดาภิเษก แขวงลาดยาว กรุงเทพฯ 10900', '02-333-3333', 'order@toolsupply.co.th',   TRUE)
ON CONFLICT (supplier_id) DO NOTHING;

-- ============================================================
-- Customers (ลูกค้า)
-- ============================================================
INSERT INTO Customer (customer_id, customer_name, address, phone, email, active) VALUES
('CUS001', 'บริษัท เทคโนพาร์ท จำกัด',          '11/1 ถ.พระราม 3 กรุงเทพฯ',   '02-501-1111', 'purchase@technopart.co.th',   TRUE),
('CUS002', 'บริษัท ออโต้เซอร์วิส ไทย จำกัด',  '22/2 ถ.เพชรเกษม นนทบุรี',    '02-502-2222', 'buy@autoservicethai.co.th',   TRUE),
('CUS003', 'ห้างหุ้นส่วนจำกัด พาวเวอร์เทค',    '33/3 นิคมอุตสาหกรรม บางปู',   '038-503-333', 'order@powertech-hp.co.th',    TRUE),
('CUS004', 'บริษัท อินดัสเทรียล โซลูชั่น จำกัด','44/4 ถ.กาญจนาภิเษก สมุทรปราการ','02-504-4444','info@industrialsol.co.th',  TRUE),
('CUS005', 'ร้านช่างสมชาย',                     '55 ถ.เจริญกรุง กรุงเทพฯ',     '081-505-5555', NULL,                          TRUE)
ON CONFLICT (customer_id) DO NOTHING;

-- ============================================================
-- Products (สินค้า)
-- ชื่อ | หน่วย | ราคาทุน | ราคาขาย | จำนวน (ต้องตรงกับยอดรวม batch)
-- ============================================================
INSERT INTO Product (product_id, product_name, description, unit, cost_price, sell_price, quantity, supplier_id, active) VALUES
('PROD001', 'มอเตอร์ไฟฟ้า 3 แรงม้า 380V',  'มอเตอร์ 3 เฟส 3HP ประสิทธิภาพสูง',            'ตัว',   2500.00, 3800.00, 30, 'SUP001', TRUE),
('PROD002', 'ปั๊มน้ำซับเมอร์ส 1.5 แรงม้า', 'ปั๊มจุ่ม สแตนเลส ท่อ 2 นิ้ว',                 'ตัว',   3200.00, 4900.00, 20, 'SUP001', TRUE),
('PROD003', 'สายไฟ VCT 2x1.5 มม.',          'สายไฟทองแดงอ่อน 2 แกน ขนาด 1.5 ตร.มม.',       'เมตร',    18.00,   29.00,150, 'SUP001', TRUE),
('PROD004', 'แบตเตอรี่ 12V 100Ah',          'แบตเตอรี่แห้ง VRLA ชาร์จได้ รับประกัน 1 ปี', 'ลูก',   2800.00, 4200.00, 15, 'SUP002', TRUE),
('PROD005', 'สวิทช์ควบคุมมอเตอร์ 3 เฟส',   'DOL Starter 7.5A กล่องพลาสติก IP44',           'ชุด',    650.00,  990.00, 50, 'SUP001', TRUE),
('PROD006', 'ตลับลูกปืน 6205-2RS',          'ลูกปืนร่อง ฝาปิดยาง ขนาด 25x52x15 มม.',       'ลูก',     85.00,  150.00, 80, 'SUP002', TRUE),
('PROD007', 'น้ำมันเครื่อง 10W-40 1 ลิตร', 'น้ำมันสังเคราะห์กึ่ง สำหรับเครื่องยนต์เบนซิน','กระป๋อง',  95.00,  160.00, 60, 'SUP002', TRUE),
('PROD008', 'ผ้าเบรกหน้า ชุดซ้าย-ขวา',     'ผ้าเบรกดิสก์ พร้อมเซ็นเซอร์ ใช้กับรถทั่วไป', 'ชุด',    480.00,  750.00, 25, 'SUP002', TRUE)
ON CONFLICT (product_id) DO NOTHING;

-- ============================================================
-- Product Batches (ล็อตสินค้า)
-- ============================================================
INSERT INTO ProductBatch (batch_id, product_id, po_id, received_date, quantity_in, quantity_remaining, unit_cost, expiry_date) VALUES
-- PROD001 มอเตอร์ไฟฟ้า  (2 batches, total remaining = 30)
('BATCH001', 'PROD001', NULL, '2025-01-15 09:00:00', 20, 20, 2450.00, NULL),
('BATCH002', 'PROD001', NULL, '2025-03-10 10:00:00', 10, 10, 2500.00, NULL),
-- PROD002 ปั๊มน้ำ  (1 batch, remaining = 20)
('BATCH003', 'PROD002', NULL, '2025-01-20 09:00:00', 20, 20, 3150.00, NULL),
-- PROD003 สายไฟ  (2 batches, total remaining = 150)
('BATCH004', 'PROD003', NULL, '2025-02-01 08:00:00', 100, 100, 17.50, NULL),
('BATCH005', 'PROD003', NULL, '2025-04-05 08:00:00',  50,  50, 18.00, NULL),
-- PROD004 แบตเตอรี่  (1 batch, remaining = 15)
('BATCH006', 'PROD004', NULL, '2025-02-10 09:00:00', 15, 15, 2750.00, '2027-02-10'),
-- PROD005 สวิทช์  (1 batch, remaining = 50)
('BATCH007', 'PROD005', NULL, '2025-01-25 10:00:00', 50, 50, 630.00, NULL),
-- PROD006 ลูกปืน  (2 batches, total remaining = 80)
('BATCH008', 'PROD006', NULL, '2025-01-10 09:00:00', 50, 50, 82.00, NULL),
('BATCH009', 'PROD006', NULL, '2025-04-01 09:00:00', 30, 30, 85.00, NULL),
-- PROD007 น้ำมันเครื่อง  (1 batch, remaining = 60)
('BATCH010', 'PROD007', NULL, '2025-03-01 09:00:00', 60, 60, 93.00, '2028-03-01'),
-- PROD008 ผ้าเบรก  (1 batch, remaining = 25)
('BATCH011', 'PROD008', NULL, '2025-02-20 09:00:00', 25, 25, 460.00, NULL)
ON CONFLICT (batch_id) DO NOTHING;

-- ============================================================
-- Stock Transactions (รายการรับเข้าคลัง - IN)
-- ============================================================
INSERT INTO StockTransaction (transaction_id, transaction_date, type, product_id, quantity, staff_id, description, batch_id) VALUES
('ST000001', '2025-01-15 09:00:00', 'IN', 'PROD001', 20, 'STF002', 'รับสินค้าเข้าคลัง (ล็อตเริ่มต้น)',  'BATCH001'),
('ST000002', '2025-01-20 09:00:00', 'IN', 'PROD002', 20, 'STF002', 'รับสินค้าเข้าคลัง (ล็อตเริ่มต้น)',  'BATCH003'),
('ST000003', '2025-02-01 08:00:00', 'IN', 'PROD003',100, 'STF002', 'รับสินค้าเข้าคลัง (ล็อตเริ่มต้น)',  'BATCH004'),
('ST000004', '2025-02-10 09:00:00', 'IN', 'PROD004', 15, 'STF002', 'รับสินค้าเข้าคลัง (ล็อตเริ่มต้น)',  'BATCH006'),
('ST000005', '2025-01-25 10:00:00', 'IN', 'PROD005', 50, 'STF002', 'รับสินค้าเข้าคลัง (ล็อตเริ่มต้น)',  'BATCH007'),
('ST000006', '2025-01-10 09:00:00', 'IN', 'PROD006', 50, 'STF002', 'รับสินค้าเข้าคลัง (ล็อตเริ่มต้น)',  'BATCH008'),
('ST000007', '2025-02-20 09:00:00', 'IN', 'PROD008', 25, 'STF002', 'รับสินค้าเข้าคลัง (ล็อตเริ่มต้น)',  'BATCH011'),
('ST000008', '2025-03-01 09:00:00', 'IN', 'PROD007', 60, 'STF002', 'รับสินค้าเข้าคลัง',                 'BATCH010'),
('ST000009', '2025-03-10 10:00:00', 'IN', 'PROD001', 10, 'STF002', 'รับสินค้าเข้าคลังล็อตใหม่',          'BATCH002'),
('ST000010', '2025-04-01 09:00:00', 'IN', 'PROD006', 30, 'STF002', 'รับสินค้าเข้าคลังล็อตใหม่',          'BATCH009'),
('ST000011', '2025-04-05 08:00:00', 'IN', 'PROD003', 50, 'STF002', 'รับสินค้าเข้าคลังล็อตใหม่',          'BATCH005')
ON CONFLICT (transaction_id) DO NOTHING;

-- ============================================================
-- Orders (คำสั่งซื้อ)
-- ============================================================
INSERT INTO "Order" (order_id, order_date, total_amount, status, customer_id, staff_id) VALUES
('ORD00001', '2025-04-10 10:30:00', 23300.00, 'Confirmed', 'CUS001', 'STF004'),
('ORD00002', '2025-04-12 14:00:00',  8400.00, 'Confirmed', 'CUS002', 'STF004'),
('ORD00003', '2025-04-15 09:00:00',  4500.00, 'New order', 'CUS003', 'STF004'),
('ORD00004', '2025-05-01 11:00:00', 12000.00, 'Confirmed', 'CUS004', 'STF004')
ON CONFLICT (order_id) DO NOTHING;

-- Order Items (รายการในคำสั่งซื้อ)
INSERT INTO OrderItem (order_item_id, order_id, product_id, quantity, unit_price, line_total, fulfilled_qty) VALUES
-- ORD00001: มอเตอร์ 3 ตัว + สวิทช์ 10 ชุด
('ITM00001', 'ORD00001', 'PROD001', 5, 3800.00, 19000.00, 0),
('ITM00002', 'ORD00001', 'PROD005', 5,  990.00,  4950.00, 0),
-- ORD00002: แบตเตอรี่ 2 ลูก
('ITM00003', 'ORD00002', 'PROD004', 2, 4200.00,  8400.00, 0),
-- ORD00003: ลูกปืน 30 ลูก
('ITM00004', 'ORD00003', 'PROD006', 30, 150.00,  4500.00, 0),
-- ORD00004: ปั๊มน้ำ 2 ตัว + สายไฟ 100 เมตร
('ITM00005', 'ORD00004', 'PROD002', 2, 4900.00,  9800.00, 0),
('ITM00006', 'ORD00004', 'PROD003',75,   29.00,  2175.00, 0)
ON CONFLICT (order_item_id) DO NOTHING;

-- ============================================================
-- Requests (คำขอเบิกสินค้า)
-- ============================================================
INSERT INTO Request (request_id, request_date, status, order_id, customer_id, staff_id, description, approved_by, approved_date) VALUES
-- REQ00001: เชื่อมกับ ORD00001, รอการอนุมัติ
('REQ00001', '2025-04-11 08:00:00', 'Awaiting Approval', 'ORD00001', 'CUS001', 'STF005',
 'ขอเบิกสินค้าสำหรับคำสั่งซื้อ ORD00001', NULL, NULL),
-- REQ00002: เชื่อมกับ ORD00002, อนุมัติแล้ว รอจัดส่ง
('REQ00002', '2025-04-13 09:00:00', 'Approved',          'ORD00002', 'CUS002', 'STF005',
 'ขอเบิกแบตเตอรี่สำหรับงานซ่อม', 'STF006', '2025-04-13 14:00:00'),
-- REQ00003: คำขอทั่วไป (ไม่ผูกกับ Order) รอการอนุมัติ
('REQ00003', '2025-04-20 10:00:00', 'Awaiting Approval', NULL,       NULL,     'STF005',
 'ขอเบิกอะไหล่สำหรับบำรุงรักษาเครื่องจักร', NULL, NULL),
-- REQ00004: ปิดแล้ว (จัดส่งครบ)
('REQ00004', '2025-03-15 09:00:00', 'Closed',             NULL,       NULL,     'STF005',
 'ขอเบิกลูกปืนสำหรับงานซ่อม', 'STF006', '2025-03-15 11:00:00')
ON CONFLICT (request_id) DO NOTHING;

-- Request Items
INSERT INTO RequestItem (request_item_id, request_id, product_id, quantity, fulfilled_qty) VALUES
-- REQ00001 items
('RIT00001', 'REQ00001', 'PROD001', 5, 0),
('RIT00002', 'REQ00001', 'PROD005', 5, 0),
-- REQ00002 items
('RIT00003', 'REQ00002', 'PROD004', 2, 0),
-- REQ00003 items
('RIT00004', 'REQ00003', 'PROD006',10, 0),
('RIT00005', 'REQ00003', 'PROD007', 5, 0),
-- REQ00004 items (closed — fulfilled_qty = quantity)
('RIT00006', 'REQ00004', 'PROD006',10,10)
ON CONFLICT (request_item_id) DO NOTHING;

-- ============================================================
-- Purchase Orders (ใบสั่งซื้อ) — Pending
-- ============================================================
INSERT INTO PurchaseOrder (po_id, po_date, supplier_id, staff_id, total_amount, status) VALUES
('PO000001', '2025-05-05 09:00:00', 'SUP001', 'STF003', 162000.00, 'Pending'),
('PO000002', '2025-05-07 11:00:00', 'SUP002', 'STF003',  34000.00, 'Pending')
ON CONFLICT (po_id) DO NOTHING;

INSERT INTO PurchaseItem (po_item_id, po_id, product_id, quantity, unit_price) VALUES
-- PO000001: สั่งมอเตอร์ + สวิทช์
('POI00001', 'PO000001', 'PROD001', 50, 2500.00),
('POI00002', 'PO000001', 'PROD005', 30,  650.00),
('POI00003', 'PO000001', 'PROD002', 10, 3200.00),
-- PO000002: สั่งอะไหล่ยนต์
('POI00004', 'PO000002', 'PROD006', 100,  85.00),
('POI00005', 'PO000002', 'PROD008',  30, 480.00),
('POI00006', 'PO000002', 'PROD007',  50,  95.00)
ON CONFLICT (po_item_id) DO NOTHING;
