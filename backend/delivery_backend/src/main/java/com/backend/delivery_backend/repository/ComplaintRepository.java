package com.backend.delivery_backend.repository;


import com.backend.delivery_backend.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findAllByOrderByCreatedAtDesc();
}