package com.backend.delivery_backend.DTO;

import com.backend.delivery_backend.model.Customer;
import com.backend.delivery_backend.model.RestaurantOwner;

import java.util.List;

public class CustomerDTO {
    private String name;
    private String email;
    private String phone;
    private String customerId;
    private String address;
    private String city;
    private String district;
    private String role;
   // private List<String> favoriteRestaurantIds;
   // private List<OrderDTO> pastOrders;

    public CustomerDTO(Customer customer) {
        this.name = customer.getName();
        this.email = customer.getEmail();
        this.phone = customer.getPhone();
        this.role = customer.getRole();
        this.customerId = customer.getCustomerId();
        this.address = customer.getAddress();
        this.city = customer.getCity();
        this.district = customer.getDistrict();
        /*this.favoriteRestaurantIds = customer.getFavoriteRestaurants()
                .stream()
                .map(RestaurantOwner::getRestaurantId)
                .toList();

         */

    }

    // Getters and setters
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getCustomerId() { return customerId; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public String getDistrict() { return district; }
    //public List<String> getFavoriteRestaurantIds() { return favoriteRestaurantIds; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public void setAddress(String address) { this.address = address; }
    public void setCity(String city) { this.city = city; }
    public void setDistrict(String district) { this.district = district; }
   /* public void setFavoriteRestaurantIds(List<String> favoriteRestaurantIds) {
        this.favoriteRestaurantIds = favoriteRestaurantIds;
    }

    */
}
