package com.inv.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class ReceivePurchaseOrderRequest {
    @NotEmpty
    @Valid
    private List<ReceiveItemRequest> items;

    @NotBlank
    private String staffId;

    public List<ReceiveItemRequest> getItems()           { return items; }
    public void                     setItems(List<ReceiveItemRequest> v){ this.items = v; }
    public String                   getStaffId()         { return staffId; }
    public void                     setStaffId(String v) { this.staffId = v; }
}
