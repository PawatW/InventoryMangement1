package com.inv.dto.response;

public class CreateRequestResponse {
    private final String requestId;

    public CreateRequestResponse(String requestId) {
        this.requestId = requestId;
    }

    public String getRequestId() { return requestId; }
}
