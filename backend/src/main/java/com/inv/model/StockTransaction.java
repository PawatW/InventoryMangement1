package com.inv.model;

import java.time.LocalDateTime;

public class StockTransaction {
    private String        transactionId;
    private LocalDateTime transactionDate;
    private String        type;
    private String        productId;
    private int           quantity;
    private String        staffId;
    private String        description;
    private String        batchId;
    private String        referenceId;

    public StockTransaction() {}

    public String        getTransactionId()               { return transactionId; }
    public void          setTransactionId(String v)       { this.transactionId = v; }
    public LocalDateTime getTransactionDate()             { return transactionDate; }
    public void          setTransactionDate(LocalDateTime v){ this.transactionDate = v; }
    public String        getType()                        { return type; }
    public void          setType(String v)                { this.type = v; }
    public String        getProductId()                   { return productId; }
    public void          setProductId(String v)           { this.productId = v; }
    public int           getQuantity()                    { return quantity; }
    public void          setQuantity(int v)               { this.quantity = v; }
    public String        getStaffId()                     { return staffId; }
    public void          setStaffId(String v)             { this.staffId = v; }
    public String        getDescription()                 { return description; }
    public void          setDescription(String v)         { this.description = v; }
    public String        getBatchId()                     { return batchId; }
    public void          setBatchId(String v)             { this.batchId = v; }
    public String        getReferenceId()                 { return referenceId; }
    public void          setReferenceId(String v)         { this.referenceId = v; }
}
