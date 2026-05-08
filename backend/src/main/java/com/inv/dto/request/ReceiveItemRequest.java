package com.inv.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class ReceiveItemRequest {
    @NotBlank
    private String poItemId;

    @Min(1)
    private int quantity;

    @DecimalMin("0.01")
    private BigDecimal unitPrice;

    public String     getPoItemId()               { return poItemId; }
    public void       setPoItemId(String v)       { this.poItemId = v; }
    public int        getQuantity()               { return quantity; }
    public void       setQuantity(int v)          { this.quantity = v; }
    public BigDecimal getUnitPrice()              { return unitPrice; }
    public void       setUnitPrice(BigDecimal v)  { this.unitPrice = v; }
}
