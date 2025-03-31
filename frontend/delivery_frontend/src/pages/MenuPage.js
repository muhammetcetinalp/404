import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    available: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);

  const restaurantId = decoded.id;
  console.log("Restaurant ID:", restaurantId);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchMenu = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/restaurants/${restaurantId}/menu`,
        { headers }
      );
      setMenuItems(res.data);
    } catch (err) {
      console.error("Error fetching menu items", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isEditing
      ? `http://localhost:8080/api/restaurants/${restaurantId}/menu/${editingId}`
      : `http://localhost:8080/api/restaurants/${restaurantId}/menu`;

    const method = isEditing ? "put" : "post";

    try {
      await axios[method](endpoint, formData, { headers });
      setMessage(
        isEditing
          ? "Menu item updated successfully!"
          : "Menu item added successfully!"
      );
      setFormData({
        name: "",
        description: "",
        price: "",
        available: true,
      });
      setIsEditing(false);
      setEditingId(null);
      fetchMenu();
    } catch (err) {
      setMessage("Error saving menu item.");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      available: item.available,
    });
    setIsEditing(true);
    setEditingId(item.id);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/restaurants/${restaurantId}/menu/${itemId}`,
        { headers }
      );
      setMessage("Menu item deleted successfully!");
      fetchMenu();
    } catch (err) {
      setMessage("Error deleting item.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "1rem" }}>
      <h2>Restaurant Menu</h2>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <br />
        <input
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <br />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <br />
        <label>
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          Available
        </label>
        <br />
        <button type="submit">{isEditing ? "Edit Menu" : "Add Menu"}</button>
      </form>

      <hr />

      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong> - {item.price} ₺{" "}
            {item.available ? "🟢" : "🔴"}
            <br />
            {item.description}
            <br />
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuPage;
