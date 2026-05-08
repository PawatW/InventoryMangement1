package com.inv.dto.response;

import com.inv.model.Staff;

public class StaffResponse {
    private String  staffId;
    private String  staffName;
    private String  role;
    private String  email;
    private String  phone;
    private boolean active;

    public static StaffResponse from(Staff staff) {
        StaffResponse r = new StaffResponse();
        r.staffId   = staff.getStaffId();
        r.staffName = staff.getStaffName();
        r.role      = staff.getRole();
        r.email     = staff.getEmail();
        r.phone     = staff.getPhone();
        r.active    = staff.isActive();
        return r;
    }

    public String  getStaffId()    { return staffId; }
    public String  getStaffName()  { return staffName; }
    public String  getRole()       { return role; }
    public String  getEmail()      { return email; }
    public String  getPhone()      { return phone; }
    public boolean isActive()      { return active; }
}
