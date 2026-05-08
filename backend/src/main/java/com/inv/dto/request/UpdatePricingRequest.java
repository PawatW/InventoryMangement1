package com.inv.dto.request;

import jakarta.validation.Valid;

import java.util.List;

public class UpdatePricingRequest {
    @Valid
    private List<PricingItemRequest> items;
    private boolean reject;
    private String  slipUrl;

    public List<PricingItemRequest> getItems()            { return items; }
    public void                     setItems(List<PricingItemRequest> v){ this.items = v; }
    public boolean                  isReject()            { return reject; }
    public void                     setReject(boolean v)  { this.reject = v; }
    public String                   getSlipUrl()          { return slipUrl; }
    public void                     setSlipUrl(String v)  { this.slipUrl = v; }
}
