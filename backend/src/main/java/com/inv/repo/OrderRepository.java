package com.inv.repo;

import com.inv.model.Order;
import com.inv.model.OrderItem;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class OrderRepository {

    private final JdbcTemplate jdbc;

    public OrderRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<Order> ORDER_MAPPER = (rs, __) -> {
        Order o = new Order();
        o.setOrderId(rs.getString("order_id"));
        o.setOrderDate(rs.getTimestamp("order_date") != null
                ? rs.getTimestamp("order_date").toLocalDateTime() : null);
        o.setTotalAmount(rs.getBigDecimal("total_amount"));
        o.setStatus(rs.getString("status"));
        o.setCustomerId(rs.getString("customer_id"));
        o.setStaffId(rs.getString("staff_id"));
        return o;
    };

    private static final RowMapper<OrderItem> ITEM_MAPPER = (rs, __) -> {
        OrderItem i = new OrderItem();
        i.setOrderItemId(rs.getString("order_item_id"));
        i.setOrderId(rs.getString("order_id"));
        i.setProductId(rs.getString("product_id"));
        i.setQuantity(rs.getInt("quantity"));
        i.setUnitPrice(rs.getBigDecimal("unit_price"));
        i.setLineTotal(rs.getBigDecimal("line_total"));
        i.setFulfilledQty(rs.getInt("fulfilled_qty"));
        i.setRemainingQty(rs.getInt("remaining_qty"));
        return i;
    };

    public List<Order> findAll() {
        return jdbc.query(
                "SELECT * FROM \"Order\" ORDER BY order_date DESC",
                ORDER_MAPPER);
    }

    public Optional<Order> findById(String orderId) {
        return jdbc.query(
                "SELECT * FROM \"Order\" WHERE order_id = ?",
                ORDER_MAPPER, orderId).stream().findFirst();
    }

    public List<Order> findByStaffId(String staffId) {
        return jdbc.query(
                "SELECT * FROM \"Order\" WHERE staff_id = ? ORDER BY order_date DESC",
                ORDER_MAPPER, staffId);
    }

    public List<Order> findConfirmedOrders() {
        return jdbc.query(
                "SELECT * FROM \"Order\" WHERE status = 'Confirmed' ORDER BY order_date DESC",
                ORDER_MAPPER);
    }

    public List<Order> findOrdersReadyToClose() {
        return jdbc.query(
                "SELECT o.* FROM \"Order\" o " +
                "WHERE o.status = 'Pending' " +
                "AND NOT EXISTS (" +
                "  SELECT 1 FROM OrderItem oi " +
                "  WHERE oi.order_id = o.order_id AND oi.remaining_qty > 0" +
                ") ORDER BY o.order_date DESC",
                ORDER_MAPPER);
    }

    public List<OrderItem> findItemsByOrderId(String orderId) {
        return jdbc.query(
                "SELECT * FROM OrderItem WHERE order_id = ?",
                ITEM_MAPPER, orderId);
    }

    public void save(Order o) {
        jdbc.update(
                "INSERT INTO \"Order\" (order_id, order_date, total_amount, status, customer_id, staff_id) " +
                "VALUES (?, NOW(), ?, ?, ?, ?)",
                o.getOrderId(), o.getTotalAmount(), o.getStatus(),
                o.getCustomerId(), o.getStaffId());
    }

    public void saveOrderItem(OrderItem i) {
        jdbc.update(
                "INSERT INTO OrderItem (order_item_id, order_id, product_id, quantity, unit_price, line_total, fulfilled_qty) " +
                "VALUES (?, ?, ?, ?, ?, ?, 0)",
                i.getOrderItemId(), i.getOrderId(), i.getProductId(),
                i.getQuantity(), i.getUnitPrice(), i.getLineTotal());
    }

    public void updateOrderItemFulfillment(String orderId, String productId, int fulfillQty) {
        jdbc.update(
                "UPDATE OrderItem SET fulfilled_qty = fulfilled_qty + ? " +
                "WHERE order_id = ? AND product_id = ?",
                fulfillQty, orderId, productId);
        jdbc.update(
                "UPDATE \"Order\" SET status = 'Pending' WHERE order_id = ?",
                orderId);
    }

    public void closeOrder(String orderId) {
        jdbc.update("UPDATE \"Order\" SET status = 'Closed' WHERE order_id = ?", orderId);
    }

    public boolean hasPendingRequests(String orderId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM Request WHERE order_id = ? AND status != 'Closed'",
                Integer.class, orderId);
        return count != null && count > 0;
    }
}
