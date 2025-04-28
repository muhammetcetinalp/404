import com.backend.delivery_backend.model.Courier;
import com.backend.delivery_backend.model.Order;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courier/orders")
public class CourierOrderController {

    @Autowired
    private CourierRepository courierRepository;

    @Autowired
    private OrderRepository orderRepository;

    // ➔ Kuryeye atanmış siparişleri listele
    @GetMapping("/assigned")
    public ResponseEntity<?> getAssignedOrdersForCourier(Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null) {
            return ResponseEntity.badRequest().body("Courier not found.");
        }

        List<Order> assignedOrders = orderRepository.findByCourierId(courier.getCourierId());
        return ResponseEntity.ok(assignedOrders);
    }

    // ➔ Aktif siparişleri listele
    @GetMapping("/active")
    public ResponseEntity<?> getActiveOrdersForCourier(Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null || courier.getRestaurantOwner() == null) {
            return ResponseEntity.badRequest().body("Courier not assigned to any restaurant.");
        }

        String restaurantId = courier.getRestaurantOwner().getRestaurantId();

        List<Order> activeOrders = orderRepository.findByRestaurantId(restaurantId).stream()
                .filter(order -> "PENDING".equals(order.getOrderStatus()))
                .toList();

        return ResponseEntity.ok(activeOrders);
    }

    // ➔ Siparişi kabul et
    @PatchMapping("/accept/{orderId}")
    public ResponseEntity<?> acceptOrder(@PathVariable String orderId, Authentication auth) {
        String email = auth.getName();
        Courier courier = courierRepository.findByEmail(email);

        if (courier == null || courier.getRestaurantOwner() == null) {
            return ResponseEntity.badRequest().body("Courier not assigned to any restaurant.");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        // Sipariş kuryenin restoranına mı ait kontrolü
        if (!order.getRestaurant().getRestaurantId().equals(courier.getRestaurantOwner().getRestaurantId())) {
            return ResponseEntity.status(403).body("You can only accept orders from your own restaurant.");
        }

        // Sipariş başka bir kurye tarafından alınmış mı kontrolü
        if (order.getCourier() != null) {
            return ResponseEntity.badRequest().body("This order has already been accepted by another courier.");
        }

        // Siparişi kabul et
        order.setCourier(courier);
        order.setOrderStatus("IN_PROGRESS");
        orderRepository.save(order);

        return ResponseEntity.ok("Order accepted successfully.");
    }
}