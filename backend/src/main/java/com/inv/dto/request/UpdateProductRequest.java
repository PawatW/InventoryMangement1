package com.inv.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateProductRequest {
    @NotBlank
    private String productName;
    private String description;
    private String imageUrl;

    public String getProductName()           { return productName; }
    public void   setProductName(String v)   { this.productName = v; }
    public String getDescription()           { return description; }
    public void   setDescription(String v)   { this.description = v; }
    public String getImageUrl()              { return imageUrl; }
    public void   setImageUrl(String v)      { this.imageUrl = v; }
}
