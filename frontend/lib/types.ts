export interface Staff {
  staffId: string;
  staffName: string;
  role: string;
  phone?: string;
  email: string;
  active: boolean;
}

export interface Supplier {
  supplierId: string;
  supplierName: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface Customer {
  customerId: string;
  customerName: string;
  address?: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface Product {
  productId: string;
  productName: string;
  description?: string;
  unit?: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  supplierId?: string;
  supplierName?: string;
  imageUrl?: string;
  active: boolean;
  createdByStaffId?: string;
}

export interface Order {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  customerId?: string;
  customerName?: string;
  staffId?: string;
  staffName?: string;
}

export interface OrderItem {
  orderItemId: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  fulfilledQty: number;
  remainingQty: number;
}

export interface Request {
  requestId: string;
  requestDate: string;
  status: string;
  orderId?: string;
  customerId?: string;
  customerName?: string;
  staffId?: string;
  staffName?: string;
  description?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
}

export interface RequestItem {
  requestItemId: string;
  requestId: string;
  productId: string;
  productName?: string;
  quantity: number;
  fulfilledQty: number;
  remainingQty: number;
}

export interface StockTransaction {
  transactionId: string;
  transactionDate: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  productId: string;
  productName?: string;
  quantity: number;
  staffId: string;
  staffName?: string;
  description?: string;
  batchId?: string;
  referenceId?: string;
}

export interface ProductBatch {
  batchId: string;
  productId: string;
  productName?: string;
  poId?: string;
  receivedDate: string;
  quantityIn: number;
  quantityRemaining: number;
  unitCost: number;
  expiryDate?: string;
}

export interface PurchaseOrder {
  poId: string;
  poDate: string;
  supplierId?: string;
  supplierName?: string;
  staffId?: string;
  staffName?: string;
  totalAmount: number;
  status: string;
  slipUrl?: string;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  poItemId: string;
  poId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
}
