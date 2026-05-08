package com.inv.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class OrderItemRequest {
    @NotBlank
    private String productId;

    @Min(1)
    private int quantity;

    @DecimalMin("0")
    private BigDecimal unitPrice;

    public String     getProductId()               { return productId; }
    public void       setProductId(String v)       { this.productId = v; }
    public int        getQuantity()                { return quantity; }
    public void       setQuantity(int v)           { this.quantity = v; }
    public BigDecimal getUnitPrice()               { return unitPrice; }
    public void       setUnitPrice(BigDecimal v)   { this.unitPrice = v; }
}
