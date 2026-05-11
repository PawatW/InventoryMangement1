package com.inv.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.url:}")
    private String cloudinaryUrl;

    @Bean
    public Cloudinary cloudinary() {
        if (cloudinaryUrl == null || cloudinaryUrl.isBlank() || !cloudinaryUrl.startsWith("cloudinary://")) {
            // Return a no-op instance when URL is not configured
            return new Cloudinary(new HashMap<String, String>());
        }
        return new Cloudinary(cloudinaryUrl);
    }
}
