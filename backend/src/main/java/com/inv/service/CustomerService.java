package com.inv.service;

import com.inv.dto.request.CreateCustomerRequest;
import com.inv.dto.request.UpdateCustomerRequest;
import com.inv.model.Customer;
import com.inv.repo.CustomerRepository;
import com.inv.util.IdGenerator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer getCustomerById(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Customer not found: " + id));
    }

    public Customer createCustomer(CreateCustomerRequest req) {
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            customerRepository.findByPhone(req.getPhone()).ifPresent(c -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Phone already in use: " + req.getPhone());
            });
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            customerRepository.findByEmail(req.getEmail()).ifPresent(c -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Email already in use: " + req.getEmail());
            });
        }

        Customer customer = new Customer();
        customer.setCustomerId(IdGenerator.generate("CUS-"));
        customer.setCustomerName(req.getCustomerName());
        customer.setAddress(req.getAddress());
        customer.setPhone(req.getPhone());
        customer.setEmail(req.getEmail());
        customer.setActive(true);

        customerRepository.save(customer);
        return customer;
    }

    public Customer updateCustomer(String id, UpdateCustomerRequest req) {
        Customer existing = getCustomerById(id);

        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            customerRepository.findByPhone(req.getPhone())
                    .filter(c -> !c.getCustomerId().equals(id))
                    .ifPresent(c -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                "Phone already in use: " + req.getPhone());
                    });
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            customerRepository.findByEmail(req.getEmail())
                    .filter(c -> !c.getCustomerId().equals(id))
                    .ifPresent(c -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                "Email already in use: " + req.getEmail());
                    });
        }

        customerRepository.update(id, req.getCustomerName(), req.getAddress(),
                req.getPhone(), req.getEmail());

        existing.setCustomerName(req.getCustomerName());
        existing.setAddress(req.getAddress());
        existing.setPhone(req.getPhone());
        existing.setEmail(req.getEmail());
        return existing;
    }

    public void deactivateCustomer(String id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Customer not found: " + id));
        if (!customer.isActive()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Customer not found or already inactive: " + id);
        }
        customerRepository.deactivate(id);
    }
}
