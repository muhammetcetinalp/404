package com.backend.delivery_backend.DTO;

import com.backend.delivery_backend.ENUM.RequestStatus;

import java.time.LocalDateTime;

public class CourierRestaurantRequestDTO {

    private Long requestId;
    private String courierName;
    private String courierId;
    private String restaurantName;
    private String restaurantId;
    private RequestStatus status;
    private LocalDateTime createdAt;

    // Constructor
    public CourierRestaurantRequestDTO(Long requestId, String courierName, String courierId,
                                       String restaurantName, String restaurantId,
                                       RequestStatus status, LocalDateTime createdAt) {
        this.requestId = requestId;
        this.courierName = courierName;
        this.courierId = courierId;
        this.restaurantName = restaurantName;
        this.restaurantId = restaurantId;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getter - Setter
    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public String getCourierName() { return courierName; }
    public void setCourierName(String courierName) { this.courierName = courierName; }

    public String getCourierId() { return courierId; }
    public void setCourierId(String courierId) { this.courierId = courierId; }

    public String getRestaurantName() { return restaurantName; }
    public void setRestaurantName(String restaurantName) { this.restaurantName = restaurantName; }

    public String getRestaurantId() { return restaurantId; }
    public void setRestaurantId(String restaurantId) { this.restaurantId = restaurantId; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}