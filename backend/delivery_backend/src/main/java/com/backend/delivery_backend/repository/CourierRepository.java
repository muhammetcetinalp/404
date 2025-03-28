package com.backend.delivery_backend.repository;
import com.backend.delivery_backend.model.Courier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourierRepository extends JpaRepository<Courier, String> {
    Courier findByEmail(String email);
    Courier findByCourierId(String courierId);

}
