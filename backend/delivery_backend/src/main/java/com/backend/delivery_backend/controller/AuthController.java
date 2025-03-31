package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.UserDTO;
import com.backend.delivery_backend.model.PasswordResetToken;
import com.backend.delivery_backend.model.User;
import com.backend.delivery_backend.security.JwtUtil;
import com.backend.delivery_backend.service.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserDetailsServiceImpl userDetailsService;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody UserDTO userDTO) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userDTO.getEmail(), userDTO.getPassword())
            );

            User user = userDetailsService.getUserByEmail(userDTO.getEmail());
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // Logout işlemi sadece client-side'da token'ın silinmesi ile yapılır.
        return ResponseEntity.ok("Successfully logged out.");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDTO userDTO) {
        if ("admin".equalsIgnoreCase(userDTO.getRole())) {
            return ResponseEntity.badRequest().body("Admin registration is not permitted through this endpoint");
        }

        if (userDetailsService.getUserByEmail(userDTO.getEmail()) != null) {
            return ResponseEntity.badRequest().body("This email is already in use");
        }
        try {
            userDetailsService.save(userDTO);
            return ResponseEntity.ok("Registration successful");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody UserDTO userDTO) {
        try {
            User user = userDetailsService.getUserByEmail(userDTO.getEmail());
            if (user == null) {
                return ResponseEntity.status(404).body("User not found");
            }

            String result = userDetailsService.sendEmail(user);
            if ("success".equals(result)) {
                return ResponseEntity.ok("Reset email sent");
            } else {
                return ResponseEntity.internalServerError().body("Failed to send email");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Server error: " + e.getMessage());
        }
    }

    @GetMapping("/resetPassword/{token}")
    public ResponseEntity<?> getResetEmail(@PathVariable String token) {
        PasswordResetToken reset = userDetailsService.getToken(token);
        if (reset != null && userDetailsService.hasNotExpired(reset.getExpiryDateTime())) {
            return ResponseEntity.ok(Map.of("email", userDetailsService.getUserById(reset.getUserId()).getEmail()));
        }
        return ResponseEntity.badRequest().body("Token expired or invalid");
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(@RequestBody UserDTO userDTO) {
        try {
            User user = userDetailsService.getUserByEmail(userDTO.getEmail());
            if (user != null) {
                String encoded = userDetailsService.encodePassword(userDTO.getPassword());
                user.setPassword(encoded);
                userDetailsService.saveUser(user);
                return ResponseEntity.ok("Password reset successfully");
            }
            return ResponseEntity.badRequest().body("User not found");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Server error: " + e.getMessage());
        }
    }
}
