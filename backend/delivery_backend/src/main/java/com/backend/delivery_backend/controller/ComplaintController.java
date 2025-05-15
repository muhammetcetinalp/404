package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.ComplaintDTO;
import com.backend.delivery_backend.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/submit")
    public ResponseEntity<String> submitComplaint(@RequestBody ComplaintDTO dto) {
        complaintService.submitComplaint(dto);
        return ResponseEntity.ok("Complaint submitted successfully.");
    }
}