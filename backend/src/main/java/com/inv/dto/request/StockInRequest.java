package com.inv.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class StockInRequest {
    @NotBlank
    private String productId;

    @Min(1)
    private int quantity;

    private String     supplierId;
    private BigDecimal unitCost;
    private String     expiryDate;
    private String     description;

    public String     getProductId()             { return productId; }
    public void       setProductId(String v)     { this.productId = v; }
    public int        getQuantity()              { return quantity; }
    public void       setQuantity(int v)         { this.quantity = v; }
    public String     getSupplierId()            { return supplierId; }
    public void       setSupplierId(String v)    { this.supplierId = v; }
    public BigDecimal getUnitCost()              { return unitCost; }
    public void       setUnitCost(BigDecimal v)  { this.unitCost = v; }
    public String     getExpiryDate()            { return expiryDate; }
    public void       setExpiryDate(String v)    { this.expiryDate = v; }
    public String     getDescription()           { return description; }
    public void       setDescription(String v)   { this.description = v; }
}
