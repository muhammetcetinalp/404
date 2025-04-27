import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const DeliveryRequestPage = () => {
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState("ACCEPTED");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const courierId = decoded.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `http://localhost:8080/api/couriers/${courierId}/delivery-requests/${requestId}`,
        { status },
        {
          // params: { status },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Request updated successfully.");
    } catch (err) {
      setMessage("Error updating request.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Respond to Delivery Request</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Request ID"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          required
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ACCEPTED">Accept</option>
          <option value="REJECTED">Reject</option>
        </select>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default DeliveryRequestPage;
