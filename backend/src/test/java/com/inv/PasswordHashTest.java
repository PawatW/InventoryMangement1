package com.inv;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordHashTest {

    @Test
    void verifyAndPrintHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String password = "defaultPassword123";
        String seedHash = "$2a$12$XjqpAEgrAfjYiwizTtrR0e/uAS8ZMho5QH9vqG52/B196DQnvecCG";

        boolean matches = encoder.matches(password, seedHash);
        String freshHash = encoder.encode(password);

        System.out.println("=== BCrypt Verification ===");
        System.out.println("Password      : " + password);
        System.out.println("Seed hash     : " + seedHash);
        System.out.println("Hash matches  : " + matches);
        System.out.println("Fresh hash    : " + freshHash);
        System.out.println("===========================");

        assertTrue(matches, "BCrypt hash in mock-data.sql must match password 'defaultPassword123'");
    }
}
