package com.backend.delivery_backend.DTO;

public class BasketItemDTO {
    private Long id;
    private String name;
    private double price;
    private String description;
    private int quantity;

    public BasketItemDTO(Long id, String name, double price, String description, int quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getDescription() { return description; }
    public int getQuantity() { return quantity; }
}