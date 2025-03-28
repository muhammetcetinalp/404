package com.backend.delivery_backend.repository;
import com.backend.delivery_backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, String> {
    Customer findByEmail(String email);
    Customer findByCustomerId(String customerId);

}
