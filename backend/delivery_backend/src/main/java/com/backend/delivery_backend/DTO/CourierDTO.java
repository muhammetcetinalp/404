package com.backend.delivery_backend.DTO;

import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.ENUM.CourierStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourierDTO {
    private String courierId;
    private String name;
    private String email;
    private String phone;
    private CourierStatus status;

    public CourierDTO(Courier courier) {
        this.courierId = courier.getCourierId();
        this.name = courier.getName();
        this.email = courier.getEmail();
        this.phone = courier.getPhone();
        this.status = courier.getStatus();
    }
}
