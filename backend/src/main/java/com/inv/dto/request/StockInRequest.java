package com.inv.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class StockInRequest {
    @NotBlank
    private String productId;

    @Min(1)
    private int quantity;

    private String supplierId;
    private String note;

    public String getProductId()           { return productId; }
    public void   setProductId(String v)   { this.productId = v; }
    public int    getQuantity()            { return quantity; }
    public void   setQuantity(int v)       { this.quantity = v; }
    public String getSupplierId()          { return supplierId; }
    public void   setSupplierId(String v)  { this.supplierId = v; }
    public String getNote()                { return note; }
    public void   setNote(String v)        { this.note = v; }
}
