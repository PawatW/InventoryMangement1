package com.inv.dto.response;

public class CreateOrderResponse {
    private final String orderId;

    public CreateOrderResponse(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderId() { return orderId; }
}
