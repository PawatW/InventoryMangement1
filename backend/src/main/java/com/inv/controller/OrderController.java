package com.inv.controller;

import com.inv.dto.request.CreateOrderRequest;
import com.inv.dto.response.CreateOrderResponse;
import com.inv.model.Order;
import com.inv.model.OrderItem;
import com.inv.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAll() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PostMapping
    public ResponseEntity<CreateOrderResponse> create(@Valid @RequestBody CreateOrderRequest req,
                                                      Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(req, principal.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMy(Principal principal) {
        return ResponseEntity.ok(orderService.getMyOrders(principal.getName()));
    }

    @GetMapping("/confirmed")
    public ResponseEntity<List<Order>> getConfirmed() {
        return ResponseEntity.ok(orderService.getConfirmedOrders());
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<OrderItem>> getItems(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getItemsByOrderId(id));
    }

    @GetMapping("/ready-to-close")
    public ResponseEntity<List<Order>> getReadyToClose() {
        return ResponseEntity.ok(orderService.getOrdersReadyToClose());
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Void> close(@PathVariable String id, Principal principal) {
        orderService.closeOrder(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
