package com.inv.service;

import com.inv.dto.request.CreateProductRequest;
import com.inv.dto.request.UpdateProductRequest;
import com.inv.model.Product;
import com.inv.model.ProductBatch;
import com.inv.model.StockTransaction;
import com.inv.repo.ProductBatchRepository;
import com.inv.repo.ProductRepository;
import com.inv.repo.StockTransactionRepository;
import com.inv.util.IdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductBatchRepository batchRepository;
    private final StockTransactionRepository txRepository;

    public ProductService(ProductRepository productRepository,
                          ProductBatchRepository batchRepository,
                          StockTransactionRepository txRepository) {
        this.productRepository = productRepository;
        this.batchRepository = batchRepository;
        this.txRepository = txRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found: " + id));
    }

    @Transactional
    public Product createProduct(CreateProductRequest req, String staffId) {
        if (req.getQuantity() > 1 &&
                (req.getCostPrice() == null || req.getCostPrice().compareTo(BigDecimal.ZERO) <= 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "costPrice must be greater than 0 when initial quantity is greater than 1");
        }

        Product product = new Product();
        product.setProductId(IdGenerator.generate("PROD-"));
        product.setProductName(req.getProductName());
        product.setDescription(req.getDescription());
        product.setUnit(req.getUnit());
        product.setCostPrice(req.getCostPrice() != null ? req.getCostPrice() : BigDecimal.ZERO);
        product.setSellPrice(req.getSellPrice() != null ? req.getSellPrice() : BigDecimal.ZERO);
        product.setQuantity(req.getQuantity());
        product.setSupplierId(req.getSupplierId());
        product.setImageUrl(req.getImageUrl());
        product.setActive(true);
        product.setCreatedByStaffId(staffId);

        productRepository.save(product);

        if (req.getQuantity() > 1) {
            String batchId = IdGenerator.generate("BATCH-");

            ProductBatch batch = new ProductBatch();
            batch.setBatchId(batchId);
            batch.setProductId(product.getProductId());
            batch.setPoId(null);
            batch.setQuantityIn(req.getQuantity());
            batch.setQuantityRemaining(req.getQuantity());
            batch.setUnitCost(req.getCostPrice());
            batchRepository.save(batch);

            StockTransaction tx = new StockTransaction();
            tx.setTransactionId(IdGenerator.generate("ST-"));
            tx.setType("IN");
            tx.setProductId(product.getProductId());
            tx.setQuantity(req.getQuantity());
            tx.setStaffId(staffId);
            tx.setDescription("Initial stock recorded on product creation");
            tx.setBatchId(batchId);
            txRepository.save(tx);
        }

        return product;
    }

    public Product updateProductDetails(String id, UpdateProductRequest req) {
        Product product = getProductById(id);
        productRepository.updateDetails(id, req.getProductName(), req.getDescription(), req.getImageUrl());
        product.setProductName(req.getProductName());
        product.setDescription(req.getDescription());
        product.setImageUrl(req.getImageUrl());
        return product;
    }

    public Product updateSellPrice(String id, BigDecimal sellPrice) {
        if (sellPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "sellPrice must be >= 0");
        }
        Product product = getProductById(id);
        productRepository.updateSellPrice(id, sellPrice);
        product.setSellPrice(sellPrice);
        return product;
    }

    public void adjustQuantity(String id, int diff) {
        getProductById(id);
        productRepository.updateQuantity(id, diff);
    }

    public void deactivateProduct(String id) {
        getProductById(id);
        productRepository.deactivate(id);
    }

    public List<ProductBatch> getProductBatches(String productId) {
        getProductById(productId);
        return batchRepository.findByProduct(productId);
    }

    public List<ProductBatch> getAvailableProductBatches(String productId) {
        getProductById(productId);
        return batchRepository.findAvailableBatches(productId);
    }

    public ProductBatch getProductBatch(String productId, String batchId) {
        getProductById(productId);
        return batchRepository.findById(batchId)
                .filter(b -> b.getProductId().equals(productId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Batch not found: " + batchId));
    }
}
