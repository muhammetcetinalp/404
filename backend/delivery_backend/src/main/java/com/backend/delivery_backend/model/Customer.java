package com.backend.delivery_backend.model;
import jakarta.persistence.*;

@Entity
@Table(name = "customers")
public class Customer extends User {

    @Id
    private String customerId;
    @Column(nullable = false)
    private String address;
    @Column(name = "city")
    private String city;

    @Column(name = "district")
    private String district;

    // Getter - Setter
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    @Override
    public String getId() {
        return this.customerId;
    }


    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
}
