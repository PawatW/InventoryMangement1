package com.inv.model;

public class Staff {
    private String staffId;
    private String staffName;
    private String role;
    private String phone;
    private String email;
    private String password;
    private boolean active;

    public Staff() {}

    public Staff(String staffId, String staffName, String role, String phone,
                 String email, String password, boolean active) {
        this.staffId = staffId;
        this.staffName = staffName;
        this.role = role;
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.active = active;
    }

    public String getStaffId()               { return staffId; }
    public void   setStaffId(String v)       { this.staffId = v; }
    public String getStaffName()             { return staffName; }
    public void   setStaffName(String v)     { this.staffName = v; }
    public String getRole()                  { return role; }
    public void   setRole(String v)          { this.role = v; }
    public String getPhone()                 { return phone; }
    public void   setPhone(String v)         { this.phone = v; }
    public String getEmail()                 { return email; }
    public void   setEmail(String v)         { this.email = v; }
    public String getPassword()              { return password; }
    public void   setPassword(String v)      { this.password = v; }
    public boolean isActive()               { return active; }
    public void    setActive(boolean v)     { this.active = v; }
}
