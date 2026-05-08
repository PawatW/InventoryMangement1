package com.inv.repo;

import com.inv.model.Product;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public class ProductRepository {

    private final JdbcTemplate jdbc;

    public ProductRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Product> ROW_MAPPER = (rs, __) -> {
        Product p = new Product();
        p.setProductId(rs.getString("product_id"));
        p.setProductName(rs.getString("product_name"));
        p.setDescription(rs.getString("description"));
        p.setUnit(rs.getString("unit"));
        p.setCostPrice(rs.getBigDecimal("cost_price"));
        p.setSellPrice(rs.getBigDecimal("sell_price"));
        p.setQuantity(rs.getInt("quantity"));
        p.setSupplierId(rs.getString("supplier_id"));
        p.setImageUrl(rs.getString("image_url"));
        p.setActive(rs.getBoolean("active"));
        return p;
    };

    public List<Product> findAll() {
        return jdbc.query(
                "SELECT * FROM Product WHERE active = true ORDER BY product_name",
                ROW_MAPPER);
    }

    public Optional<Product> findById(String id) {
        return jdbc.query("SELECT * FROM Product WHERE product_id = ?", ROW_MAPPER, id)
                .stream().findFirst();
    }

    public void save(Product p) {
        jdbc.update(
                "INSERT INTO Product " +
                "(product_id, product_name, description, unit, cost_price, sell_price, quantity, supplier_id, image_url, active) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                p.getProductId(), p.getProductName(), p.getDescription(), p.getUnit(),
                p.getCostPrice(), p.getSellPrice(), p.getQuantity(),
                p.getSupplierId(), p.getImageUrl(), p.isActive());
    }

    public void updateQuantity(String productId, int diff) {
        jdbc.update("UPDATE Product SET quantity = quantity + ? WHERE product_id = ?",
                diff, productId);
    }

    public void updateDetails(String productId, String name, String description, String imageUrl) {
        jdbc.update(
                "UPDATE Product SET product_name = ?, description = ?, image_url = ? WHERE product_id = ?",
                name, description, imageUrl, productId);
    }

    public void updateSellPrice(String productId, BigDecimal sellPrice) {
        jdbc.update("UPDATE Product SET sell_price = ? WHERE product_id = ?",
                sellPrice, productId);
    }

    public void updateCostPrice(String productId, BigDecimal costPrice) {
        jdbc.update("UPDATE Product SET cost_price = ? WHERE product_id = ?",
                costPrice, productId);
    }

    public void deactivate(String productId) {
        jdbc.update("UPDATE Product SET active = false WHERE product_id = ?", productId);
    }
}
