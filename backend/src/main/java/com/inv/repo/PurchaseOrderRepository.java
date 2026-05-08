package com.inv.repo;

import com.inv.model.PurchaseItem;
import com.inv.model.PurchaseOrder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public class PurchaseOrderRepository {

    private final JdbcTemplate jdbc;

    public PurchaseOrderRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<PurchaseOrder> PO_MAPPER = (rs, __) -> {
        PurchaseOrder po = new PurchaseOrder();
        po.setPoId(rs.getString("po_id"));
        po.setPoDate(rs.getTimestamp("po_date") != null
                ? rs.getTimestamp("po_date").toLocalDateTime() : null);
        po.setSupplierId(rs.getString("supplier_id"));
        po.setStaffId(rs.getString("staff_id"));
        po.setTotalAmount(rs.getBigDecimal("total_amount"));
        po.setStatus(rs.getString("status"));
        po.setSlipUrl(rs.getString("slip_url"));
        return po;
    };

    private static final RowMapper<PurchaseItem> ITEM_MAPPER = (rs, __) -> {
        PurchaseItem i = new PurchaseItem();
        i.setPoItemId(rs.getString("po_item_id"));
        i.setPoId(rs.getString("po_id"));
        i.setProductId(rs.getString("product_id"));
        i.setQuantity(rs.getInt("quantity"));
        i.setUnitPrice(rs.getBigDecimal("unit_price"));
        return i;
    };

    public List<PurchaseOrder> findAll() {
        return jdbc.query(
                "SELECT * FROM PurchaseOrder ORDER BY po_date DESC",
                PO_MAPPER);
    }

    public List<PurchaseOrder> findByStatus(String status) {
        return jdbc.query(
                "SELECT * FROM PurchaseOrder WHERE status = ? ORDER BY po_date DESC",
                PO_MAPPER, status);
    }

    public Optional<PurchaseOrder> findById(String poId) {
        return jdbc.query(
                "SELECT * FROM PurchaseOrder WHERE po_id = ?",
                PO_MAPPER, poId).stream().findFirst();
    }

    public List<PurchaseItem> findItems(String poId) {
        return jdbc.query(
                "SELECT * FROM PurchaseItem WHERE po_id = ?",
                ITEM_MAPPER, poId);
    }

    public Optional<PurchaseItem> findItemById(String poItemId) {
        return jdbc.query(
                "SELECT * FROM PurchaseItem WHERE po_item_id = ?",
                ITEM_MAPPER, poItemId).stream().findFirst();
    }

    public void save(PurchaseOrder po) {
        jdbc.update(
                "INSERT INTO PurchaseOrder (po_id, po_date, supplier_id, staff_id, total_amount, status, slip_url) " +
                "VALUES (?, NOW(), ?, ?, ?, ?, ?)",
                po.getPoId(), po.getSupplierId(), po.getStaffId(),
                po.getTotalAmount(), po.getStatus(), po.getSlipUrl());

        if (po.getItems() != null) {
            for (PurchaseItem item : po.getItems()) {
                jdbc.update(
                        "INSERT INTO PurchaseItem (po_item_id, po_id, product_id, quantity, unit_price) " +
                        "VALUES (?, ?, ?, ?, ?)",
                        item.getPoItemId(), item.getPoId(), item.getProductId(),
                        item.getQuantity(), item.getUnitPrice());
            }
        }
    }

    public void updateStatus(String poId, String status) {
        jdbc.update("UPDATE PurchaseOrder SET status = ? WHERE po_id = ?", status, poId);
    }

    public void updateTotalAmount(String poId, BigDecimal total) {
        jdbc.update("UPDATE PurchaseOrder SET total_amount = ? WHERE po_id = ?", total, poId);
    }

    public void updateSlipUrl(String poId, String url) {
        jdbc.update("UPDATE PurchaseOrder SET slip_url = ? WHERE po_id = ?", url, poId);
    }

    public void updateItemCost(String poItemId, BigDecimal unitPrice) {
        jdbc.update("UPDATE PurchaseItem SET unit_price = ? WHERE po_item_id = ?",
                unitPrice, poItemId);
    }

    public void updateItemQuantity(String poItemId, int quantity) {
        jdbc.update("UPDATE PurchaseItem SET quantity = ? WHERE po_item_id = ?",
                quantity, poItemId);
    }
}
