package com.inv.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StockAdjustRequest {
    @NotBlank
    private String productId;

    @NotNull
    private Integer quantity;

    private String description;

    public String  getProductId()           { return productId; }
    public void    setProductId(String v)   { this.productId = v; }
    public Integer getQuantity()            { return quantity; }
    public void    setQuantity(Integer v)   { this.quantity = v; }
    public String  getDescription()         { return description; }
    public void    setDescription(String v) { this.description = v; }
}
