package com.inv.controller;

import com.inv.dto.request.FulfillBatchRequest;
import com.inv.dto.request.FulfillRequest;
import com.inv.dto.request.StockInRequest;
import com.inv.model.Request;
import com.inv.model.StockTransaction;
import com.inv.service.StockService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/stock")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<StockTransaction>> getTransactions() {
        return ResponseEntity.ok(stockService.getAllTransactions());
    }

    @GetMapping("/requests/{requestId}/transactions")
    public ResponseEntity<List<StockTransaction>> getTransactionsForRequest(
            @PathVariable String requestId) {
        return ResponseEntity.ok(stockService.getTransactionsForRequest(requestId));
    }

    @PostMapping("/in")
    public ResponseEntity<Void> stockIn(@Valid @RequestBody StockInRequest req,
                                        Principal principal) {
        stockService.addStockIn(req.getProductId(), req.getQuantity(),
                principal.getName(), req.getSupplierId(), req.getNote());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/approved-requests")
    public ResponseEntity<List<Request>> getApprovedRequests() {
        return ResponseEntity.ok(stockService.getApprovedRequests());
    }

    @PostMapping("/fulfill")
    public ResponseEntity<Void> fulfill(@Valid @RequestBody FulfillRequest req,
                                        Principal principal) {
        stockService.fulfillItem(req.getRequestItemId(), req.getFulfillQty(),
                principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/fulfill-batch")
    public ResponseEntity<Void> fulfillBatch(@Valid @RequestBody FulfillBatchRequest req,
                                             Principal principal) {
        stockService.fulfillBatch(req, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
