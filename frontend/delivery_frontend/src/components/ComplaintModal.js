import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import api from '../api';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const ComplaintModal = ({ show, onClose }) => {
    const [complaint, setComplaint] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const MAX_LENGTH = 250;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!complaint.trim()) {
            toast.warning('Please enter your complaint');
            return;
        }

        if (complaint.length > MAX_LENGTH) {
            toast.warning(`Complaint must not exceed ${MAX_LENGTH} characters`);
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login first');
                return;
            }

            const decodedToken = jwtDecode(token);
            const customerId = decodedToken.id;

            const response = await api.post('/complaints/submit', {
                customerId: customerId,
                message: complaint.trim()
            });

            if (response.status === 200) {
                toast.success('Complaint submitted successfully');
                setComplaint('');
                onClose();
            }
        } catch (err) {
            console.error('Error submitting complaint:', err);
            if (err.response?.status === 404) {
                toast.error('Complaint service is not available');
            } else {
                toast.error(err.response?.data || 'Failed to submit complaint. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplaintChange = (e) => {
        const text = e.target.value;
        if (text.length <= MAX_LENGTH) {
            setComplaint(text);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Wishes & Complaints Form</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="complaint" className="form-label">Your Feedback</label>
                        <textarea
                            className="form-control"
                            id="complaint"
                            rows="8"
                            value={complaint}
                            onChange={handleComplaintChange}
                            placeholder="Please share your feedback, suggestions, or report any issues you've experienced..."
                            maxLength={MAX_LENGTH}
                            style={{ minHeight: '200px', resize: 'none' }}
                        />
                        <small className="text-muted d-block text-end mt-1">
                            {complaint.length}/{MAX_LENGTH} characters
                        </small>
                    </div>
                    <div className="text-end">

                        <button
                            type="submit"
                            className="btn btn-orange"
                            disabled={submitting || !complaint.trim()}
                        >
                            {submitting ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default ComplaintModal; 