package com.inv.service;

import com.inv.dto.request.CreateOrderRequest;
import com.inv.dto.request.OrderItemRequest;
import com.inv.dto.response.CreateOrderResponse;
import com.inv.model.Order;
import com.inv.model.OrderItem;
import com.inv.repo.OrderRepository;
import com.inv.util.IdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest req, String staffId) {
        String orderId = IdGenerator.generate("ORD-");

        BigDecimal totalAmount = req.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = new Order();
        order.setOrderId(orderId);
        order.setTotalAmount(totalAmount);
        order.setStatus("Confirmed");
        order.setCustomerId(req.getCustomerId());
        order.setStaffId(staffId);
        orderRepository.save(order);

        for (OrderItemRequest itemReq : req.getItems()) {
            OrderItem item = new OrderItem();
            item.setOrderItemId(IdGenerator.generate("ITM-"));
            item.setOrderId(orderId);
            item.setProductId(itemReq.getProductId());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setLineTotal(itemReq.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            orderRepository.saveOrderItem(item);
        }

        return new CreateOrderResponse(orderId);
    }

    public List<Order> getConfirmedOrders() {
        return orderRepository.findConfirmedOrders();
    }

    public List<OrderItem> getItemsByOrderId(String orderId) {
        orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Order not found: " + orderId));
        return orderRepository.findItemsByOrderId(orderId);
    }

    public List<Order> getOrdersReadyToClose() {
        return orderRepository.findOrdersReadyToClose();
    }

    @Transactional
    public void closeOrder(String orderId, String staffId) {
        orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Order not found: " + orderId));

        if (orderRepository.hasPendingRequests(orderId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Order has pending requests and cannot be closed");
        }

        orderRepository.closeOrder(orderId);
    }
}
