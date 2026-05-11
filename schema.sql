-- ============================================================
-- Inventory Management System — PostgreSQL Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS Staff (
    staff_id   VARCHAR(20) PRIMARY KEY,
    staff_name VARCHAR(100) NOT NULL,
    role       VARCHAR(50)  NOT NULL,
    phone      VARCHAR(20),
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Supplier (
    supplier_id   VARCHAR(20) PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    address       TEXT,
    phone         VARCHAR(20),
    email         VARCHAR(100) UNIQUE,
    active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Customer (
    customer_id   VARCHAR(20) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    address       TEXT,
    phone         VARCHAR(20),
    email         VARCHAR(100) UNIQUE,
    active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Product (
    product_id   VARCHAR(20) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    description  TEXT,
    unit         VARCHAR(30),
    cost_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
    sell_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity     INT NOT NULL DEFAULT 0,
    supplier_id  VARCHAR(20) REFERENCES Supplier(supplier_id),
    image_url    TEXT,
    active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "Order" (
    order_id     VARCHAR(20) PRIMARY KEY,
    order_date   TIMESTAMP NOT NULL DEFAULT NOW(),
    total_amount DECIMAL(12,2),
    status       VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    customer_id  VARCHAR(20) REFERENCES Customer(customer_id),
    staff_id     VARCHAR(20) REFERENCES Staff(staff_id)
);

CREATE TABLE IF NOT EXISTS OrderItem (
    order_item_id  VARCHAR(20) PRIMARY KEY,
    order_id       VARCHAR(20) NOT NULL REFERENCES "Order"(order_id),
    product_id     VARCHAR(20) NOT NULL REFERENCES Product(product_id),
    quantity       INT NOT NULL,
    unit_price     DECIMAL(10,2) NOT NULL,
    line_total     DECIMAL(12,2) NOT NULL,
    fulfilled_qty  INT NOT NULL DEFAULT 0,
    remaining_qty  INT GENERATED ALWAYS AS (quantity - fulfilled_qty) STORED
);

CREATE TABLE IF NOT EXISTS Request (
    request_id    VARCHAR(20) PRIMARY KEY,
    request_date  TIMESTAMP NOT NULL DEFAULT NOW(),
    status        VARCHAR(50) NOT NULL DEFAULT 'Awaiting Approval',
    order_id      VARCHAR(20) REFERENCES "Order"(order_id),
    customer_id   VARCHAR(20) REFERENCES Customer(customer_id),
    staff_id      VARCHAR(20) REFERENCES Staff(staff_id),
    description   TEXT,
    approved_by   VARCHAR(20) REFERENCES Staff(staff_id),
    approved_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS RequestItem (
    request_item_id VARCHAR(20) PRIMARY KEY,
    request_id      VARCHAR(20) NOT NULL REFERENCES Request(request_id),
    product_id      VARCHAR(20) NOT NULL REFERENCES Product(product_id),
    quantity        INT NOT NULL,
    fulfilled_qty   INT NOT NULL DEFAULT 0,
    remaining_qty   INT GENERATED ALWAYS AS (quantity - fulfilled_qty) STORED
);

CREATE TABLE IF NOT EXISTS PurchaseOrder (
    po_id        VARCHAR(20) PRIMARY KEY,
    po_date      TIMESTAMP NOT NULL DEFAULT NOW(),
    supplier_id  VARCHAR(20) REFERENCES Supplier(supplier_id),
    staff_id     VARCHAR(20) REFERENCES Staff(staff_id),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status       VARCHAR(50) NOT NULL DEFAULT 'New order',
    slip_url     TEXT
);

CREATE TABLE IF NOT EXISTS PurchaseItem (
    po_item_id VARCHAR(20) PRIMARY KEY,
    po_id      VARCHAR(20) NOT NULL REFERENCES PurchaseOrder(po_id),
    product_id VARCHAR(20) NOT NULL REFERENCES Product(product_id),
    quantity   INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ProductBatch (
    batch_id           VARCHAR(20) PRIMARY KEY,
    product_id         VARCHAR(20) NOT NULL REFERENCES Product(product_id),
    po_id              VARCHAR(20) REFERENCES PurchaseOrder(po_id),
    received_date      TIMESTAMP NOT NULL DEFAULT NOW(),
    quantity_in        INT NOT NULL,
    quantity_remaining INT NOT NULL,
    unit_cost          DECIMAL(10,2) NOT NULL,
    expiry_date        DATE
);

CREATE TABLE IF NOT EXISTS StockTransaction (
    transaction_id   VARCHAR(20) PRIMARY KEY,
    transaction_date TIMESTAMP NOT NULL DEFAULT NOW(),
    type             VARCHAR(10) NOT NULL CHECK (type IN ('IN','OUT','ADJUST')),
    product_id       VARCHAR(20) NOT NULL REFERENCES Product(product_id),
    quantity         INT NOT NULL CHECK (quantity > 0),
    staff_id         VARCHAR(20) NOT NULL REFERENCES Staff(staff_id),
    description      TEXT,
    batch_id         VARCHAR(20) REFERENCES ProductBatch(batch_id),
    reference_id     VARCHAR(20)
);

-- ============================================================
-- Seed Data
-- ============================================================

-- Admin staff — password is BCrypt of "defaultPassword123" (strength 12)
INSERT INTO Staff (staff_id, staff_name, role, phone, email, password, active)
VALUES (
    'STF001',
    'System Admin',
    'ADMIN',
    NULL,
    'admin@company.com',
    '$2a$12$XjqpAEgrAfjYiwizTtrR0e/uAS8ZMho5QH9vqG52/B196DQnvecCG',
    TRUE
)
ON CONFLICT (email) DO NOTHING;
