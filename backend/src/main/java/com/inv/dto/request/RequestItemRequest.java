package com.inv.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class RequestItemRequest {
    @NotBlank
    private String productId;

    @Min(1)
    private int quantity;

    public String getProductId()           { return productId; }
    public void   setProductId(String v)   { this.productId = v; }
    public int    getQuantity()            { return quantity; }
    public void   setQuantity(int v)       { this.quantity = v; }
}
