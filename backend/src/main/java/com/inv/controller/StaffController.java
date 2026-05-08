package com.inv.controller;

import com.inv.dto.request.CreateStaffRequest;
import com.inv.dto.request.UpdateActiveRequest;
import com.inv.dto.response.StaffResponse;
import com.inv.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/staff")
public class StaffController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public ResponseEntity<List<StaffResponse>> getAll() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @PostMapping
    public ResponseEntity<StaffResponse> create(@Valid @RequestBody CreateStaffRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.createStaff(req));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<Void> updateActive(@PathVariable String id,
                                             @RequestBody UpdateActiveRequest req) {
        staffService.updateStaffActive(id, req.isActive());
        return ResponseEntity.noContent().build();
    }
}
