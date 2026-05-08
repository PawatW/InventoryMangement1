package com.inv.model;

public class RequestItem {
    private String requestItemId;
    private String requestId;
    private String productId;
    private int    quantity;
    private int    fulfilledQty;
    private int    remainingQty;

    public RequestItem() {}

    public String getRequestItemId()             { return requestItemId; }
    public void   setRequestItemId(String v)     { this.requestItemId = v; }
    public String getRequestId()                 { return requestId; }
    public void   setRequestId(String v)         { this.requestId = v; }
    public String getProductId()                 { return productId; }
    public void   setProductId(String v)         { this.productId = v; }
    public int    getQuantity()                  { return quantity; }
    public void   setQuantity(int v)             { this.quantity = v; }
    public int    getFulfilledQty()              { return fulfilledQty; }
    public void   setFulfilledQty(int v)         { this.fulfilledQty = v; }
    public int    getRemainingQty()              { return remainingQty; }
    public void   setRemainingQty(int v)         { this.remainingQty = v; }
}
