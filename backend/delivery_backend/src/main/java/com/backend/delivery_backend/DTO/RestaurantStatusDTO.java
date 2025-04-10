package com.backend.delivery_backend.DTO;

public class RestaurantStatusDTO {
    private boolean isOpen;

    public RestaurantStatusDTO() {
    }

    public RestaurantStatusDTO(boolean isOpen) {
        this.isOpen = isOpen;
    }

    public boolean isOpen() {
        return isOpen;
    }

    public void setOpen(boolean open) {
        isOpen = open;
    }
}