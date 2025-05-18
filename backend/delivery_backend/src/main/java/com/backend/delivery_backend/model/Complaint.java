package com.backend.delivery_backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Customer customer;

    @Column(length = 1000)
    private String message;

    private String status;

    private LocalDateTime createdAt = LocalDateTime.now();
}