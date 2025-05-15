package com.backend.delivery_backend.controller;


import com.backend.delivery_backend.DTO.ComplaintDTO;
import com.backend.delivery_backend.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public class ComplaintController {
    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping("/customer/complaints")
    public ResponseEntity<Void> submitComplaint(@RequestBody ComplaintDTO dto) {
        complaintService.submitComplaint(dto);
        return ResponseEntity.ok().build();
    }
}
