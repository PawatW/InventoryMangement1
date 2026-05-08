package com.inv.repo;

import com.inv.model.Customer;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CustomerRepository {

    private final JdbcTemplate jdbc;

    public CustomerRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Customer> ROW_MAPPER = (rs, __) -> new Customer(
            rs.getString("customer_id"),
            rs.getString("customer_name"),
            rs.getString("address"),
            rs.getString("phone"),
            rs.getString("email"),
            rs.getBoolean("active")
    );

    public List<Customer> findAll() {
        return jdbc.query(
                "SELECT * FROM Customer WHERE active = true ORDER BY customer_name",
                ROW_MAPPER);
    }

    public Optional<Customer> findById(String id) {
        return jdbc.query("SELECT * FROM Customer WHERE customer_id = ?", ROW_MAPPER, id)
                .stream().findFirst();
    }

    public Optional<Customer> findByPhone(String phone) {
        return jdbc.query("SELECT * FROM Customer WHERE phone = ?", ROW_MAPPER, phone)
                .stream().findFirst();
    }

    public Optional<Customer> findByEmail(String email) {
        return jdbc.query("SELECT * FROM Customer WHERE email = ?", ROW_MAPPER, email)
                .stream().findFirst();
    }

    public void save(Customer c) {
        jdbc.update(
                "INSERT INTO Customer (customer_id, customer_name, address, phone, email, active) " +
                "VALUES (?, ?, ?, ?, ?, ?)",
                c.getCustomerId(), c.getCustomerName(), c.getAddress(),
                c.getPhone(), c.getEmail(), c.isActive());
    }

    public void update(String id, String name, String address, String phone, String email) {
        jdbc.update(
                "UPDATE Customer SET customer_name = ?, address = ?, phone = ?, email = ? " +
                "WHERE customer_id = ?",
                name, address, phone, email, id);
    }

    public void deactivate(String id) {
        jdbc.update("UPDATE Customer SET active = false WHERE customer_id = ?", id);
    }
}
