package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.FeedbackDTO;
import com.backend.delivery_backend.service.FeedbackService;
import com.backend.delivery_backend.repository.CustomerRepository;
import com.backend.delivery_backend.model.Customer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private CustomerRepository customerRepository;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(Authentication auth,
                                            @RequestBody FeedbackDTO dto) {
        String email = auth.getName();
        Customer customer = customerRepository.findByEmail(email);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Customer not found");
        }

        try {
            feedbackService.submitFeedback(email, dto);
            return ResponseEntity.ok("Feedback submitted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}