package com.backend.delivery_backend.service;

import com.backend.delivery_backend.DTO.ComplaintDTO;
import com.backend.delivery_backend.model.Complaint;
import com.backend.delivery_backend.model.Customer;
import com.backend.delivery_backend.repository.ComplaintRepository;
import com.backend.delivery_backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ComplaintService {
    private final ComplaintRepository complaintRepository;
    private final CustomerRepository customerRepository;

    public ComplaintService(ComplaintRepository complaintRepository, CustomerRepository customerRepository) {
        this.complaintRepository = complaintRepository;
        this.customerRepository = customerRepository;
    }

    public void submitComplaint(ComplaintDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Complaint complaint = new Complaint();
        complaint.setCustomer(customer);
        complaint.setMessage(dto.getMessage());
        complaint.setStatus("PENDING");
        complaintRepository.save(complaint);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void resolveComplaint(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus("RESOLVED");
        complaintRepository.save(complaint);
    }

    @Transactional
    public void dismissComplaint(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus("DISMISSED");
        complaintRepository.save(complaint);
    }
}