package com.backend.delivery_backend.controller;



import com.backend.delivery_backend.DTO.UserDTO;
import com.backend.delivery_backend.model.Admin;
import com.backend.delivery_backend.repository.AdminRepository;
import com.backend.delivery_backend.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminManagementController {

    @Autowired private AdminRepository adminRepository;
    @Autowired private UserDetailsServiceImpl userService;

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody UserDTO dto) {
        if (adminRepository.findByEmail(dto.getEmail()) != null) {
            return ResponseEntity.badRequest().body("This email is already in use");
        }

        Admin admin = new Admin();
        admin.setName(dto.getName());
        admin.setEmail(dto.getEmail());
        admin.setPassword(userService.encodePassword(dto.getPassword()));
        admin.setPhone(dto.getPhone());
        admin.setRole("ADMIN");

        adminRepository.save(admin);
        return ResponseEntity.ok("New admin created successfully.");
    }

}
