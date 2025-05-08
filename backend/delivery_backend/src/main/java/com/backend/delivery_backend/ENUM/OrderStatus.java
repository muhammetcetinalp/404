package com.backend.delivery_backend.ENUM;

public enum OrderStatus {
    PENDING,
    IN_PROGRESS,
    PREPARING,
    READY, // Or READY_FOR_PICKUP
    PICKED_UP,
    DELIVERED,
    CANCELLED, // A general cancelled status if you prefer
    // Add any other statuses your system uses
    CANCELLED_BY_CUSTOMER
}