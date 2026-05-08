package com.inv.repo;

import com.inv.model.Supplier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class SupplierRepository {

    private final JdbcTemplate jdbc;

    public SupplierRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Supplier> ROW_MAPPER = (rs, __) -> new Supplier(
            rs.getString("supplier_id"),
            rs.getString("supplier_name"),
            rs.getString("address"),
            rs.getString("phone"),
            rs.getString("email"),
            rs.getBoolean("active")
    );

    public List<Supplier> findAll() {
        return jdbc.query(
                "SELECT * FROM Supplier WHERE active = true ORDER BY supplier_name",
                ROW_MAPPER);
    }

    public Optional<Supplier> findById(String id) {
        return jdbc.query("SELECT * FROM Supplier WHERE supplier_id = ?", ROW_MAPPER, id)
                .stream().findFirst();
    }

    public Optional<Supplier> findByEmail(String email) {
        return jdbc.query("SELECT * FROM Supplier WHERE email = ?", ROW_MAPPER, email)
                .stream().findFirst();
    }

    public void save(Supplier s) {
        jdbc.update(
                "INSERT INTO Supplier (supplier_id, supplier_name, address, phone, email, active) " +
                "VALUES (?, ?, ?, ?, ?, ?)",
                s.getSupplierId(), s.getSupplierName(), s.getAddress(),
                s.getPhone(), s.getEmail(), s.isActive());
    }

    public void update(String id, String name, String address, String phone, String email) {
        jdbc.update(
                "UPDATE Supplier SET supplier_name = ?, address = ?, phone = ?, email = ? " +
                "WHERE supplier_id = ?",
                name, address, phone, email, id);
    }

    public void deactivate(String id) {
        jdbc.update("UPDATE Supplier SET active = false WHERE supplier_id = ?", id);
    }
}
