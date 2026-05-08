package com.inv.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateOrderRequest {
    @NotBlank
    private String customerId;

    @NotEmpty
    @Valid
    private List<OrderItemRequest> items;

    public String                 getCustomerId()       { return customerId; }
    public void                   setCustomerId(String v){ this.customerId = v; }
    public List<OrderItemRequest> getItems()            { return items; }
    public void                   setItems(List<OrderItemRequest> v){ this.items = v; }
}
