package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, String> {
    Cart findByCustomerId(String customerId);
}