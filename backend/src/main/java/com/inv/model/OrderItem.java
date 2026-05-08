package com.inv.model;

import java.math.BigDecimal;

public class OrderItem {
    private String     orderItemId;
    private String     orderId;
    private String     productId;
    private int        quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private int        fulfilledQty;
    private int        remainingQty;

    public OrderItem() {}

    public String     getOrderItemId()               { return orderItemId; }
    public void       setOrderItemId(String v)       { this.orderItemId = v; }
    public String     getOrderId()                   { return orderId; }
    public void       setOrderId(String v)           { this.orderId = v; }
    public String     getProductId()                 { return productId; }
    public void       setProductId(String v)         { this.productId = v; }
    public int        getQuantity()                  { return quantity; }
    public void       setQuantity(int v)             { this.quantity = v; }
    public BigDecimal getUnitPrice()                 { return unitPrice; }
    public void       setUnitPrice(BigDecimal v)     { this.unitPrice = v; }
    public BigDecimal getLineTotal()                 { return lineTotal; }
    public void       setLineTotal(BigDecimal v)     { this.lineTotal = v; }
    public int        getFulfilledQty()              { return fulfilledQty; }
    public void       setFulfilledQty(int v)         { this.fulfilledQty = v; }
    public int        getRemainingQty()              { return remainingQty; }
    public void       setRemainingQty(int v)         { this.remainingQty = v; }
}
