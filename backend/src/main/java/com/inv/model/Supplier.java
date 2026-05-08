package com.inv.model;

public class Supplier {
    private String supplierId;
    private String supplierName;
    private String address;
    private String phone;
    private String email;
    private boolean active;

    public Supplier() {}

    public Supplier(String supplierId, String supplierName, String address,
                    String phone, String email, boolean active) {
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.active = active;
    }

    public String  getSupplierId()             { return supplierId; }
    public void    setSupplierId(String v)     { this.supplierId = v; }
    public String  getSupplierName()           { return supplierName; }
    public void    setSupplierName(String v)   { this.supplierName = v; }
    public String  getAddress()                { return address; }
    public void    setAddress(String v)        { this.address = v; }
    public String  getPhone()                  { return phone; }
    public void    setPhone(String v)          { this.phone = v; }
    public String  getEmail()                  { return email; }
    public void    setEmail(String v)          { this.email = v; }
    public boolean isActive()                  { return active; }
    public void    setActive(boolean v)        { this.active = v; }
}
