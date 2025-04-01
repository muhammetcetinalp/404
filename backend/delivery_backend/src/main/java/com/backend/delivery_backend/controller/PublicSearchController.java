package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import com.backend.delivery_backend.model.DeliveryType;

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

        Stream<RestaurantOwner> stream = restaurantOwnerRepository.findAll()
                .stream()
                .filter(r -> {
                    boolean match = true;

                    if (keyword != null) {
                        match = r.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                                r.getAddress().toLowerCase().contains(keyword.toLowerCase());
                    }

                    if (match && minRating != null) {
                        match = r.getRating() >= minRating;
                    }

                    if (match && Boolean.TRUE.equals(openNow)) {
                        match = isOpenNow(r.getBusinessHoursStart(), r.getBusinessHoursEnd());
                    }

                    if (match && cuisineType != null) {
                        match = r.getCuisineType() != null &&
                                r.getCuisineType().equalsIgnoreCase(cuisineType);
                    }

                    if (match && deliveryType != null) {
                        match = r.getDeliveryType() != null &&
                                (r.getDeliveryType().name().equalsIgnoreCase(deliveryType) ||
                                        r.getDeliveryType() == DeliveryType.BOTH);
                    }
                    if (match && topRated != null) {
                        match = r.getRating() >= topRated;
                    }

                    return match;
                });

        // Sıralama uygulanacaksa
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "rating" -> stream = stream.sorted(Comparator.comparing(RestaurantOwner::getRating).reversed());
                case "name" -> stream = stream.sorted(Comparator.comparing(RestaurantOwner::getName));
                default -> {} // desteklenmeyen sortBy için sıralama yapma
            }
        }

        List<RestaurantOwner> results = stream.toList();

        if (results.isEmpty()) {
            return ResponseEntity.ok("No matching restaurants found");
        }

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