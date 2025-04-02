package com.backend.delivery_backend.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackDTO {

    private String orderId;

    private String targetId; // restaurantId or courierId
    private String targetType; // "RESTAURANT" or "COURIER"

    private int rating; // 1-5
    private String comment; // optionel

}