package com.inv.model;

import java.math.BigDecimal;

public class Product {
    private String     productId;
    private String     productName;
    private String     description;
    private String     unit;
    private BigDecimal costPrice;
    private BigDecimal sellPrice;
    private int        quantity;
    private String     supplierId;
    private String     imageUrl;
    private boolean    active;
    private String     createdByStaffId;

    public Product() {}

    public String     getProductId()                 { return productId; }
    public void       setProductId(String v)         { this.productId = v; }
    public String     getProductName()               { return productName; }
    public void       setProductName(String v)       { this.productName = v; }
    public String     getDescription()               { return description; }
    public void       setDescription(String v)       { this.description = v; }
    public String     getUnit()                      { return unit; }
    public void       setUnit(String v)              { this.unit = v; }
    public BigDecimal getCostPrice()                 { return costPrice; }
    public void       setCostPrice(BigDecimal v)     { this.costPrice = v; }
    public BigDecimal getSellPrice()                 { return sellPrice; }
    public void       setSellPrice(BigDecimal v)     { this.sellPrice = v; }
    public int        getQuantity()                  { return quantity; }
    public void       setQuantity(int v)             { this.quantity = v; }
    public String     getSupplierId()                { return supplierId; }
    public void       setSupplierId(String v)        { this.supplierId = v; }
    public String     getImageUrl()                  { return imageUrl; }
    public void       setImageUrl(String v)          { this.imageUrl = v; }
    public boolean    isActive()                     { return active; }
    public void       setActive(boolean v)           { this.active = v; }
    public String     getCreatedByStaffId()          { return createdByStaffId; }
    public void       setCreatedByStaffId(String v)  { this.createdByStaffId = v; }
}
