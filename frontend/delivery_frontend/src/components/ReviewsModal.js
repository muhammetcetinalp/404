import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import api from '../api';

const ReviewsModal = ({ show, onClose, restaurantId, restaurantName }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!show || !restaurantId) return;
            
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/feedback/restaurant/${restaurantId}`);
                // Sort reviews by date (newest first)
                const sortedReviews = response.data.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setReviews(sortedReviews);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError('Failed to load reviews. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [show, restaurantId]);

    return (
        <Modal show={show} onHide={onClose} centered size="xl" dialogClassName="review-modal">
            <Modal.Header closeButton>
                <Modal.Title>Reviews for {restaurantName}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                <div className="reviews-container px-4">
                    {loading ? (
                        <div className="text-center py-4">
                            <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-orange" />
                            <p className="mt-2">Loading reviews...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger m-3">{error}</div>
                    ) : reviews.length === 0 ? (
                        <p className="text-center text-muted py-4">No reviews yet for this restaurant.</p>
                    ) : (
                        reviews.map((review, index) => (
                            <div key={review.orderId} className={`review-item p-3 ${index !== reviews.length - 1 ? 'border-bottom' : ''}`}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h6 className="mb-1">{review.customerName}</h6>
                                        <div className="rating">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <FontAwesomeIcon
                                                    key={star}
                                                    icon={faStar}
                                                    className={star <= review.rating ? 'text-warning' : 'text-muted'}
                                                    style={{ marginRight: '2px' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                                <p className="mb-0 review-text">
                                    {review.review || 'No written review'}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ReviewsModal; 