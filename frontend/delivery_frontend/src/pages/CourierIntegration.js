// src/services/CourierIntegration.js
import api from '../api';

/**
 * Service for managing courier-related operations
 */
const CourierIntegration = {

    /**
     * Get active orders that a courier can accept
     * @returns {Promise} Promise with response data
     */
    getActiveOrders: async () => {
        try {
            const response = await api.get('/courier/orders/active');
            return response.data;
        } catch (error) {
            console.error('Error fetching active orders:', error);
            throw error;
        }
    },

    /**
     * Accept an order for delivery
     * @param {string} orderId - ID of the order to accept
     * @returns {Promise} Promise with response data
     */
    acceptOrder: async (orderId) => {
        try {
            const response = await api.patch(`/courier/orders/accept/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error accepting order:', error);
            throw error;
        }
    },

    /**
     * Send a request to a restaurant for courier registration
     * @param {string} courierId - ID of the courier
     * @param {string} restaurantId - ID of the restaurant
     * @returns {Promise} Promise with response data
     */
    sendRestaurantRequest: async (courierId, restaurantId) => {
        try {
            const response = await api.post('/courier-requests/send', null, {
                params: { courierId, restaurantId }
            });
            return response.data;
        } catch (error) {
            console.error('Error sending restaurant request:', error);
            throw error;
        }
    },

    /**
     * Update delivery status (picked up, delivered, etc.)
     * @param {string} orderId - ID of the order
     * @param {string} status - New status to set
     * @returns {Promise} Promise with response data
     */
    updateDeliveryStatus: async (orderId, status) => {
        try {
            const response = await api.patch(`/orders/status/${orderId}`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating delivery status:', error);
            throw error;
        }
    },

    /**
     * Get all courier-restaurant requests for a restaurant
     * @param {string} restaurantId - ID of the restaurant
     * @returns {Promise} Promise with response data
     */
    getRestaurantRequests: async (restaurantId) => {
        try {
            const response = await api.get(`/courier-requests/restaurant/${restaurantId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant requests:', error);
            throw error;
        }
    },

    /**
     * Respond to a courier registration request
     * @param {number} requestId - ID of the request
     * @param {string} action - Action to take (ACCEPT or REJECT)
     * @returns {Promise} Promise with response data
     */
    respondToRequest: async (requestId, action) => {
        try {
            const response = await api.post('/courier-requests/restaurant/respond', null, {
                params: { requestId, action }
            });
            return response.data;
        } catch (error) {
            console.error('Error responding to request:', error);
            throw error;
        }
    },

    /**
     * Get deliveries assigned to the courier
     * @returns {Promise} Promise with response data
     */
    getMyDeliveries: async () => {
        try {
            const response = await api.get('/courier/deliveries');
            return response.data;
        } catch (error) {
            console.error('Error fetching courier deliveries:', error);
            throw error;
        }
    },


};

export default CourierIntegration;