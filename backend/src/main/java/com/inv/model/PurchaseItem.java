package com.inv.model;

import java.math.BigDecimal;

public class PurchaseItem {
    private String     poItemId;
    private String     poId;
    private String     productId;
    private int        quantity;
    private BigDecimal unitPrice;

    public PurchaseItem() {}

    public String     getPoItemId()               { return poItemId; }
    public void       setPoItemId(String v)       { this.poItemId = v; }
    public String     getPoId()                   { return poId; }
    public void       setPoId(String v)           { this.poId = v; }
    public String     getProductId()              { return productId; }
    public void       setProductId(String v)      { this.productId = v; }
    public int        getQuantity()               { return quantity; }
    public void       setQuantity(int v)          { this.quantity = v; }
    public BigDecimal getUnitPrice()              { return unitPrice; }
    public void       setUnitPrice(BigDecimal v)  { this.unitPrice = v; }
}
