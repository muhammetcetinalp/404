package com.backend.delivery_backend.DTO;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DeliveryRequestDTO {
    private Long courierId;
    private Long orderId;
    private String status; // ACCEPTED or REJECTED

    // Getters and Setters

}

