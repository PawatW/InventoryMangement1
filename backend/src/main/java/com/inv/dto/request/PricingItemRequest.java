package com.inv.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class PricingItemRequest {
    @NotBlank
    private String poItemId;

    @DecimalMin("0.01")
    private BigDecimal unitPrice;

    public String     getPoItemId()               { return poItemId; }
    public void       setPoItemId(String v)       { this.poItemId = v; }
    public BigDecimal getUnitPrice()              { return unitPrice; }
    public void       setUnitPrice(BigDecimal v)  { this.unitPrice = v; }
}
