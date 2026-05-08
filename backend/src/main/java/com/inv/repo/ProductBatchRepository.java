package com.inv.repo;

import com.inv.model.ProductBatch;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProductBatchRepository {

    private final JdbcTemplate jdbc;

    public ProductBatchRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ProductBatch> ROW_MAPPER = (rs, __) -> {
        ProductBatch b = new ProductBatch();
        b.setBatchId(rs.getString("batch_id"));
        b.setProductId(rs.getString("product_id"));
        b.setPoId(rs.getString("po_id"));
        b.setReceivedDate(rs.getTimestamp("received_date") != null
                ? rs.getTimestamp("received_date").toLocalDateTime() : null);
        b.setQuantityIn(rs.getInt("quantity_in"));
        b.setQuantityRemaining(rs.getInt("quantity_remaining"));
        b.setUnitCost(rs.getBigDecimal("unit_cost"));
        b.setExpiryDate(rs.getDate("expiry_date") != null
                ? rs.getDate("expiry_date").toLocalDate() : null);
        return b;
    };

    public void save(ProductBatch b) {
        jdbc.update(
                "INSERT INTO ProductBatch " +
                "(batch_id, product_id, po_id, received_date, quantity_in, quantity_remaining, unit_cost, expiry_date) " +
                "VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)",
                b.getBatchId(), b.getProductId(), b.getPoId(),
                b.getQuantityIn(), b.getQuantityRemaining(),
                b.getUnitCost(), b.getExpiryDate());
    }

    public Optional<ProductBatch> findById(String batchId) {
        return jdbc.query("SELECT * FROM ProductBatch WHERE batch_id = ?", ROW_MAPPER, batchId)
                .stream().findFirst();
    }

    public List<ProductBatch> findByProduct(String productId) {
        return jdbc.query(
                "SELECT * FROM ProductBatch WHERE product_id = ? ORDER BY received_date DESC",
                ROW_MAPPER, productId);
    }

    public List<ProductBatch> findAvailableBatches(String productId) {
        return jdbc.query(
                "SELECT * FROM ProductBatch WHERE product_id = ? AND quantity_remaining > 0 " +
                "ORDER BY received_date ASC",
                ROW_MAPPER, productId);
    }

    public List<ProductBatch> findByPurchaseOrder(String poId) {
        return jdbc.query("SELECT * FROM ProductBatch WHERE po_id = ?", ROW_MAPPER, poId);
    }

    public void updateRemaining(String batchId, int remaining) {
        jdbc.update("UPDATE ProductBatch SET quantity_remaining = ? WHERE batch_id = ?",
                remaining, batchId);
    }
}
