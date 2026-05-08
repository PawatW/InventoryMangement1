package com.inv.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseOrder {
    private String        poId;
    private LocalDateTime poDate;
    private String        supplierId;
    private String        staffId;
    private BigDecimal    totalAmount;
    private String        status;
    private String        slipUrl;
    private List<PurchaseItem> items;

    public PurchaseOrder() {}

    public String        getPoId()                     { return poId; }
    public void          setPoId(String v)             { this.poId = v; }
    public LocalDateTime getPoDate()                   { return poDate; }
    public void          setPoDate(LocalDateTime v)    { this.poDate = v; }
    public String        getSupplierId()               { return supplierId; }
    public void          setSupplierId(String v)       { this.supplierId = v; }
    public String        getStaffId()                  { return staffId; }
    public void          setStaffId(String v)          { this.staffId = v; }
    public BigDecimal    getTotalAmount()               { return totalAmount; }
    public void          setTotalAmount(BigDecimal v)  { this.totalAmount = v; }
    public String        getStatus()                   { return status; }
    public void          setStatus(String v)           { this.status = v; }
    public String        getSlipUrl()                  { return slipUrl; }
    public void          setSlipUrl(String v)          { this.slipUrl = v; }
    public List<PurchaseItem> getItems()               { return items; }
    public void          setItems(List<PurchaseItem> v){ this.items = v; }
}
