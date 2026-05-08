package com.inv.repo;

import com.inv.model.Request;
import com.inv.model.RequestItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class RequestRepository {

    private final JdbcTemplate jdbc;

    public RequestRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Request> REQUEST_MAPPER = (rs, __) -> {
        Request r = new Request();
        r.setRequestId(rs.getString("request_id"));
        r.setRequestDate(rs.getTimestamp("request_date") != null
                ? rs.getTimestamp("request_date").toLocalDateTime() : null);
        r.setStatus(rs.getString("status"));
        r.setOrderId(rs.getString("order_id"));
        r.setCustomerId(rs.getString("customer_id"));
        r.setStaffId(rs.getString("staff_id"));
        r.setDescription(rs.getString("description"));
        r.setApprovedBy(rs.getString("approved_by"));
        r.setApprovedDate(rs.getTimestamp("approved_date") != null
                ? rs.getTimestamp("approved_date").toLocalDateTime() : null);
        return r;
    };

    private static final RowMapper<RequestItem> ITEM_MAPPER = (rs, __) -> {
        RequestItem i = new RequestItem();
        i.setRequestItemId(rs.getString("request_item_id"));
        i.setRequestId(rs.getString("request_id"));
        i.setProductId(rs.getString("product_id"));
        i.setQuantity(rs.getInt("quantity"));
        i.setFulfilledQty(rs.getInt("fulfilled_qty"));
        i.setRemainingQty(rs.getInt("remaining_qty"));
        return i;
    };

    public List<Request> findAll() {
        return jdbc.query(
                "SELECT * FROM Request ORDER BY request_date DESC",
                REQUEST_MAPPER);
    }

    public Optional<Request> findById(String requestId) {
        return jdbc.query(
                "SELECT * FROM Request WHERE request_id = ?",
                REQUEST_MAPPER, requestId).stream().findFirst();
    }

    public List<Request> findByOrderId(String orderId) {
        return jdbc.query(
                "SELECT * FROM Request WHERE order_id = ? ORDER BY request_date DESC",
                REQUEST_MAPPER, orderId);
    }

    public List<Request> findPendingRequests() {
        return jdbc.query(
                "SELECT * FROM Request WHERE status = 'Awaiting Approval' ORDER BY request_date DESC",
                REQUEST_MAPPER);
    }

    public List<Request> findApprovedRequests() {
        return jdbc.query(
                "SELECT r.* FROM Request r " +
                "WHERE r.status IN ('Approved','Pending') " +
                "AND EXISTS (" +
                "  SELECT 1 FROM RequestItem ri " +
                "  WHERE ri.request_id = r.request_id AND ri.remaining_qty > 0" +
                ") ORDER BY r.request_date DESC",
                REQUEST_MAPPER);
    }

    public List<Request> findReadyToCloseRequests() {
        return jdbc.query(
                "SELECT r.* FROM Request r " +
                "WHERE r.status = 'Pending' " +
                "AND NOT EXISTS (" +
                "  SELECT 1 FROM RequestItem ri " +
                "  WHERE ri.request_id = r.request_id AND ri.remaining_qty > 0" +
                ") ORDER BY r.request_date DESC",
                REQUEST_MAPPER);
    }

    public List<Request> findWithFilters(String orderId, String status) {
        StringBuilder sql = new StringBuilder("SELECT * FROM Request WHERE 1=1");
        List<Object> params = new ArrayList<>();
        if (orderId != null && !orderId.isBlank()) {
            sql.append(" AND order_id = ?");
            params.add(orderId);
        }
        if (status != null && !status.isBlank()) {
            sql.append(" AND status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY request_date DESC");
        return jdbc.query(sql.toString(), REQUEST_MAPPER, params.toArray());
    }

    public List<RequestItem> findItemsByRequestId(String requestId) {
        return jdbc.query(
                "SELECT * FROM RequestItem WHERE request_id = ?",
                ITEM_MAPPER, requestId);
    }

    public Optional<RequestItem> findItemById(String requestItemId) {
        return jdbc.query(
                "SELECT * FROM RequestItem WHERE request_item_id = ?",
                ITEM_MAPPER, requestItemId).stream().findFirst();
    }

    public void save(Request r) {
        jdbc.update(
                "INSERT INTO Request (request_id, request_date, status, order_id, customer_id, staff_id, description) " +
                "VALUES (?, NOW(), ?, ?, ?, ?, ?)",
                r.getRequestId(), r.getStatus(), r.getOrderId(),
                r.getCustomerId(), r.getStaffId(), r.getDescription());
    }

    public void saveRequestItem(RequestItem i) {
        jdbc.update(
                "INSERT INTO RequestItem (request_item_id, request_id, product_id, quantity, fulfilled_qty) " +
                "VALUES (?, ?, ?, ?, 0)",
                i.getRequestItemId(), i.getRequestId(),
                i.getProductId(), i.getQuantity());
    }

    public void updateStatus(String requestId, String status, String approverId) {
        jdbc.update(
                "UPDATE Request SET status = ?, approved_by = ?, approved_date = NOW() " +
                "WHERE request_id = ?",
                status, approverId, requestId);
    }

    public void updateRequestStatus(String requestId, String status) {
        jdbc.update("UPDATE Request SET status = ? WHERE request_id = ?", status, requestId);
    }

    public void updateItemFulfillment(String requestItemId, int fulfillQty) {
        jdbc.update(
                "UPDATE RequestItem SET fulfilled_qty = fulfilled_qty + ? " +
                "WHERE request_item_id = ?",
                fulfillQty, requestItemId);
    }

    public boolean areAllItemsFulfilled(String requestId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM RequestItem WHERE request_id = ? AND remaining_qty > 0",
                Integer.class, requestId);
        return count != null && count == 0;
    }

    public void closeRequest(String requestId) {
        jdbc.update("UPDATE Request SET status = 'Closed' WHERE request_id = ?", requestId);
    }
}
