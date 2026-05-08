package com.inv.controller;

import com.inv.dto.request.CreateRequestRequest;
import com.inv.dto.response.CreateRequestResponse;
import com.inv.model.Request;
import com.inv.model.RequestItem;
import com.inv.service.RequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/requests")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public ResponseEntity<List<Request>> getAll(
            @RequestParam(required = false) String orderId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(requestService.getAllRequests(orderId, status));
    }

    @PostMapping
    public ResponseEntity<CreateRequestResponse> create(
            @Valid @RequestBody CreateRequestRequest req,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requestService.createRequest(req, principal.getName()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Request>> getPending() {
        return ResponseEntity.ok(requestService.getPendingRequests());
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<RequestItem>> getItems(@PathVariable String id) {
        return ResponseEntity.ok(requestService.getItemsByRequestId(id));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable String id, Principal principal) {
        requestService.approveRequest(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable String id, Principal principal) {
        requestService.rejectRequest(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ready-to-close")
    public ResponseEntity<List<Request>> getReadyToClose() {
        return ResponseEntity.ok(requestService.getReadyToCloseRequests());
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Void> close(@PathVariable String id, Principal principal) {
        requestService.closeRequest(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
