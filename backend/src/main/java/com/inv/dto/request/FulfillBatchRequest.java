package com.inv.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class FulfillBatchRequest {
    @NotEmpty
    @Valid
    private List<FulfillRequest> items;

    public List<FulfillRequest> getItems()            { return items; }
    public void                 setItems(List<FulfillRequest> v){ this.items = v; }
}
