package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.ENUM.DeliveryType;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/public")
public class PublicSearchController {

    @Autowired
    private RestaurantOwnerRepository restaurantOwnerRepository;

    @GetMapping("/search-restaurants")
    public ResponseEntity<?> searchRestaurants(@RequestParam(required = false) String keyword,
                                               @RequestParam(required = false) Float minRating,
                                               @RequestParam(required = false) Boolean openNow,
                                               @RequestParam(required = false) String sortBy,
                                               @RequestParam(required = false) String cuisineType,
                                               @RequestParam(required = false) String deliveryType,
                                               @RequestParam(required = false) Float topRated) {

        Stream<RestaurantOwner> stream = restaurantOwnerRepository.findAll().stream()
                // Only show approved restaurants
                .filter(RestaurantOwner::isApproved)
                .filter(r -> {
                    if (keyword != null &&
                            !(r.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                                    r.getAddress().toLowerCase().contains(keyword.toLowerCase()))) {
                        return false;
                    }

                    if (minRating != null && r.getRating() < minRating) {
                        return false;
                    }

                    if (Boolean.TRUE.equals(openNow) &&
                            !isOpenNow(r.getBusinessHoursStart(), r.getBusinessHoursEnd())) {
                        return false;
                    }

                    if (cuisineType != null &&
                            (r.getCuisineType() == null ||
                                    !r.getCuisineType().equalsIgnoreCase(cuisineType))) {
                        return false;
                    }

                    if (deliveryType != null &&
                            (r.getDeliveryType() == null ||
                                    !(r.getDeliveryType().name().equalsIgnoreCase(deliveryType) ||
                                            r.getDeliveryType() == DeliveryType.BOTH))) {
                        return false;
                    }

                    if (topRated != null && r.getRating() < topRated) {
                        return false;
                    }

                    return true;
                });

        // Sıralama
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "rating" -> stream = stream.sorted(Comparator.comparing(RestaurantOwner::getRating).reversed());
                case "name" -> stream = stream.sorted(Comparator.comparing(RestaurantOwner::getName));
                default -> {}
            }
        }

        List<RestaurantOwner> results = stream.toList();
        return ResponseEntity.ok(results);
    }

    private boolean isOpenNow(String start, String end) {
        try {
            LocalTime now = LocalTime.now();
            LocalTime startTime = LocalTime.parse(start);
            LocalTime endTime = LocalTime.parse(end);
            return !now.isBefore(startTime) && !now.isAfter(endTime);
        } catch (Exception e) {
            return false;
        }
    }
}