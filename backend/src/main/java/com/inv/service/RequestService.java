package com.inv.service;

import com.inv.dto.request.CreateRequestRequest;
import com.inv.dto.request.RequestItemRequest;
import com.inv.dto.response.CreateRequestResponse;
import com.inv.model.OrderItem;
import com.inv.model.Request;
import com.inv.model.RequestItem;
import com.inv.repo.OrderRepository;
import com.inv.repo.RequestRepository;
import com.inv.util.IdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final OrderRepository   orderRepository;

    public RequestService(RequestRepository requestRepository,
                          OrderRepository orderRepository) {
        this.requestRepository = requestRepository;
        this.orderRepository   = orderRepository;
    }

    public List<Request> getAllRequests(String orderId, String status) {
        return requestRepository.findWithFilters(orderId, status);
    }

    public List<Request> getRequestsByOrderId(String orderId) {
        return requestRepository.findByOrderId(orderId);
    }

    @Transactional
    public CreateRequestResponse createRequest(CreateRequestRequest req, String staffId) {
        if (req.getOrderId() != null && !req.getOrderId().isBlank()) {
            List<OrderItem> orderItems = orderRepository.findItemsByOrderId(req.getOrderId());

            Map<String, OrderItem> orderItemMap = orderItems.stream()
                    .collect(Collectors.toMap(OrderItem::getProductId, oi -> oi));

            for (RequestItemRequest itemReq : req.getItems()) {
                OrderItem orderItem = orderItemMap.get(itemReq.getProductId());
                if (orderItem == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Product " + itemReq.getProductId() + " is not in the order");
                }
                if (itemReq.getQuantity() > orderItem.getRemainingQty()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Requested quantity for product " + itemReq.getProductId() +
                            " exceeds remaining order quantity (" + orderItem.getRemainingQty() + ")");
                }
            }
        }

        String requestId = IdGenerator.generate("REQ-");

        Request request = new Request();
        request.setRequestId(requestId);
        request.setStatus("Awaiting Approval");
        request.setOrderId(req.getOrderId());
        request.setCustomerId(req.getCustomerId());
        request.setStaffId(staffId);
        request.setDescription(req.getDescription());
        requestRepository.save(request);

        for (RequestItemRequest itemReq : req.getItems()) {
            RequestItem item = new RequestItem();
            item.setRequestItemId(IdGenerator.generate("RIT-"));
            item.setRequestId(requestId);
            item.setProductId(itemReq.getProductId());
            item.setQuantity(itemReq.getQuantity());
            requestRepository.saveRequestItem(item);
        }

        return new CreateRequestResponse(requestId);
    }

    public List<Request> getPendingRequests() {
        return requestRepository.findPendingRequests();
    }

    public List<RequestItem> getItemsByRequestId(String requestId) {
        requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Request not found: " + requestId));
        return requestRepository.findItemsByRequestId(requestId);
    }

    public void approveRequest(String requestId, String approverId) {
        requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Request not found: " + requestId));
        requestRepository.updateStatus(requestId, "Approved", approverId);
    }

    public void rejectRequest(String requestId, String approverId) {
        requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Request not found: " + requestId));
        requestRepository.updateStatus(requestId, "Rejected", approverId);
    }

    public List<Request> getReadyToCloseRequests() {
        return requestRepository.findReadyToCloseRequests();
    }

    public void closeRequest(String requestId, String staffId) {
        requestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Request not found: " + requestId));
        requestRepository.closeRequest(requestId);
    }
}
