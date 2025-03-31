package com.backend.delivery_backend.service;

import com.backend.delivery_backend.ENUM.CourierStatus;
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.ENUM.RequestStatus;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.model.DeliveryRequest;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.repository.DeliveryRequestRepository;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import org.springframework.stereotype.Service;

@Service
public class CourierService {

    private final CourierRepository courierRepository;
    private final RestaurantOwnerRepository restaurantOwnerRepository;
    private final DeliveryRequestRepository deliveryRequestRepository;

    public CourierService(CourierRepository courierRepository,
                          RestaurantOwnerRepository restaurantOwnerRepository,
                          DeliveryRequestRepository deliveryRequestRepository) {
        this.courierRepository = courierRepository;
        this.restaurantOwnerRepository = restaurantOwnerRepository;
        this.deliveryRequestRepository = deliveryRequestRepository;
    }

    public void assignRestaurantToCourier(String courierId, Long restaurantId) {

        Courier courier = courierRepository.findById(courierId)
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        RestaurantOwner restaurant = restaurantOwnerRepository.findById(String.valueOf(restaurantId))
                .orElseThrow(() -> new RuntimeException("Restaurant owner not found"));

        courier.setRestaurantOwner(restaurant);
        courierRepository.save(courier);
    }

    public void assignRestaurantToCourierByName(String courierId, String restaurantName) {
        RestaurantOwner restaurant = restaurantOwnerRepository.findByName(restaurantName);
        if (restaurant == null) {
            throw new RuntimeException("Restaurant not found with name: " + restaurantName);
        }
        Long restaurantID = Long.valueOf(restaurant.getRestaurantId());
        assignRestaurantToCourier(courierId, restaurantID); // mevcut method
    }

    public void updateCourierStatus(String courierId, String statusString) {
        if (statusString == null) {
            throw new RuntimeException("Status value is missing in request.");
        }

        Courier courier = courierRepository.findById(courierId)
                .orElseThrow(() -> new RuntimeException("Courier not found"));

        CourierStatus status;
        try {
            status = CourierStatus.valueOf(statusString.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value. Use AVAILABLE or UNAVAILABLE.");
        }

        courier.setStatus(status);
        courierRepository.save(courier);

        System.out.println("[INFO] Courier " + courierId + " status set to " + status);
    }


    public void respondToDeliveryRequest(Long courierId, Long requestId, String statusString) {
        DeliveryRequest request = deliveryRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getCourier().getId().equals(courierId)) {
            throw new RuntimeException("Courier does not have access to this request");
        }

        RequestStatus status = RequestStatus.valueOf(statusString.toUpperCase());
        request.setStatus(status);

        if (status == RequestStatus.ACCEPTED) {
            // TODO: Order'a kurye ata (orderService.assignCourier(...) gibi bir çağrı yapılabilir)
            // Courier id stringe çevrilmeli.
            System.out.println("[INFO] Order ID " + request.getOrderId() + " assigned to courier ID " + courierId);

            // TODO: Restoranı bilgilendir (örneğin WebSocket veya email servisi)
            System.out.println("[INFO] Restaurant notified: Courier assigned to order.");

            // TODO: Müşteriyi bilgilendir (örneğin sistem mesajı, push notification vs.)
            System.out.println("[INFO] Customer notified: Courier en route.");

        } else if (status == RequestStatus.REJECTED) {
            // TODO: Sisteme başka kurye önerisi sunulabilir (örneğin uygun kurye listesi alınır)
            System.out.println("[WARN] Courier rejected the delivery. Reassigning the order...");

            // Bu noktada sistem başka bir uygun kurye aramalı
            // ileride: deliveryAssignmentService.reassignOrder(orderId);
        }

        deliveryRequestRepository.save(request);
    }

}

