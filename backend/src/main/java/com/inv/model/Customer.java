package com.inv.model;

public class Customer {
    private String customerId;
    private String customerName;
    private String address;
    private String phone;
    private String email;
    private boolean active;

    public Customer() {}

    public Customer(String customerId, String customerName, String address,
                    String phone, String email, boolean active) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.active = active;
    }

    public String  getCustomerId()             { return customerId; }
    public void    setCustomerId(String v)     { this.customerId = v; }
    public String  getCustomerName()           { return customerName; }
    public void    setCustomerName(String v)   { this.customerName = v; }
    public String  getAddress()                { return address; }
    public void    setAddress(String v)        { this.address = v; }
    public String  getPhone()                  { return phone; }
    public void    setPhone(String v)          { this.phone = v; }
    public String  getEmail()                  { return email; }
    public void    setEmail(String v)          { this.email = v; }
    public boolean isActive()                  { return active; }
    public void    setActive(boolean v)        { this.active = v; }
}
