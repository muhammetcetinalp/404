import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const RatingModal = ({ show, onClose, onSubmit, restaurantName, existingRating, existingReview }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [review, setReview] = useState('');

    useEffect(() => {
        if (show) {
            // If editing an existing rating, set the initial values
            setRating(existingRating || 0);
            setReview(existingReview || '');
        }
    }, [show, existingRating, existingReview]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ rating, review });
        setRating(0);
        setReview('');
    };

    const handleClose = () => {
        setRating(0);
        setReview('');
        onClose();
    };

    const modalStyle = {
        minHeight: '300px',
        maxHeight: '80vh'
    };

    const modalBodyStyle = {
        padding: '20px'
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg" dialogClassName="rating-modal">
            <Modal.Header closeButton>
                <Modal.Title>{existingRating ? 'Edit Rating' : 'Rate Order'}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={modalBodyStyle}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label h5">Rate {restaurantName}</label>
                        <div className="star-rating mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FontAwesomeIcon
                                    key={star}
                                    icon={faStar}
                                    className={`star ${star <= (hoveredRating || rating) ? 'text-warning' : 'text-secondary'}`}
                                    style={{ cursor: 'pointer', fontSize: '2rem', marginRight: '0.8rem' }}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="review" className="form-label h5">Review (Optional)</label>
                        <textarea
                            className="form-control"
                            id="review"
                            rows="8"
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Share your experience..."
                            style={{ resize: 'none', fontSize: '1rem', lineHeight: '1.5' }}
                        />
                    </div>
                    <div className="text-end mt-4">
                        <button type="submit" className="btn-orange btn btn-warning me-2 mr-1 mb-1 d-flex justify-content-center align-items-center" disabled={!rating}>
                            {existingRating ? 'Update Rating' : 'Submit Rating'}
                        </button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default RatingModal; 