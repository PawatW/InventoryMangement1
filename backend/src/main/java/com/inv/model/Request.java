package com.inv.model;

import java.time.LocalDateTime;

public class Request {
    private String        requestId;
    private LocalDateTime requestDate;
    private String        status;
    private String        orderId;
    private String        customerId;
    private String        staffId;
    private String        description;
    private String        approvedBy;
    private LocalDateTime approvedDate;

    public Request() {}

    public String        getRequestId()                   { return requestId; }
    public void          setRequestId(String v)           { this.requestId = v; }
    public LocalDateTime getRequestDate()                 { return requestDate; }
    public void          setRequestDate(LocalDateTime v)  { this.requestDate = v; }
    public String        getStatus()                      { return status; }
    public void          setStatus(String v)              { this.status = v; }
    public String        getOrderId()                     { return orderId; }
    public void          setOrderId(String v)             { this.orderId = v; }
    public String        getCustomerId()                  { return customerId; }
    public void          setCustomerId(String v)          { this.customerId = v; }
    public String        getStaffId()                     { return staffId; }
    public void          setStaffId(String v)             { this.staffId = v; }
    public String        getDescription()                 { return description; }
    public void          setDescription(String v)         { this.description = v; }
    public String        getApprovedBy()                  { return approvedBy; }
    public void          setApprovedBy(String v)          { this.approvedBy = v; }
    public LocalDateTime getApprovedDate()                { return approvedDate; }
    public void          setApprovedDate(LocalDateTime v) { this.approvedDate = v; }
}
