import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const CourierRegisterRestaurantPage = () => {
  const [restaurantId, setRestaurantId] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const courierId = decoded.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post(
            `http://localhost:8080/api/couriers/${courierId}/assign-restaurant-by-name`,
            null,
            {
              params: { name: restaurantName }, // 👈 query param olarak geçiyoruz
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
      setMessage("Successfully registered with restaurant.");
    } catch (err) {
      setMessage("Error registering with restaurant.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Register with a Restaurant</h2>
      <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Restaurant Name"
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
        required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CourierRegisterRestaurantPage;