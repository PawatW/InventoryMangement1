package com.inv.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class FulfillRequest {
    @NotBlank
    private String requestItemId;

    @Min(1)
    private int fulfillQty;

    public String getRequestItemId()           { return requestItemId; }
    public void   setRequestItemId(String v)   { this.requestItemId = v; }
    public int    getFulfillQty()              { return fulfillQty; }
    public void   setFulfillQty(int v)         { this.fulfillQty = v; }
}
