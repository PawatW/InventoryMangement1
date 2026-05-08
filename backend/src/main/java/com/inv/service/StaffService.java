package com.inv.service;

import com.inv.dto.request.CreateStaffRequest;
import com.inv.dto.response.StaffResponse;
import com.inv.model.Staff;
import com.inv.repo.UserRepository;
import com.inv.util.IdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StaffService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<StaffResponse> getAllStaff() {
        return userRepository.findAll().stream()
                .map(StaffResponse::from)
                .toList();
    }

    public StaffResponse createStaff(CreateStaffRequest req) {
        userRepository.findByEmail(req.getEmail()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Email already in use: " + req.getEmail());
        });

        Staff staff = new Staff();
        staff.setStaffId(IdGenerator.generate("STF-"));
        staff.setStaffName(req.getStaffName());
        staff.setEmail(req.getEmail());
        staff.setRole(req.getRole());
        staff.setPhone(req.getPhone());
        staff.setPassword(passwordEncoder.encode(req.getPassword()));
        staff.setActive(true);

        userRepository.save(staff);
        return StaffResponse.from(staff);
    }

    public void updateStaffActive(String staffId, boolean active) {
        Staff staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Staff not found: " + staffId));

        if (staff.isActive() == active) return;

        userRepository.updateActive(staffId, active);
    }
}
