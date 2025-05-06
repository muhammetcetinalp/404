// RestaurantOwnerService.java

package com.backend.delivery_backend.service;

import com.backend.delivery_backend.DTO.MenuItemDTO;
import com.backend.delivery_backend.ENUM.OrderStatus; // OrderStatus'u import et
import com.backend.delivery_backend.model.Cart;
import com.backend.delivery_backend.model.MenuItem;
import com.backend.delivery_backend.model.Order; // Order modelini import et
import com.backend.delivery_backend.model.RestaurantOwner;
import com.backend.delivery_backend.repository.CartRepository;
import com.backend.delivery_backend.repository.MenuItemRepository;
import com.backend.delivery_backend.repository.OrderRepository; // OrderRepository'yi import et
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import org.slf4j.Logger; // Logger ekle
import org.slf4j.LoggerFactory; // Logger ekle
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays; // Arrays.asList için
import java.util.List;

@Service
public class RestaurantOwnerService {

    private static final Logger logger = LoggerFactory.getLogger(RestaurantOwnerService.class); // Logger tanımla

    private final RestaurantOwnerRepository restaurantOwnerRepository;
    private final MenuItemRepository menuItemRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository; // OrderRepository'yi ekle

    public RestaurantOwnerService(MenuItemRepository menuItemRepository,
                                  RestaurantOwnerRepository restaurantOwnerRepository,
                                  CartRepository cartRepository,
                                  OrderRepository orderRepository) { // Constructor'a ekle
        this.restaurantOwnerRepository = restaurantOwnerRepository;
        this.menuItemRepository = menuItemRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository; // Atama yap
    }

    // Kendi özel exception sınıfımız
    public static class OperationBlockedException extends RuntimeException {
        public OperationBlockedException(String message) {
            super(message);
        }
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

    @Transactional
    public MenuItem updateMenuItem(String restaurantId, Long itemId, MenuItemDTO dto) {
        MenuItem itemToUpdate = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + itemId));

        if (!itemToUpdate.getRestaurant().getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("You do not have permission to update this menu item.");
        }

        // 1. Sepet Kontrolü
        List<Cart> cartsContainingItem = cartRepository.findAll(); // Optimize edilebilir
        for (Cart cart : cartsContainingItem) {
            if (cart.getItems().containsKey(itemToUpdate)) {
                logger.warn("Update blocked for MenuItem ID {}: Found in cart ID {}", itemId, cart.getId());
                throw new OperationBlockedException("Cannot update '" + itemToUpdate.getName() + "'. It is currently in one or more customer carts. Please ask customers to finalize their orders or remove it from their cart.");
            }
        }

        // 2. Aktif Sipariş Kontrolü (Sadece temel bilgiler değişiyorsa)
        boolean coreInfoChanged = !itemToUpdate.getName().equals(dto.getName()) ||
                itemToUpdate.getPrice() != dto.getPrice() ||
                !itemToUpdate.getDescription().equals(dto.getDescription());

        if (coreInfoChanged) {
            List<String> activeOrderStatuses = Arrays.asList(
                    OrderStatus.PENDING.name(),
                    OrderStatus.IN_PROGRESS.name(),
                    OrderStatus.PREPARING.name(),
                    OrderStatus.READY.name(),
                    OrderStatus.PICKED_UP.name()
            );
            List<Order> allOrders = orderRepository.findAll(); // Optimize edilebilir
            for (Order order : allOrders) {
                if (order.getItems().containsKey(itemToUpdate) && activeOrderStatuses.contains(order.getOrderStatus().toUpperCase())) {
                    logger.warn("Update blocked for MenuItem ID {}: Found in active order ID {} with status {}", itemId, order.getOrderId(), order.getOrderStatus());
                    throw new OperationBlockedException("Cannot update '" + itemToUpdate.getName() + "'. It is part of an active order (ID: " + order.getOrderId() + ", Status: " + order.getOrderStatus() + "). Please wait for the order to be completed or canceled.");
                }
            }
        }

        itemToUpdate.setName(dto.getName());
        itemToUpdate.setDescription(dto.getDescription());
        itemToUpdate.setPrice(dto.getPrice());
        itemToUpdate.setAvailable(dto.isAvailable());

