package com.inv.controller;

import com.inv.dto.request.CreateSupplierRequest;
import com.inv.dto.request.UpdateSupplierRequest;
import com.inv.model.Supplier;
import com.inv.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<List<Supplier>> getAll() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getById(@PathVariable String id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    @PostMapping
    public ResponseEntity<Supplier> create(@Valid @RequestBody CreateSupplierRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.createSupplier(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(@PathVariable String id,
                                           @Valid @RequestBody UpdateSupplierRequest req) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        supplierService.deactivateSupplier(id);
        return ResponseEntity.noContent().build();
    }
}
