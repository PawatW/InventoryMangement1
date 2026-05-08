package com.inv.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProductBatch {
    private String        batchId;
    private String        productId;
    private String        poId;
    private LocalDateTime receivedDate;
    private int           quantityIn;
    private int           quantityRemaining;
    private BigDecimal    unitCost;
    private LocalDate     expiryDate;

    public ProductBatch() {}

    public String        getBatchId()                    { return batchId; }
    public void          setBatchId(String v)            { this.batchId = v; }
    public String        getProductId()                  { return productId; }
    public void          setProductId(String v)          { this.productId = v; }
    public String        getPoId()                       { return poId; }
    public void          setPoId(String v)               { this.poId = v; }
    public LocalDateTime getReceivedDate()               { return receivedDate; }
    public void          setReceivedDate(LocalDateTime v){ this.receivedDate = v; }
    public int           getQuantityIn()                 { return quantityIn; }
    public void          setQuantityIn(int v)            { this.quantityIn = v; }
    public int           getQuantityRemaining()          { return quantityRemaining; }
    public void          setQuantityRemaining(int v)     { this.quantityRemaining = v; }
    public BigDecimal    getUnitCost()                   { return unitCost; }
    public void          setUnitCost(BigDecimal v)       { this.unitCost = v; }
    public LocalDate     getExpiryDate()                 { return expiryDate; }
    public void          setExpiryDate(LocalDate v)      { this.expiryDate = v; }
}
