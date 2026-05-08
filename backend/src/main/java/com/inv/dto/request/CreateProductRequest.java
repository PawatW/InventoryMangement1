package com.inv.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class CreateProductRequest {
    @NotBlank
    private String productName;
    private String description;
    private String unit;
    private String supplierId;

    @DecimalMin("0")
    private BigDecimal costPrice = BigDecimal.ZERO;

    @DecimalMin("0")
    private BigDecimal sellPrice = BigDecimal.ZERO;

    @Min(0)
    private int quantity = 0;

    private String imageUrl;
    private String createdByStaffId;

    public String     getProductName()               { return productName; }
    public void       setProductName(String v)       { this.productName = v; }
    public String     getDescription()               { return description; }
    public void       setDescription(String v)       { this.description = v; }
    public String     getUnit()                      { return unit; }
    public void       setUnit(String v)              { this.unit = v; }
    public String     getSupplierId()                { return supplierId; }
    public void       setSupplierId(String v)        { this.supplierId = v; }
    public BigDecimal getCostPrice()                 { return costPrice; }
    public void       setCostPrice(BigDecimal v)     { this.costPrice = v; }
    public BigDecimal getSellPrice()                 { return sellPrice; }
    public void       setSellPrice(BigDecimal v)     { this.sellPrice = v; }
    public int        getQuantity()                  { return quantity; }
    public void       setQuantity(int v)             { this.quantity = v; }
    public String     getImageUrl()                  { return imageUrl; }
    public void       setImageUrl(String v)          { this.imageUrl = v; }
    public String     getCreatedByStaffId()          { return createdByStaffId; }
    public void       setCreatedByStaffId(String v)  { this.createdByStaffId = v; }
}
