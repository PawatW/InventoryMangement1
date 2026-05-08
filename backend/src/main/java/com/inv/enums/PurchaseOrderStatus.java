package com.inv.enums;

public enum PurchaseOrderStatus {
    NEW_ORDER("New order"),
    PENDING("Pending"),
    RECEIVED("Received"),
    REJECTED("Rejected");

    private final String value;

    PurchaseOrderStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PurchaseOrderStatus fromValue(String value) {
        for (PurchaseOrderStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown PurchaseOrderStatus: " + value);
    }
}
