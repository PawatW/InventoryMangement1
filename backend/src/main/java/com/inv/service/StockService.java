package com.inv.service;

import com.inv.dto.request.FulfillBatchRequest;
import com.inv.dto.request.FulfillRequest;
import com.inv.model.ProductBatch;
import com.inv.model.Request;
import com.inv.model.RequestItem;
import com.inv.model.StockTransaction;
import com.inv.repo.*;
import com.inv.util.IdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StockService {

    private final StockTransactionRepository txRepository;
    private final ProductRepository          productRepository;
    private final ProductBatchRepository     batchRepository;
    private final RequestRepository          requestRepository;
    private final OrderRepository            orderRepository;

    public StockService(StockTransactionRepository txRepository,
                        ProductRepository productRepository,
                        ProductBatchRepository batchRepository,
                        RequestRepository requestRepository,
                        OrderRepository orderRepository) {
        this.txRepository    = txRepository;
        this.productRepository = productRepository;
        this.batchRepository   = batchRepository;
        this.requestRepository = requestRepository;
        this.orderRepository   = orderRepository;
    }

    public List<StockTransaction> getAllTransactions() {
        return txRepository.findAll();
    }

    public List<StockTransaction> getTransactionsForRequest(String requestId) {
        return txRepository.findByReferenceId(requestId);
    }

    public List<Request> getApprovedRequests() {
        return requestRepository.findApprovedRequests();
    }

    @Transactional
    public void addStockIn(String productId, int quantity, String staffId,
                           String supplierId, BigDecimal unitCost, String description) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found: " + productId));

        productRepository.updateQuantity(productId, quantity);

        String batchId = IdGenerator.generate("BATCH-");
        ProductBatch batch = new ProductBatch();
        batch.setBatchId(batchId);
        batch.setProductId(productId);
        batch.setPoId(null);
        batch.setQuantityIn(quantity);
        batch.setQuantityRemaining(quantity);
        batch.setUnitCost(unitCost != null ? unitCost : BigDecimal.ZERO);
        batchRepository.save(batch);

        StringBuilder desc = new StringBuilder("Stock in");
        if (supplierId != null && !supplierId.isBlank()) {
            desc.append(" from supplier ").append(supplierId);
        }
        if (description != null && !description.isBlank()) {
            desc.append(" - ").append(description);
        }

        StockTransaction tx = new StockTransaction();
        tx.setTransactionId(IdGenerator.generate("ST-"));
        tx.setType("IN");
        tx.setProductId(productId);
        tx.setQuantity(quantity);
        tx.setStaffId(staffId);
        tx.setDescription(desc.toString());
        tx.setBatchId(batchId);
        txRepository.save(tx);
    }

    @Transactional
    public void adjustStock(String productId, int delta, String staffId, String description) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found: " + productId));

        productRepository.updateQuantity(productId, delta);

        StockTransaction tx = new StockTransaction();
        tx.setTransactionId(IdGenerator.generate("ST-"));
        tx.setType("ADJUST");
        tx.setProductId(productId);
        tx.setQuantity(Math.abs(delta));
        tx.setStaffId(staffId);
        tx.setDescription(description != null ? description : "Manual adjustment");
        txRepository.save(tx);
    }

    @Transactional
    public void fulfillItem(String requestItemId, int fulfillQty, String warehouseStaffId) {
        if (fulfillQty <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "fulfillQty must be greater than 0");
        }

        RequestItem item = requestRepository.findItemById(requestItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Request item not found: " + requestItemId));

        if (fulfillQty > item.getRemainingQty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "fulfillQty (" + fulfillQty + ") exceeds remaining quantity (" +
                    item.getRemainingQty() + ")");
        }

        String requestId = item.getRequestId();
        String productId = item.getProductId();

        var product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found: " + productId));

        if (product.getQuantity() < fulfillQty) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Insufficient stock: available=" + product.getQuantity() +
                    ", requested=" + fulfillQty);
        }

        // FIFO batch deduction
        List<ProductBatch> batches = batchRepository.findAvailableBatches(productId);
        int remaining = fulfillQty;
        for (ProductBatch batch : batches) {
            if (remaining <= 0) break;
            int take = Math.min(batch.getQuantityRemaining(), remaining);
            batchRepository.updateRemaining(batch.getBatchId(),
                    batch.getQuantityRemaining() - take);

            StockTransaction tx = new StockTransaction();
            tx.setTransactionId(IdGenerator.generate("ST-"));
            tx.setType("OUT");
            tx.setProductId(productId);
            tx.setQuantity(take);
            tx.setStaffId(warehouseStaffId);
            tx.setBatchId(batch.getBatchId());
            tx.setReferenceId(requestId);
            tx.setDescription("Fulfill Request ID " + requestId);
            txRepository.save(tx);

            remaining -= take;
        }

        if (remaining > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "สินค้าในคลังไม่เพียงพอตามล็อตสินค้า");
        }

        requestRepository.updateItemFulfillment(requestItemId, fulfillQty);
        productRepository.updateQuantity(productId, -fulfillQty);
        requestRepository.updateRequestStatus(requestId, "Pending");

        Request request = requestRepository.findById(requestId).orElse(null);
        if (request != null && request.getOrderId() != null && !request.getOrderId().isBlank()) {
            orderRepository.updateOrderItemFulfillment(
                    request.getOrderId(), productId, fulfillQty);
        }
    }

    @Transactional
    public void fulfillBatch(FulfillBatchRequest req, String warehouseStaffId) {
        for (FulfillRequest fr : req.getItems()) {
            fulfillItem(fr.getRequestItemId(), fr.getFulfillQty(), warehouseStaffId);
        }
    }
}
