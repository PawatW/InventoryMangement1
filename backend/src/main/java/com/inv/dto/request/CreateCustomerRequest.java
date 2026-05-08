package com.inv.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CreateCustomerRequest {
    @NotBlank
    private String customerName;
    private String address;
    private String phone;
    @Email
    private String email;

    public String getCustomerName()           { return customerName; }
    public void   setCustomerName(String v)   { this.customerName = v; }
    public String getAddress()                { return address; }
    public void   setAddress(String v)        { this.address = v; }
    public String getPhone()                  { return phone; }
    public void   setPhone(String v)          { this.phone = v; }
    public String getEmail()                  { return email; }
    public void   setEmail(String v)          { this.email = v; }
}
