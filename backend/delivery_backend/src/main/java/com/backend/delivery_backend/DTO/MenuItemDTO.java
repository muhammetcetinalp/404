package com.backend.delivery_backend.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MenuItemDTO {

    private String name;
    private String description;
    private double price;
    private boolean available;
}

