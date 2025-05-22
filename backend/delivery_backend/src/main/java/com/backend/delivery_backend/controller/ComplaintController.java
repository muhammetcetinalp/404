package com.backend.delivery_backend.controller;

import com.backend.delivery_backend.DTO.ComplaintDTO;
import com.backend.delivery_backend.model.Complaint;
import com.backend.delivery_backend.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/complaints/submit")
    public ResponseEntity<String> submitComplaint(@RequestBody ComplaintDTO dto) {
        complaintService.submitComplaint(dto);
        return ResponseEntity.ok("Complaint submitted successfully.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/complaints")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        List<Complaint> complaints = complaintService.getAllComplaints();
        return ResponseEntity.ok(complaints);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/complaints/{complaintId}/resolve")
    public ResponseEntity<String> resolveComplaint(@PathVariable Long complaintId) {
        complaintService.resolveComplaint(complaintId);
        return ResponseEntity.ok("Complaint resolved successfully.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/complaints/{complaintId}/dismiss")
    public ResponseEntity<String> dismissComplaint(@PathVariable Long complaintId) {
        complaintService.dismissComplaint(complaintId);
        return ResponseEntity.ok("Complaint dismissed successfully.");
    }
}