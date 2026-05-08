package com.inv.repo;

import com.inv.model.Staff;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Staff> ROW_MAPPER = (rs, __) -> new Staff(
            rs.getString("staff_id"),
            rs.getString("staff_name"),
            rs.getString("role"),
            rs.getString("phone"),
            rs.getString("email"),
            rs.getString("password"),
            rs.getBoolean("active")
    );

    public Optional<Staff> findByEmail(String email) {
        List<Staff> results = jdbc.query(
                "SELECT * FROM Staff WHERE email = ?", ROW_MAPPER, email);
        return results.stream().findFirst();
    }

    public Optional<Staff> findById(String staffId) {
        List<Staff> results = jdbc.query(
                "SELECT * FROM Staff WHERE staff_id = ?", ROW_MAPPER, staffId);
        return results.stream().findFirst();
    }

    public void save(Staff staff) {
        jdbc.update(
                "INSERT INTO Staff (staff_id, staff_name, role, phone, email, password, active) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                staff.getStaffId(), staff.getStaffName(), staff.getRole(),
                staff.getPhone(), staff.getEmail(), staff.getPassword(), staff.isActive());
    }

    public List<Staff> findAll() {
        return jdbc.query("SELECT * FROM Staff ORDER BY staff_name", ROW_MAPPER);
    }

    public void updateActive(String staffId, boolean active) {
        jdbc.update("UPDATE Staff SET active = ? WHERE staff_id = ?", active, staffId);
    }
}
