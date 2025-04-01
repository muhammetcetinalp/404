package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.UserDTO;
import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.AdminRepository;
import com.backend.delivery_backend.repository.CustomerRepository;
import com.backend.delivery_backend.repository.CourierRepository;
import com.backend.delivery_backend.repository.RestaurantOwnerRepository;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired private CustomerRepository customerRepository;
    @Autowired private CourierRepository courierRepository;
    @Autowired private RestaurantOwnerRepository restaurantOwnerRepository;
    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/all-users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(Map.of(
                "customers", customerRepository.findAll(),
                "couriers", courierRepository.findAll(),
                "restaurantOwners", restaurantOwnerRepository.findAll(),
                "admins", adminRepository.findAll()
        ));
    }


    @DeleteMapping("/delete-user/{email}")
    public ResponseEntity<?> deleteUserByEmail(@PathVariable String email) {
        if (customerRepository.findByEmail(email) != null) {
            customerRepository.delete(customerRepository.findByEmail(email));
        } else if (courierRepository.findByEmail(email) != null) {
            courierRepository.delete(courierRepository.findByEmail(email));
        } else if (restaurantOwnerRepository.findByEmail(email) != null) {
            restaurantOwnerRepository.delete(restaurantOwnerRepository.findByEmail(email));
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
        return ResponseEntity.ok("User deleted");
    }
    @PostMapping("/add-admin")
    public ResponseEntity<?> createAdmin(@RequestBody UserDTO dto) {
        try {
            Admin admin = new Admin();
            admin.setAdminId(UUID.randomUUID().toString());
            admin.setName(dto.getName());
            admin.setEmail(dto.getEmail());
            admin.setPassword(passwordEncoder.encode(dto.getPassword()));
            admin.setPhone(dto.getPhone());
            admin.setRole("ADMIN");
            adminRepository.save(admin);
            return ResponseEntity.ok("New admin created.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Admin could not be created : " + e.getMessage());
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserDetails(@PathVariable String email) {
        Customer c = customerRepository.findByEmail(email);
        if (c != null) return ResponseEntity.ok(c);
        Courier cr = courierRepository.findByEmail(email);
        if (cr != null) return ResponseEntity.ok(cr);
        RestaurantOwner ro = restaurantOwnerRepository.findByEmail(email);
        if (ro != null) return ResponseEntity.ok(ro);

        return ResponseEntity.status(404).body("User not found");
    }

    @PutMapping("/update-user/{email}")
    public ResponseEntity<?> updateUser(@PathVariable String email, @RequestBody Map<String, Object> updates) {
        Customer c = customerRepository.findByEmail(email);
        if (c != null) {
            applyCommonUpdates(c, updates);
            customerRepository.save(c);
            return ResponseEntity.ok("Customer updated");
        }

        Courier cr = courierRepository.findByEmail(email);
        if (cr != null) {
            applyCommonUpdates(cr, updates);
            courierRepository.save(cr);
            return ResponseEntity.ok("Courier updated");
        }

        RestaurantOwner ro = restaurantOwnerRepository.findByEmail(email);
        if (ro != null) {
            applyCommonUpdates(ro, updates);
            if (updates.containsKey("businessHoursStart")) ro.setBusinessHoursStart((String) updates.get("businessHoursStart"));
            if (updates.containsKey("businessHoursEnd")) ro.setBusinessHoursEnd((String) updates.get("businessHoursEnd"));
            restaurantOwnerRepository.save(ro);
            return ResponseEntity.ok("Restaurant owner updated");
        }

        return ResponseEntity.status(404).body("User not found");
    }

    private void applyCommonUpdates(Object user, Map<String, Object> updates) {
        // Rol güncellemesi
        if (updates.containsKey("role")) {
            String newRole = (String) updates.get("role");
            if (newRole.equalsIgnoreCase("admin")) {
                ((User) user).setRole("ADMIN");
            } else {
                ((User) user).setRole(newRole.toLowerCase());
            }
        }

        if (user instanceof Customer customer) {
            if (updates.containsKey("name")) customer.setName((String) updates.get("name"));
            if (updates.containsKey("phone")) customer.setPhone((String) updates.get("phone"));
            if (updates.containsKey("city")) customer.setCity((String) updates.get("city"));
            if (updates.containsKey("district")) customer.setDistrict((String) updates.get("district"));
            if (updates.containsKey("address")) customer.setAddress((String) updates.get("address"));
        } else if (user instanceof Courier courier) {
            if (updates.containsKey("name")) courier.setName((String) updates.get("name"));
            if (updates.containsKey("phone")) courier.setPhone((String) updates.get("phone"));
        } else if (user instanceof RestaurantOwner ro) {
            if (updates.containsKey("name")) ro.setName((String) updates.get("name"));
            if (updates.containsKey("phone")) ro.setPhone((String) updates.get("phone"));
            if (updates.containsKey("city")) ro.setCity((String) updates.get("city"));
            if (updates.containsKey("district")) ro.setDistrict((String) updates.get("district"));
            if (updates.containsKey("address")) ro.setAddress((String) updates.get("address"));
        }
    }

}