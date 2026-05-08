package com.inv.enums;

public enum RequestStatus {
    AWAITING_APPROVAL("Awaiting Approval"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    PENDING("Pending"),
    CLOSED("Closed");

    private final String value;

    RequestStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static RequestStatus fromValue(String value) {
        for (RequestStatus s : values()) {
            if (s.value.equalsIgnoreCase(value)) return s;
        }
        throw new IllegalArgumentException("Unknown RequestStatus: " + value);
    }
}
