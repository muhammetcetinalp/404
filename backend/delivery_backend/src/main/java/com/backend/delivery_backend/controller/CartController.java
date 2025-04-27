package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.model.Cart;
import com.backend.delivery_backend.model.Customer;
import com.backend.delivery_backend.model.MenuItem;
import com.backend.delivery_backend.model.RestaurantOwner;
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
import java.util.List;
import java.util.Optional;

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
        // 1. Müşteriyi al
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Customer not found");
        }

        // 2. Menü öğesini al
        Optional<MenuItem> menuItemOpt = menuItemRepository.findById(menuItemId);
        if (menuItemOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Menu item not found");
        }
        MenuItem item = menuItemOpt.get();

        // 3. Ürün mevcut mu?
        if (!item.isAvailable()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("This item is currently unavailable");
        }

        // 4. Restoran onaylı mı?
        RestaurantOwner restaurant = item.getRestaurant();
        if (restaurant == null || !restaurant.isApproved()) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Cannot add items from unapproved restaurants");
        }

        // 5. Restoran ban veya suspend edilmiş mi?
        if ("BANNED".equals(restaurant.getAccountStatus()) || "SUSPENDED".equals(restaurant.getAccountStatus())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("This restaurant is currently unavailable");
        }

        // 6. Restoran açık mı?
        if (!restaurant.isOpen()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("This restaurant is currently closed");
        }

        // 7. Sepeti al veya oluştur
        Cart cart = cartRepository.findByCustomerId(customer.getCustomerId());
        if (cart == null) {
            cart = new Cart();
            cart.setId("cart-" + customer.getCustomerId());
            cart.setCustomer(customer);
        }

        // 8. Aynı restorandan mı?
        if (!cart.getItems().isEmpty()) {
            MenuItem existing = cart.getItems().keySet().iterator().next();
            String existingRestId = existing.getRestaurant().getRestaurantId();
            String newRestId      = restaurant.getRestaurantId();
            if (!existingRestId.equals(newRestId)) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("You can only add items from the same restaurant");
            }
        }

        // 9. Sepete ekle ve kaydet
        cart.addItem(item, quantity);
        cartRepository.save(cart);

        return ResponseEntity.ok("Item added to cart");
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/showcart")
    public ResponseEntity<?> showBasket(Authentication auth) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Customer not found");
        }

        Cart cart = cartRepository.findByCustomerId(customer.getCustomerId());
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Sepetteki restoranın durumunu kontrol et
        MenuItem firstItem = cart.getItems().keySet().iterator().next();
        RestaurantOwner restaurant = firstItem.getRestaurant();

        // Restoran ban veya suspend edilmişse sepeti temizle
        if ("BANNED".equals(restaurant.getAccountStatus()) || "SUSPENDED".equals(restaurant.getAccountStatus())) {
            cart.getItems().clear();
            cartRepository.save(cart);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("The restaurant in your cart is currently unavailable. Your cart has been cleared.");
        }

        List<BasketItemDTO> dtoList = cart.getItems().entrySet().stream()
                .filter(entry -> entry.getKey() != null)
                .map(entry -> {
                    MenuItem menuItem = entry.getKey();
                    int qty = entry.getValue();
                    return new BasketItemDTO(
                            menuItem.getId(),
                            menuItem.getName(),
                            menuItem.getPrice(),
                            menuItem.getDescription(),
                            qty
                    );
                })
                .toList();

        return ResponseEntity.ok(dtoList);
    }
}