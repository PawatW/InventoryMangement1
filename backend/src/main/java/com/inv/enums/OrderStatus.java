package com.inv.enums;

public enum OrderStatus {
    CONFIRMED("Confirmed"),
    PENDING("Pending"),
    CLOSED("Closed");

    private final String value;

    OrderStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static OrderStatus fromValue(String value) {
        for (OrderStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown OrderStatus: " + value);
    }
}
