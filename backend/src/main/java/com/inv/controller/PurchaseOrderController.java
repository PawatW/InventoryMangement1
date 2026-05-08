package com.inv.controller;

import com.inv.dto.request.CreatePurchaseOrderRequest;
import com.inv.dto.request.ReceivePurchaseOrderRequest;
import com.inv.dto.request.UpdatePricingRequest;
import com.inv.model.ProductBatch;
import com.inv.model.PurchaseOrder;
import com.inv.service.ImageService;
import com.inv.service.PurchaseOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;
    private final ImageService         imageService;

    public PurchaseOrderController(PurchaseOrderService poService, ImageService imageService) {
        this.poService    = poService;
        this.imageService = imageService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAll(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(poService.getPurchaseOrders(status));
    }

    @PostMapping
    public ResponseEntity<PurchaseOrder> create(
            @Valid @RequestBody CreatePurchaseOrderRequest req,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(poService.createPurchaseOrder(req, principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> getById(@PathVariable String id) {
        return ResponseEntity.ok(poService.getPurchaseOrder(id));
    }

    @PutMapping("/{id}/pricing")
    public ResponseEntity<PurchaseOrder> updatePricing(
            @PathVariable String id,
            @Valid @RequestBody UpdatePricingRequest req) {
        return ResponseEntity.ok(poService.updatePricing(id, req));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrder> receive(
            @PathVariable String id,
            @Valid @RequestBody ReceivePurchaseOrderRequest req) {
        return ResponseEntity.ok(poService.receivePurchaseOrder(id, req));
    }

    @GetMapping("/{id}/batches")
    public ResponseEntity<List<ProductBatch>> getBatches(@PathVariable String id) {
        return ResponseEntity.ok(poService.getBatchesForPurchaseOrder(id));
    }

    @PostMapping("/upload-slip")
    public ResponseEntity<Map<String, String>> uploadSlip(
            @RequestParam("file") MultipartFile file) {
        String url = imageService.uploadProductImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
