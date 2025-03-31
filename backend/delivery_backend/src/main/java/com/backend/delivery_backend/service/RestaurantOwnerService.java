package com.backend.delivery_backend.service;

import com.backend.delivery_backend.DTO.MenuItemDTO;
import com.backend.delivery_backend.model.MenuItem;
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.MenuItemRepository;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantOwnerService {

    private final RestaurantOwnerRepository restaurantOwnerRepository;
    private final MenuItemRepository menuItemRepository;


    public RestaurantOwnerService(MenuItemRepository menuItemRepository,
                                  RestaurantOwnerRepository restaurantOwnerRepository) {
        this.restaurantOwnerRepository = restaurantOwnerRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public List<MenuItem> getMenuItemsByRestaurant(String restaurantId) {
        return menuItemRepository.findByRestaurantRestaurantId(restaurantId);
    }


    public MenuItem addMenuItem(String restaurantId, MenuItemDTO dto) {
        RestaurantOwner restaurant = restaurantOwnerRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        MenuItem item = new MenuItem();
        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setAvailable(dto.isAvailable());
        item.setRestaurant(restaurant);

        return menuItemRepository.save(item);
    }

    public MenuItem updateMenuItem(String restaurantId, Long itemId, MenuItemDTO dto) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        // Güvenlik: Sadece kendi restoranındaki ürünü güncelleyebilir
        if (!item.getRestaurant().getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("You do not have permission to update this menu item.");
        }

        item.setName(dto.getName());
        item.setDescription(dto.getDescription());
        item.setPrice(dto.getPrice());
        item.setAvailable(dto.isAvailable());

        return menuItemRepository.save(item);
    }

    public void deleteMenuItem(String restaurantId, Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (!item.getRestaurant().getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("You do not have permission to delete this menu item.");
        }

        menuItemRepository.delete(item);
    }

    public boolean toggleRestaurantStatus(String restaurantId) {
        RestaurantOwner restaurantOwner = restaurantOwnerRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        boolean newStatus = !restaurantOwner.isOpen(); // toggle işlemi
        restaurantOwner.setOpen(newStatus);
        restaurantOwnerRepository.save(restaurantOwner);

        System.out.println("[INFO] Restaurant " + restaurantId + " is now " + (newStatus ? "OPEN" : "CLOSED"));

        return newStatus;
    }
}

