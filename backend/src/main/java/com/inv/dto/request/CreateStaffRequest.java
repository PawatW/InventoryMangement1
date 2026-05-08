package com.inv.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateStaffRequest {
    @NotBlank
    private String staffName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String role;

    private String phone;

    @NotBlank
    @Size(min = 6)
    private String password;

    public String getStaffName()           { return staffName; }
    public void   setStaffName(String v)   { this.staffName = v; }
    public String getEmail()               { return email; }
    public void   setEmail(String v)       { this.email = v; }
    public String getRole()                { return role; }
    public void   setRole(String v)        { this.role = v; }
    public String getPhone()               { return phone; }
    public void   setPhone(String v)       { this.phone = v; }
    public String getPassword()            { return password; }
    public void   setPassword(String v)    { this.password = v; }
}
