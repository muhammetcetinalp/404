package com.backend.delivery_backend.service;

import com.backend.delivery_backend.model.Cart;
import com.backend.delivery_backend.model.Customer;
import com.backend.delivery_backend.model.MenuItem;
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

            // Retrieve Customer by customerId
            Customer customer = customerRepository.findByCustomerId(customerId);
            cart.setCustomer(customer);
            cart.setId("cart-" + UUID.randomUUID());

            cartRepository.save(cart);
        }

        // Add the item to the cart
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        cart.addItem(menuItem, quantity);

        return cartRepository.save(cart);
    }
}
