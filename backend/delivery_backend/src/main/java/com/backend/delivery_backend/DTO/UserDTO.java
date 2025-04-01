package com.backend.delivery_backend.DTO;

public class UserDTO {
	private String name;
	private String email;
	private String password;
	private String phone;
	private String role;
	private String city;
	private String district;
	private String address;
	private String businessHoursStart;
	private String businessHoursEnd;
	private String cuisineType;
	private String deliveryType;





	public String getDeliveryType() {
		return deliveryType;
	}

	public void setDeliveryType(String deliveryType) {
		this.deliveryType = deliveryType;
	}



	public String getCuisineType() {
		return cuisineType;
	}

	public void setCuisineType(String cuisineType) {
		this.cuisineType = cuisineType;
	}


	public Float getRating() {
		return rating;
	}

	public void setRating(Float rating) {
		this.rating = rating;
	}

	private Float rating;


	// Getter - Setter
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }

	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }

	public String getRole() { return role; }
	public void setRole(String role) { this.role = role; }

	public String getCity() { return city; }
	public void setCity(String city) { this.city = city; }

	public String getDistrict() { return district; }
	public void setDistrict(String district) { this.district = district; }

	public String getAddress() { return address; }
	public void setAddress(String address) { this.address = address; }

	public String getBusinessHoursStart() { return businessHoursStart; }
	public void setBusinessHoursStart(String businessHoursStart) { this.businessHoursStart = businessHoursStart; }

	public String getBusinessHoursEnd() { return businessHoursEnd; }
	public void setBusinessHoursEnd(String businessHoursEnd) { this.businessHoursEnd = businessHoursEnd; }
}