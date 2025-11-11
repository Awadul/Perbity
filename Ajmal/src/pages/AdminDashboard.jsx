import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import apiService from '../services/api';
import { API_BASE_URL } from '../config/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashStats, usersData, paymentsData, checkoutsData] = await Promise.all([
        apiService.get('/admin/dashboard'),
        apiService.get('/admin/users'),
        apiService.get('/payments/admin/all'),
        apiService.get('/checkouts/admin/all')
      ]);

      setStats(dashStats);
      setUsers(usersData);
      setPayments(paymentsData);
      setCheckouts(checkoutsData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      alert('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (paymentId) => {
    try {
      await apiService.put(`/payments/${paymentId}/approve`);
      alert('Payment approved successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to approve payment:', error);
      alert(error.message || 'Failed to approve payment');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await apiService.put(`/payments/${paymentId}/reject`, { reason });
      alert('Payment rejected');
      fetchData();
    } catch (error) {
      console.error('Failed to reject payment:', error);
      alert(error.message || 'Failed to reject payment');
    }
  };

  const handleCompleteCheckout = async (checkoutId) => {
    const transactionId = prompt('Enter transaction ID:');
    if (!transactionId) return;

    try {
      await apiService.put(`/checkouts/${checkoutId}/complete`, { transactionId });
      alert('Checkout completed successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to complete checkout:', error);
      alert(error.message || 'Failed to complete checkout');
    }
  };

  const handleRejectCheckout = async (checkoutId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await apiService.put(`/checkouts/${checkoutId}/reject`, { reason });
      alert('Checkout rejected');
      fetchData();
    } catch (error) {
      console.error('Failed to reject checkout:', error);
      alert(error.message || 'Failed to reject checkout');
    }
  };

  const handleViewPaymentProof = (paymentId) => {
    const imageUrl = `${API_BASE_URL}/api/payments/${paymentId}/image`;
    window.open(imageUrl, '_blank');
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-header-actions">
          <span className="admin-name">Welcome, {user?.name}</span>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            User Dashboard
          </button>
          <button onClick={async () => { await logout(); navigate('/login'); }} className="btn-danger">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments ({payments.filter(p => p.status === 'pending').length})
        </button>
        <button 
          className={`tab ${activeTab === 'checkouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkouts')}
        >
          Checkouts ({checkouts.filter(c => c.status === 'pending').length})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.users.total}</p>
              <span className="stat-label">Active: {stats.users.active}</span>
            </div>
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <p className="stat-value">{stats.payments.pending}</p>
              <span className="stat-label">Total: ${stats.payments.totalAmount.toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <h3>Pending Checkouts</h3>
              <p className="stat-value">{stats.checkouts.pending}</p>
              <span className="stat-label">Total: ${stats.checkouts.totalAmount.toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">${stats.payments.totalRevenue.toFixed(2)}</p>
              <span className="stat-label">Approved payments</span>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-table">
            <h2>All Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Active Plan</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>${user.balance.toFixed(2)}</td>
                    <td>{user.activePayment?.plan?.name || 'Free'}</td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-table">
            <h2>Payment Requests</h2>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Proof</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment.user?.name}</td>
                    <td>{payment.plan?.name}</td>
                    <td>${payment.plan?.price}</td>
                    <td>
                      <button 
                        onClick={() => handleViewPaymentProof(payment._id)}
                        className="btn-link"
                      >
                        View Proof
                      </button>
                    </td>
                    <td>
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                      {payment.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprovePayment(payment._id)}
                            className="btn-success btn-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectPayment(payment._id)}
                            className="btn-danger btn-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'checkouts' && (
          <div className="checkouts-table">
            <h2>Checkout Requests</h2>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Account Details</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkouts.map(checkout => (
                  <tr key={checkout._id}>
                    <td>{checkout.user?.name}</td>
                    <td>${checkout.amount.toFixed(2)}</td>
                    <td>{checkout.paymentMethod}</td>
                    <td>
                      <small>{checkout.paymentDetails?.accountDetails}</small>
                    </td>
                    <td>
                      <span className={`status-badge ${checkout.status}`}>
                        {checkout.status}
                      </span>
                    </td>
                    <td>{new Date(checkout.createdAt).toLocaleDateString()}</td>
                    <td>
                      {(checkout.status === 'pending' || checkout.status === 'processing') && (
                        <>
                          <button 
                            onClick={() => handleCompleteCheckout(checkout._id)}
                            className="btn-success btn-sm"
                          >
                            Complete
                          </button>
                          <button 
                            onClick={() => handleRejectCheckout(checkout._id)}
                            className="btn-danger btn-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
