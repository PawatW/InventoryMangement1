package com.inv.controller;

import com.inv.dto.request.CreateProductRequest;
import com.inv.dto.request.UpdateProductRequest;
import com.inv.dto.request.UpdateSellPriceRequest;
import com.inv.model.Product;
import com.inv.model.ProductBatch;
import com.inv.service.ImageService;
import com.inv.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;
    private final ImageService imageService;

    public ProductController(ProductService productService, ImageService imageService) {
        this.productService = productService;
        this.imageService = imageService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody CreateProductRequest req,
                                          Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(req, principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable String id,
                                          @Valid @RequestBody UpdateProductRequest req) {
        return ResponseEntity.ok(productService.updateProductDetails(id, req));
    }

    @PutMapping("/{id}/sell-price")
    public ResponseEntity<Product> updateSellPrice(@PathVariable String id,
                                                   @Valid @RequestBody UpdateSellPriceRequest req) {
        return ResponseEntity.ok(productService.updateSellPrice(id, req.getSellPrice()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable String id) {
        productService.deactivateProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/adjust")
    public ResponseEntity<Void> adjust(@PathVariable String id,
                                       @RequestParam int diff) {
        productService.adjustQuantity(id, diff);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/batches")
    public ResponseEntity<List<ProductBatch>> getBatches(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductBatches(id));
    }

    @GetMapping("/{id}/available-batches")
    public ResponseEntity<List<ProductBatch>> getAvailableBatches(@PathVariable String id) {
        return ResponseEntity.ok(productService.getAvailableProductBatches(id));
    }

    @GetMapping("/{productId}/batches/{batchId}")
    public ResponseEntity<ProductBatch> getBatch(@PathVariable String productId,
                                                 @PathVariable String batchId) {
        return ResponseEntity.ok(productService.getProductBatch(productId, batchId));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        String url = imageService.uploadProductImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
