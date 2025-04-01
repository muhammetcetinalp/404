package com.backend.delivery_backend.repository;

import com.backend.delivery_backend.model.DeliveryRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRequestRepository extends JpaRepository<DeliveryRequest, Long> {
//    List<DeliveryRequest> findByCourierIdAndStatus(Long courierId, RequestStatus status);
}

