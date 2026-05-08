package com.inv.exception;

import java.time.Instant;
import java.util.Map;

public class ErrorResponse {
    private final String message;
    private final Map<String, String> errors;
    private final Instant timestamp;

    public ErrorResponse(String message, Map<String, String> errors) {
        this.message = message;
        this.errors = errors;
        this.timestamp = Instant.now();
    }

    public ErrorResponse(String message) {
        this(message, null);
    }

    public String getMessage() { return message; }
    public Map<String, String> getErrors() { return errors; }
    public Instant getTimestamp() { return timestamp; }
}
