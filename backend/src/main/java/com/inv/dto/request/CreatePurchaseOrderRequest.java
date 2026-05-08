package com.inv.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreatePurchaseOrderRequest {
    @NotBlank
    private String supplierId;

    @NotEmpty
    @Valid
    private List<PurchaseItemRequest> items;

    public String                    getSupplierId()       { return supplierId; }
    public void                      setSupplierId(String v){ this.supplierId = v; }
    public List<PurchaseItemRequest> getItems()            { return items; }
    public void                      setItems(List<PurchaseItemRequest> v){ this.items = v; }
}
