package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}