        return menuItemRepository.save(itemToUpdate);
    }

    @Transactional
    public void deleteMenuItem(String restaurantId, Long itemId) {
        MenuItem itemToDelete = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found with ID: " + itemId));

        if (!itemToDelete.getRestaurant().getRestaurantId().equals(restaurantId)) {
            throw new RuntimeException("You do not have permission to delete this menu item.");
        }

        // 1. Sepet Kontrolü
        List<Cart> cartsContainingItem = cartRepository.findAll(); // Optimize edilebilir
        for (Cart cart : cartsContainingItem) {
            if (cart.getItems().containsKey(itemToDelete)) {
                logger.warn("Delete blocked for MenuItem ID {}: Found in cart ID {}", itemId, cart.getId());
                throw new OperationBlockedException("Cannot delete '" + itemToDelete.getName() + "'. It is currently in one or more customer carts.");
            }
        }

        // --- GÜNCELLENMİŞ SİPARİŞ KONTROLÜ (SİLME İÇİN) ---
        // 2. Sadece AKTİF Sipariş Kontrolü
        // Bir menü öğesi, durumu CANCELLED veya DELIVERED OLMAYAN bir siparişin parçasıysa silinemez.
        List<String> nonFinalOrderStatuses = Arrays.asList(
                OrderStatus.PENDING.name(),
                OrderStatus.IN_PROGRESS.name(),
                OrderStatus.PREPARING.name(),
                OrderStatus.READY.name(),
                OrderStatus.PICKED_UP.name()
                // CANCELLED ve DELIVERED bu listede yok
        );

        // Bu menü öğesini içeren tüm siparişleri bul
        List<Order> allOrdersWithItem = orderRepository.findAll(); // Optimize edilebilir: Sadece bu item'ı içerenleri bul
        for (Order order : allOrdersWithItem) {
            if (order.getItems().containsKey(itemToDelete)) {
                // Eğer siparişin durumu aktif (non-final) ise, silmeyi engelle
                if (nonFinalOrderStatuses.contains(order.getOrderStatus().toUpperCase())) {
                    logger.warn("Delete blocked for MenuItem ID {}: Found in ACTIVE order ID {} with status {}", itemId, order.getOrderId(), order.getOrderStatus());
                    throw new OperationBlockedException("Cannot delete '" + itemToDelete.getName() + "'. It is part of an active order (ID: " + order.getOrderId() + ", Status: " + order.getOrderStatus() + "). Please wait for the order to be completed or canceled.");
                }
            }
        }
        // --- SİPARİŞ KONTROLÜ SONU ---

        // Eğer buraya kadar geldiyse, menü öğesi aktif siparişlerde veya sepetlerde değil demektir.
        // Ancak, eğer geçmiş (DELIVERED, CANCELLED) siparişlerdeki order_items kayıtlarını
        // korumak istiyorsanız ve foreign key constraint'iniz ON DELETE CASCADE değilse,
        // bu menü öğesini içeren Order'ların items map'inden bu öğeyi çıkarmanız gerekir.
        // Bu, order_items join tablosundaki referansı kaldırır.
        // Bu adım, sadece foreign key hatası alıyorsanız ve silmekte ısrarcıysanız gereklidir.
        // Daha iyi bir yaklaşım, tamamlanmış siparişlerdeki veriyi olduğu gibi bırakmak
        // ve menü öğesini sadece "available = false" yapmaktır.
        // Şimdiki kurala göre (aktif siparişte yoksa silinebilir), bu temizlik adımına ihtiyaç olabilir.

        List<Order> allOrdersReferencingItem = orderRepository.findAll(); // Tekrar optimize edilebilir
        for (Order order : allOrdersReferencingItem) {
            if (order.getItems() != null && order.getItems().containsKey(itemToDelete)) {
                logger.info("Removing MenuItem ID {} (to be deleted) from past Order ID {} items map to allow deletion.", itemToDelete.getId(), order.getOrderId());
                order.getItems().remove(itemToDelete);
                orderRepository.save(order); // Bu, order_items tablosundan ilgili kaydı siler
            }
        }

        menuItemRepository.delete(itemToDelete);
        logger.info("MenuItem ID {} successfully deleted.", itemId);
    }


    public boolean toggleRestaurantStatus(String restaurantId) {
        RestaurantOwner restaurantOwner = restaurantOwnerRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        boolean newStatus = !restaurantOwner.isOpen();
        restaurantOwner.setOpen(newStatus);
        restaurantOwnerRepository.save(restaurantOwner);
        logger.info("Restaurant {} is now {}", restaurantId, (newStatus ? "OPEN" : "CLOSED"));
        return newStatus;
    }
}