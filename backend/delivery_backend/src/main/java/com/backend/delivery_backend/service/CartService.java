package com.backend.delivery_backend.service;

import com.backend.delivery_backend.model.Cart;
import com.backend.delivery_backend.model.Customer;
import com.backend.delivery_backend.model.MenuItem;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.CartRepository;
import com.backend.delivery_backend.repository.CustomerRepository;
import com.backend.delivery_backend.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public Cart addToCart(String customerId, Long menuItemId, int quantity) {
        // Check if the cart exists for the customer, else create one
        Cart cart = cartRepository.findByCustomerId(customerId);

        if (cart == null) {
            cart = new Cart();
            Customer customer = customerRepository.findByCustomerId(customerId);
            cart.setCustomer(customer);
            cart.setId("cart-" + UUID.randomUUID());
            cartRepository.save(cart);
        }

        // Get new menu item
        MenuItem newItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // Check if the restaurant is approved
        RestaurantOwner restaurant = newItem.getRestaurant();
        if (restaurant == null || !restaurant.isApproved()) {
            throw new RuntimeException("Cannot add items from unapproved restaurants");
        }

        // Check if restaurant is banned or suspended
        if ("BANNED".equals(restaurant.getAccountStatus()) || "SUSPENDED".equals(restaurant.getAccountStatus())) {
            throw new RuntimeException("This restaurant is currently unavailable");
        }

        // ✅ Mevcut sepetteki restoran ile karşılaştır
        if (!cart.getItems().isEmpty()) {
            MenuItem existingItem = cart.getItems().keySet().iterator().next();
            String existingRestaurantId = existingItem.getRestaurant().getRestaurantId();
            String newItemRestaurantId = newItem.getRestaurant().getRestaurantId();

            if (!existingRestaurantId.equals(newItemRestaurantId)) {
                throw new RuntimeException("Cannot add items from different restaurants to the same cart. Please empty your cart first.");
            }
        }

        // Eğer aynı restorandansa ekle
        cart.addItem(newItem, quantity);

        return cartRepository.save(cart);
    }
}