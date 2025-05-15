import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faUser, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminLayout from './AdminLayout';
import api from '../api';
import '../styles/admin.css';

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/admin/complaints');
            setComplaints(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching complaints:', err);
            setError('Failed to fetch complaints');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-app-container">
                <Header />
                <div className="admin-loading">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading complaints...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="admin-app-container">
            <Header />
            <div className="admin-dashboard">
                <AdminLayout active="complaints" />
                
                <div className="admin-content">
                    <div className="admin-header">
                        <div className="admin-header-title">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="admin-header-icon" />
                            <h2>Customer Complaints</h2>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger mx-4 mt-4" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="admin-table-container">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Message</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.length > 0 ? (
                                        complaints.map((complaint) => (
                                            <tr key={complaint.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FontAwesomeIcon icon={faUser} className="me-2 text-secondary" />
                                                        <span>{complaint.customer?.name || 'Anonymous Customer'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: '500px' }}>
                                                    <div className="text-wrap">{complaint.message}</div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-secondary" />
                                                        <span>{new Date(complaint.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center py-5">
                                                <FontAwesomeIcon icon={faExclamationTriangle} size="2x" className="text-muted mb-3 d-block" />
                                                <h5 className="text-muted">No complaints found</h5>
                                                <p className="text-muted mb-0">There are no customer complaints in the system yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminComplaints; 