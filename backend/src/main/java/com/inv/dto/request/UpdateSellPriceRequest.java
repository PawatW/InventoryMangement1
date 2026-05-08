package com.inv.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class UpdateSellPriceRequest {
    @NotNull
    @DecimalMin("0")
    private BigDecimal sellPrice;

    public BigDecimal getSellPrice()             { return sellPrice; }
    public void       setSellPrice(BigDecimal v) { this.sellPrice = v; }
}
