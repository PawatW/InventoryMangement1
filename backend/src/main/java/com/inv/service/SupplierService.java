package com.inv.service;

import com.inv.dto.request.CreateSupplierRequest;
import com.inv.dto.request.UpdateSupplierRequest;
import com.inv.model.Supplier;
import com.inv.repo.SupplierRepository;
import com.inv.util.IdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Supplier getSupplierById(String id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Supplier not found: " + id));
    }

    public Supplier createSupplier(CreateSupplierRequest req) {
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            supplierRepository.findByEmail(req.getEmail()).ifPresent(s -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Email already in use: " + req.getEmail());
            });
        }

        Supplier supplier = new Supplier();
        supplier.setSupplierId(IdGenerator.generate("SUP-"));
        supplier.setSupplierName(req.getSupplierName());
        supplier.setAddress(req.getAddress());
        supplier.setPhone(req.getPhone());
        supplier.setEmail(req.getEmail());
        supplier.setActive(true);

        supplierRepository.save(supplier);
        return supplier;
    }

    public Supplier updateSupplier(String id, UpdateSupplierRequest req) {
        Supplier existing = getSupplierById(id);

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            supplierRepository.findByEmail(req.getEmail())
                    .filter(s -> !s.getSupplierId().equals(id))
                    .ifPresent(s -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                "Email already in use: " + req.getEmail());
                    });
        }

        supplierRepository.update(id, req.getSupplierName(), req.getAddress(),
                req.getPhone(), req.getEmail());

        existing.setSupplierName(req.getSupplierName());
        existing.setAddress(req.getAddress());
        existing.setPhone(req.getPhone());
        existing.setEmail(req.getEmail());
        return existing;
    }

    public void deactivateSupplier(String id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Supplier not found: " + id));
        if (!supplier.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Supplier not found or already inactive: " + id);
        }
        supplierRepository.deactivate(id);
    }
}
