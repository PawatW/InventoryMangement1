package com.inv.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Order {
    private String        orderId;
    private LocalDateTime orderDate;
    private BigDecimal    totalAmount;
    private String        status;
    private String        customerId;
    private String        staffId;

    public Order() {}

    public String        getOrderId()                  { return orderId; }
    public void          setOrderId(String v)          { this.orderId = v; }
    public LocalDateTime getOrderDate()                { return orderDate; }
    public void          setOrderDate(LocalDateTime v) { this.orderDate = v; }
    public BigDecimal    getTotalAmount()               { return totalAmount; }
    public void          setTotalAmount(BigDecimal v)  { this.totalAmount = v; }
    public String        getStatus()                   { return status; }
    public void          setStatus(String v)           { this.status = v; }
    public String        getCustomerId()               { return customerId; }
    public void          setCustomerId(String v)       { this.customerId = v; }
    public String        getStaffId()                  { return staffId; }
    public void          setStaffId(String v)          { this.staffId = v; }
}
