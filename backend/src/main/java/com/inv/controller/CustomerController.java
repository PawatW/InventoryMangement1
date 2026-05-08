package com.inv.controller;

import com.inv.dto.request.CreateCustomerRequest;
import com.inv.dto.request.UpdateCustomerRequest;
import com.inv.model.Customer;
import com.inv.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAll() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable String id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    public ResponseEntity<Customer> create(@Valid @RequestBody CreateCustomerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable String id,
                                           @Valid @RequestBody UpdateCustomerRequest req) {
        return ResponseEntity.ok(customerService.updateCustomer(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        customerService.deactivateCustomer(id);
        return ResponseEntity.noContent().build();
    }
}
