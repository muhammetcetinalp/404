package com.backend.delivery_backend.service;

import com.backend.delivery_backend.DTO.CourierRestaurantRequestDTO;
import com.backend.delivery_backend.ENUM.RequestStatus;
import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.model.CourierRestaurantRequest;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.repository.CourierRestaurantRequestRepository;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourierRestaurantRequestService {

    @Autowired
    private CourierRestaurantRequestRepository requestRepository;

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private RestaurantOwnerRepository restaurantRepository;

    public void sendRequest(String courierId, String restaurantId) {
        Courier courier = courierRepository.findByCourierId(courierId);
        RestaurantOwner restaurant = restaurantRepository.findByRestaurantId(restaurantId);

        if (courier == null || restaurant == null) {
            throw new RuntimeException("Courier or restaurant not found");
        }

        CourierRestaurantRequest request = new CourierRestaurantRequest();
        request.setCourier(courier);
        request.setRestaurant(restaurant);
        request.setStatus(RequestStatus.PENDING);

        requestRepository.save(request);
    }

    public List<CourierRestaurantRequestDTO> getRequestsForRestaurant(String restaurantId) {
        List<CourierRestaurantRequest> requests = requestRepository.findByRestaurantRestaurantId(restaurantId);

        return requests.stream()
                .map(r -> new CourierRestaurantRequestDTO(
                        r.getId(),
                        r.getCourier().getName(),
                        r.getCourier().getCourierId(),
                        r.getRestaurant().getName(),
                        r.getRestaurant().getRestaurantId(),
                        r.getStatus(),
                        r.getCreatedAt(),
                        r.getCourier().getEmail(),
                        r.getCourier().getPhone()
                ))
                .collect(Collectors.toList());
    }

    public void respondRequest(Long requestId, String action) {
        CourierRestaurantRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if ("ACCEPT".equalsIgnoreCase(action)) {
            request.setStatus(RequestStatus.ACCEPTED);
            Courier courier = request.getCourier();
            courier.setRestaurantOwner(request.getRestaurant());
            courierRepository.save(courier);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            request.setStatus(RequestStatus.REJECTED);
        } else {
            throw new RuntimeException("Invalid action. Use ACCEPT or REJECT.");
        }

        requestRepository.save(request);
    }
}