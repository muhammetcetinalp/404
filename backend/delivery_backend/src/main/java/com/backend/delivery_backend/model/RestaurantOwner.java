package com.backend.delivery_backend.model;
import com.backend.delivery_backend.ENUM.DeliveryType;
import jakarta.persistence.*;

@Entity
@Table(name = "restaurant_owners")
public class RestaurantOwner extends User {

    @Column(nullable = false)
    private String address;

    @Column(name = "business_hours_start", nullable = false)
    private String businessHoursStart;

    @Column(name = "business_hours_end", nullable = false)
    private String businessHoursEnd;

    private float rating;

    @Column(name = "city")
    private String city;

    @Column(name = "district")
    private String district;

    @Id
    private String restaurantId;

    @Column(name = "is_open")
    private boolean isOpen = false;

    public String getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(String restaurantId) {
        this.restaurantId = restaurantId;
    }
    @Override
    public String getId() {
        return this.restaurantId;
    }


    // Getter - Setter
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }


    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBusinessHoursStart() { return businessHoursStart; }
    public void setBusinessHoursStart(String businessHoursStart) { this.businessHoursStart = businessHoursStart; }

    public String getBusinessHoursEnd() { return businessHoursEnd; }
    public void setBusinessHoursEnd(String businessHoursEnd) { this.businessHoursEnd = businessHoursEnd; }

    public float getRating() { return rating; }
    public void setRating(float rating) { this.rating = rating; }

    public boolean isOpen() {
        return isOpen;
    }

    public void setOpen(boolean open) {
        isOpen = open;
    }
}
