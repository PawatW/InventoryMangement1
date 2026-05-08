package com.inv.config;

import com.inv.security.JwtFilter;
import com.inv.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtUtil);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        cors.setAllowedMethods(List.of("*"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth

                // ── Public ────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/login").permitAll()
                .requestMatchers(HttpMethod.GET,  "/test").permitAll()

                // ── TECHNICIAN only ───────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/requests").hasRole("TECHNICIAN")

                // ── FOREMAN or ADMIN ──────────────────────────────────────
                .requestMatchers(HttpMethod.GET,  "/requests/pending").hasAnyRole("FOREMAN", "ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/requests/*/approve").hasAnyRole("FOREMAN", "ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/requests/*/reject").hasAnyRole("FOREMAN", "ADMIN")

                // ── TECHNICIAN or ADMIN ───────────────────────────────────
                .requestMatchers(HttpMethod.GET,  "/requests/ready-to-close").hasAnyRole("TECHNICIAN", "ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/requests/*/close").hasAnyRole("TECHNICIAN", "ADMIN")

                // ── SALES or ADMIN ────────────────────────────────────────
                .requestMatchers(HttpMethod.GET,  "/orders/confirmed").hasAnyRole("SALES", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/orders").hasAnyRole("SALES", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/customers").hasAnyRole("SALES", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/customers").hasAnyRole("SALES", "ADMIN")

                // ── SALES only ────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/orders/ready-to-close").hasRole("SALES")
                .requestMatchers(HttpMethod.PUT, "/orders/*/close").hasRole("SALES")

                // ── WAREHOUSE only ────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/stock/in").hasRole("WAREHOUSE")
                .requestMatchers(HttpMethod.POST, "/stock/fulfill").hasRole("WAREHOUSE")
                .requestMatchers(HttpMethod.POST, "/stock/fulfill-batch").hasRole("WAREHOUSE")

                // ── WAREHOUSE or ADMIN ────────────────────────────────────
                .requestMatchers(HttpMethod.GET,  "/stock/transactions").hasAnyRole("WAREHOUSE", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/stock/approved-requests").hasAnyRole("WAREHOUSE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/purchase-orders").hasAnyRole("WAREHOUSE", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/purchase-orders/*/receive").hasAnyRole("WAREHOUSE", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/purchase-orders").hasAnyRole("WAREHOUSE", "ADMIN")
                .requestMatchers(HttpMethod.GET,  "/purchase-orders/*").hasAnyRole("WAREHOUSE", "ADMIN")

                // ── PROCUREMENT or ADMIN ──────────────────────────────────
                .requestMatchers(HttpMethod.PUT,  "/purchase-orders/*/pricing").hasAnyRole("PROCUREMENT", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/purchase-orders/upload-slip").hasAnyRole("PROCUREMENT", "ADMIN")

                // ── ADMIN only ────────────────────────────────────────────
                .requestMatchers("/staff/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/admin/**").hasRole("ADMIN")

                // ── WAREHOUSE or PROCUREMENT or ADMIN ─────────────────────
                .requestMatchers(HttpMethod.POST, "/products").hasAnyRole("WAREHOUSE", "PROCUREMENT", "ADMIN")
                .requestMatchers(HttpMethod.PUT,  "/products/*").hasAnyRole("WAREHOUSE", "PROCUREMENT", "ADMIN", "SALES")

                // ── SALES or ADMIN ────────────────────────────────────────
                .requestMatchers(HttpMethod.PUT, "/products/*/sell-price").hasAnyRole("SALES", "ADMIN")

                // ── Any authenticated user ────────────────────────────────
                .requestMatchers(HttpMethod.GET,  "/products").authenticated()
                .requestMatchers(HttpMethod.GET,  "/suppliers").authenticated()
                .requestMatchers(HttpMethod.GET,  "/orders").authenticated()
                .requestMatchers(HttpMethod.GET,  "/orders/*/items").authenticated()
                .requestMatchers(HttpMethod.GET,  "/requests").authenticated()
                .requestMatchers(HttpMethod.GET,  "/requests/*/items").authenticated()
                .requestMatchers(HttpMethod.GET,  "/categories").authenticated()
                .requestMatchers(HttpMethod.GET,  "/products/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/products/upload-image").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
