package com.backend.delivery_backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.delivery_backend.ENUM.DeliveryType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import com.backend.delivery_backend.model.*;
import com.backend.delivery_backend.repository.*;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.delivery_backend.DTO.UserDTO;
import com.backend.delivery_backend.model.PasswordResetToken;
import com.backend.delivery_backend.model.User;
import com.backend.delivery_backend.repository.TokenRepository;

import java.util.*;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
	@Autowired private CustomerRepository customerRepository;
	@Autowired private CourierRepository courierRepository;
	@Autowired private AdminRepository adminRepository;
	@Autowired private RestaurantOwnerRepository restaurantOwnerRepository;
	@Autowired private TokenRepository tokenRepository;
	@Autowired private JavaMailSender javaMailSender;

	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = null;
		if ((user = customerRepository.findByEmail(email)) != null) return wrapUser(user);
		if ((user = courierRepository.findByEmail(email)) != null) return wrapUser(user);
		if ((user = restaurantOwnerRepository.findByEmail(email)) != null) return wrapUser(user);
		if ((user = adminRepository.findByEmail(email)) != null) return wrapUser(user);
		throw new UsernameNotFoundException("User not found");
	}

	private UserDetails wrapUser(User user) {
		List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toUpperCase()));
		return new org.springframework.security.core.userdetails.User(
				user.getEmail(), user.getPassword(), authorities
		);
	}

	public User save(UserDTO dto) {
		String encodedPassword = passwordEncoder.encode(dto.getPassword());
		String role = dto.getRole();

		switch (role.toLowerCase()) {
			case "customer":
				Customer c = new Customer();
				c.setCustomerId(UUID.randomUUID().toString());
				c.setName(dto.getName());
				c.setEmail(dto.getEmail());
				c.setPassword(encodedPassword);
				c.setPhone(dto.getPhone());
				c.setRole(role);
				c.setCity(dto.getCity());
				c.setDistrict(dto.getDistrict());
				c.setAddress(dto.getAddress());
				return customerRepository.save(c);

			case "courier":
				Courier cr = new Courier();
				cr.setCourierId(UUID.randomUUID().toString());
				cr.setName(dto.getName());
				cr.setEmail(dto.getEmail());
				cr.setPassword(encodedPassword);
				cr.setPhone(dto.getPhone());
				cr.setRole(role);
				return courierRepository.save(cr);

			case "restaurant_owner":
				RestaurantOwner r = new RestaurantOwner();
				r.setRestaurantId(UUID.randomUUID().toString());
				r.setName(dto.getName());
				r.setEmail(dto.getEmail());
				r.setPassword(encodedPassword);
				r.setPhone(dto.getPhone());
				r.setRole(role);
				r.setCity(dto.getCity());
				r.setDistrict(dto.getDistrict());
				r.setAddress(dto.getAddress());
				r.setBusinessHoursStart(dto.getBusinessHoursStart());
				r.setBusinessHoursEnd(dto.getBusinessHoursEnd());
				r.setCuisineType(dto.getCuisineType());
				r.setDeliveryType(DeliveryType.valueOf(dto.getDeliveryType().toUpperCase()));
				// Set default approval status to false (pending approval)
				r.setApproved(false);
				return restaurantOwnerRepository.save(r);

			case "admin":
				Admin admin = new Admin();
				admin.setName(dto.getName());
				admin.setEmail(dto.getEmail());
				admin.setPassword(encodedPassword);
				admin.setPhone(dto.getPhone());
				admin.setRole("ADMIN");
				return adminRepository.save(admin);

			default:
				throw new IllegalArgumentException("Invalid role: " + role);
		}
	}

	public String sendEmail(User user) {
		try {
			String resetLink = generateResetToken(user);
			SimpleMailMessage msg = new SimpleMailMessage();
			msg.setFrom("help.mealmate@gmail.com");
			msg.setTo(user.getEmail());
			msg.setSubject("Password Reset Request");
			msg.setText("Click the link below to reset your password:\n" + resetLink);
			javaMailSender.send(msg);
			return "success";
		} catch (Exception e) {
			e.printStackTrace();
			return "error";
		}
	}

	public String generateResetToken(User user) {
		PasswordResetToken existingToken = tokenRepository.findByUserId(user.getId());
		if (existingToken != null) {
			tokenRepository.delete(existingToken);
		}
		String token = UUID.randomUUID().toString();
		LocalDateTime expiry = LocalDateTime.now().plusMinutes(30);
		PasswordResetToken resetToken = new PasswordResetToken();
		resetToken.setUserId(user.getId());
		resetToken.setToken(token);
		resetToken.setExpiryDateTime(expiry);
		tokenRepository.save(resetToken);
		return "http://localhost:3000/resetPassword/" + token;
	}

	public boolean hasExpired(LocalDateTime expiryDateTime) {
		return expiryDateTime.isBefore(LocalDateTime.now());
	}

	public User getUserByEmail(String email) {
		User user = customerRepository.findByEmail(email);
		if (user == null) user = courierRepository.findByEmail(email);
		if (user == null) user = restaurantOwnerRepository.findByEmail(email);
		if (user == null) user = adminRepository.findByEmail(email);
		return user;
	}

	public PasswordResetToken getToken(String token) {
		return tokenRepository.findByToken(token);
	}

	public boolean hasNotExpired(LocalDateTime expiryDateTime) {
		return expiryDateTime.isAfter(LocalDateTime.now());
	}

	public String encodePassword(String rawPassword) {
		return passwordEncoder.encode(rawPassword);
	}

	public void saveUser(User user) {
		if (user instanceof Customer customer) customerRepository.save(customer);
		else if (user instanceof Courier courier) courierRepository.save(courier);
		else if (user instanceof RestaurantOwner owner) restaurantOwnerRepository.save(owner);
		else if (user instanceof Admin admin) adminRepository.save(admin);
	}

	public User getUserById(String userId) {
		User user = customerRepository.findByCustomerId(userId);
		if (user != null) return user;

		user = courierRepository.findByCourierId(userId);
		if (user != null) return user;

		user = restaurantOwnerRepository.findByRestaurantId(userId);
		if (user != null) return user;

		try {
			Long id = Long.parseLong(userId); // sadece bu noktada denenmeli
			user = adminRepository.findByAdminId(id);
		} catch (NumberFormatException e) {
			return null;
		}

		return user;
	}
}