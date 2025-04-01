package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.Cart;
import com.backend.delivery_backend.model.Customer;
import com.backend.delivery_backend.model.MenuItem;
import com.backend.delivery_backend.repository.CartRepository;
import com.backend.delivery_backend.repository.CustomerRepository;
import com.backend.delivery_backend.repository.MenuItemRepository;
import com.backend.delivery_backend.DTO.BasketItemDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private MenuItemRepository menuItemRepository;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/add")
    @Transactional
    public ResponseEntity<?> addToCart(Authentication auth,
                                       @RequestParam Long menuItemId,
                                       @RequestParam int quantity) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }

        Cart cart = cartRepository.findByCustomerId(customer.getCustomerId());
        if (cart == null) {
            cart = new Cart();
            cart.setId("cart-" + customer.getCustomerId());
            cart.setCustomer(customer);
        }

        Optional<MenuItem> menuItemOptional = menuItemRepository.findById(menuItemId);
        if (menuItemOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Menu item not found");
        }

        cart.addItem(menuItemOptional.get(), quantity);
        cartRepository.save(cart);

        return ResponseEntity.ok("Item added to cart");
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/showcart")
    public ResponseEntity<?> showBasket(Authentication auth) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);

        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }

        Cart cart = cartRepository.findByCustomerId(customer.getCustomerId());
        if (cart == null || cart.getItems() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<BasketItemDTO> dtoList = cart.getItems().entrySet().stream()
                .filter(entry -> entry.getKey() != null)
                .map(entry -> {
                    MenuItem item = entry.getKey();
                    int quantity = entry.getValue();
                    return new BasketItemDTO(
                            item.getId(),
                            item.getName(),
                            item.getPrice(),
                            item.getDescription(),
                            quantity
                    );
                })
                .toList();

        return ResponseEntity.ok(dtoList);
    }
}
