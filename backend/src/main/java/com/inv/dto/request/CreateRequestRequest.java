package com.inv.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateRequestRequest {
    private String orderId;
    private String customerId;
    private String description;

    @NotEmpty
    @Valid
    private List<RequestItemRequest> items;

    public String                    getOrderId()          { return orderId; }
    public void                      setOrderId(String v)  { this.orderId = v; }
    public String                    getCustomerId()       { return customerId; }
    public void                      setCustomerId(String v){ this.customerId = v; }
    public String                    getDescription()      { return description; }
    public void                      setDescription(String v){ this.description = v; }
    public List<RequestItemRequest>  getItems()            { return items; }
    public void                      setItems(List<RequestItemRequest> v){ this.items = v; }
}
