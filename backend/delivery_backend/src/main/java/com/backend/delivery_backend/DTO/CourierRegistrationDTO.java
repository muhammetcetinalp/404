package com.backend.delivery_backend.DTO;

public class CourierRegistrationDTO {
    private String name;
    private String email;
    private String password;
    private String restaurantOwnerId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRestaurantOwnerId() {
        return restaurantOwnerId;
    }

    public void setRestaurantOwnerId(String restaurantOwnerId) {
        this.restaurantOwnerId = restaurantOwnerId;
    }
}
