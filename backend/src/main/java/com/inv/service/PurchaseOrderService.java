package com.inv.service;

import com.inv.dto.request.*;
import com.inv.model.ProductBatch;
import com.inv.model.PurchaseItem;
import com.inv.model.PurchaseOrder;
import com.inv.model.StockTransaction;
import com.inv.repo.ProductBatchRepository;
import com.inv.repo.ProductRepository;
import com.inv.repo.PurchaseOrderRepository;
import com.inv.repo.StockTransactionRepository;
import com.inv.util.IdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository    poRepository;
    private final ProductRepository          productRepository;
    private final ProductBatchRepository     batchRepository;
    private final StockTransactionRepository txRepository;

    public PurchaseOrderService(PurchaseOrderRepository poRepository,
                                ProductRepository productRepository,
                                ProductBatchRepository batchRepository,
                                StockTransactionRepository txRepository) {
        this.poRepository      = poRepository;
        this.productRepository = productRepository;
        this.batchRepository   = batchRepository;
        this.txRepository      = txRepository;
    }

    private PurchaseOrder loadWithItems(PurchaseOrder po) {
        po.setItems(poRepository.findItems(po.getPoId()));
        return po;
    }

    public List<PurchaseOrder> getPurchaseOrders(String status) {
        List<PurchaseOrder> list = status != null && !status.isBlank()
                ? poRepository.findByStatus(status)
                : poRepository.findAll();
        list.forEach(this::loadWithItems);
        return list;
    }

    public PurchaseOrder getPurchaseOrder(String poId) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Purchase order not found: " + poId));
        return loadWithItems(po);
    }

    @Transactional
    public PurchaseOrder createPurchaseOrder(CreatePurchaseOrderRequest req, String staffId) {
        String poId = IdGenerator.generate("PO-");

        PurchaseOrder po = new PurchaseOrder();
        po.setPoId(poId);
        po.setSupplierId(req.getSupplierId());
        po.setStaffId(staffId);
        po.setTotalAmount(BigDecimal.ZERO);
        po.setStatus("New order");
        po.setSlipUrl(null);

        List<PurchaseItem> items = req.getItems().stream().map(r -> {
            PurchaseItem item = new PurchaseItem();
            item.setPoItemId(IdGenerator.generate("POI-"));
            item.setPoId(poId);
            item.setProductId(r.getProductId());
            item.setQuantity(r.getQuantity());
            item.setUnitPrice(BigDecimal.ZERO);
            return item;
        }).toList();

        po.setItems(items);
        poRepository.save(po);
        return po;
    }

    @Transactional
    public PurchaseOrder updatePricing(String poId, UpdatePricingRequest req) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Purchase order not found: " + poId));

        if (req.isReject()) {
            poRepository.updateStatus(poId, "Rejected");
            poRepository.updateSlipUrl(poId, null);
            po.setStatus("Rejected");
            po.setSlipUrl(null);
            return loadWithItems(po);
        }

        if (req.getSlipUrl() == null || req.getSlipUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "slipUrl is required when not rejecting");
        }

        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "items must not be empty");
        }

        for (PricingItemRequest item : req.getItems()) {
            if (item.getUnitPrice() == null ||
                    item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "unitPrice must be > 0 for item: " + item.getPoItemId());
            }
            poRepository.updateItemCost(item.getPoItemId(), item.getUnitPrice());
        }

        List<PurchaseItem> updatedItems = poRepository.findItems(poId);
        BigDecimal total = updatedItems.stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        poRepository.updateTotalAmount(poId, total);
        poRepository.updateStatus(poId, "Pending");
        poRepository.updateSlipUrl(poId, req.getSlipUrl());

        po.setStatus("Pending");
        po.setTotalAmount(total);
        po.setSlipUrl(req.getSlipUrl());
        po.setItems(updatedItems);
        return po;
    }

    @Transactional
    public PurchaseOrder receivePurchaseOrder(String poId, ReceivePurchaseOrderRequest req) {
        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Purchase order not found: " + poId));

        BigDecimal newTotal = BigDecimal.ZERO;

        for (ReceiveItemRequest r : req.getItems()) {
            var product = productRepository.findById(
                    poRepository.findItemById(r.getPoItemId())
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "PO item not found: " + r.getPoItemId()))
                            .getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Product not found for PO item: " + r.getPoItemId()));

            // Weighted average cost
            BigDecimal newAvg;
            int oldQty = product.getQuantity();
            BigDecimal oldCost = product.getCostPrice();
            if (oldQty <= 0 || oldCost == null || oldCost.compareTo(BigDecimal.ZERO) <= 0) {
                newAvg = r.getUnitPrice();
            } else {
                BigDecimal oldTotal = oldCost.multiply(BigDecimal.valueOf(oldQty));
                BigDecimal addTotal = r.getUnitPrice().multiply(BigDecimal.valueOf(r.getQuantity()));
                newAvg = oldTotal.add(addTotal)
                        .divide(BigDecimal.valueOf((long) oldQty + r.getQuantity()),
                                4, RoundingMode.HALF_UP);
            }

            productRepository.updateQuantity(product.getProductId(), r.getQuantity());
            productRepository.updateCostPrice(product.getProductId(), newAvg);

            String batchId = IdGenerator.generate("BATCH-");
            ProductBatch batch = new ProductBatch();
            batch.setBatchId(batchId);
            batch.setProductId(product.getProductId());
            batch.setPoId(poId);
            batch.setQuantityIn(r.getQuantity());
            batch.setQuantityRemaining(r.getQuantity());
            batch.setUnitCost(r.getUnitPrice());
            batchRepository.save(batch);

            StockTransaction tx = new StockTransaction();
            tx.setTransactionId(IdGenerator.generate("ST-"));
            tx.setType("IN");
            tx.setProductId(product.getProductId());
            tx.setQuantity(r.getQuantity());
            tx.setStaffId(req.getStaffId());
            tx.setBatchId(batchId);
            tx.setReferenceId(poId);
            tx.setDescription("รับสินค้าเข้าจาก PO " + poId);
            txRepository.save(tx);

            poRepository.updateItemQuantity(r.getPoItemId(), r.getQuantity());
            poRepository.updateItemCost(r.getPoItemId(), r.getUnitPrice());

            newTotal = newTotal.add(
                    r.getUnitPrice().multiply(BigDecimal.valueOf(r.getQuantity())));
        }

        poRepository.updateStatus(poId, "Received");
        poRepository.updateTotalAmount(poId, newTotal);

        return loadWithItems(po);
    }

    public List<ProductBatch> getBatchesForPurchaseOrder(String poId) {
        poRepository.findById(poId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Purchase order not found: " + poId));
        return batchRepository.findByPurchaseOrder(poId);
    }
}
