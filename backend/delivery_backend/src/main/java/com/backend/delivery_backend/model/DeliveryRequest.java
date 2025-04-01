package com.backend.delivery_backend.model;

import com.backend.delivery_backend.ENUM.RequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class DeliveryRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private RequestStatus status; // PENDING, ACCEPTED, REJECTED

    @ManyToOne
    private Courier courier;

    private Long orderId;
//    @OneToOne
//    private Order order;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

}

