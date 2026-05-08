package com.inv.repo;

import com.inv.model.StockTransaction;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class StockTransactionRepository {

    private final JdbcTemplate jdbc;

    public StockTransactionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<StockTransaction> ROW_MAPPER = (rs, __) -> {
        StockTransaction t = new StockTransaction();
        t.setTransactionId(rs.getString("transaction_id"));
        t.setTransactionDate(rs.getTimestamp("transaction_date") != null
                ? rs.getTimestamp("transaction_date").toLocalDateTime() : null);
        t.setType(rs.getString("type"));
        t.setProductId(rs.getString("product_id"));
        t.setQuantity(rs.getInt("quantity"));
        t.setStaffId(rs.getString("staff_id"));
        t.setDescription(rs.getString("description"));
        t.setBatchId(rs.getString("batch_id"));
        t.setReferenceId(rs.getString("reference_id"));
        return t;
    };

    public void save(StockTransaction tx) {
        jdbc.update(
                "INSERT INTO StockTransaction " +
                "(transaction_id, transaction_date, type, product_id, quantity, staff_id, description, batch_id, reference_id) " +
                "VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?)",
                tx.getTransactionId(), tx.getType(), tx.getProductId(),
                tx.getQuantity(), tx.getStaffId(), tx.getDescription(),
                tx.getBatchId(), tx.getReferenceId());
    }

    public List<StockTransaction> findAll() {
        return jdbc.query(
                "SELECT * FROM StockTransaction ORDER BY transaction_date DESC",
                ROW_MAPPER);
    }

    public List<StockTransaction> findByProduct(String productId) {
        return jdbc.query(
                "SELECT * FROM StockTransaction WHERE product_id = ? ORDER BY transaction_date DESC",
                ROW_MAPPER, productId);
    }

    public List<StockTransaction> findByReferenceId(String referenceId) {
        return jdbc.query(
                "SELECT * FROM StockTransaction WHERE reference_id = ? ORDER BY transaction_date DESC",
                ROW_MAPPER, referenceId);
    }
}
