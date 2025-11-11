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
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');

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
      setError(null);
      
      const [dashStats, usersData, paymentsData, checkoutsData, plansData] = await Promise.all([
        apiService.get('/admin/dashboard').catch(err => {
          console.error('Dashboard stats error:', err);
          return { data: null };
        }),
        apiService.get('/admin/users').catch(err => {
          console.error('Users data error:', err);
          return { data: [] };
        }),
        apiService.get('/payments/admin/all').catch(err => {
          console.error('Payments data error:', err);
          return { data: [] };
        }),
        apiService.get('/checkouts/admin/all').catch(err => {
          console.error('Checkouts data error:', err);
          return { data: [] };
        }),
        apiService.get('/payments/plans').catch(err => {
          console.error('Plans data error:', err);
          return { data: [] };
        })
      ]);

      // Extract data from API responses
      setStats(dashStats?.data || null);
      
      // Users data
      const usersList = usersData?.data || [];
      console.log('Users fetched:', usersList.length);
      setUsers(Array.isArray(usersList) ? usersList : []);
      
      // Payments data  
      const paymentsList = paymentsData?.data || [];
      setPayments(Array.isArray(paymentsList) ? paymentsList : []);
      
      // Checkouts data
      const checkoutsList = checkoutsData?.data || [];
      setCheckouts(Array.isArray(checkoutsList) ? checkoutsList : []);
      
      // Plans data
      const plansList = plansData?.data || [];
      setPlans(Array.isArray(plansList) ? plansList : []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setError('Failed to load admin data. Please try again.');
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

  const handleAssignPackage = (user) => {
    setSelectedUser(user);
    setSelectedPlan('');
    setShowAssignModal(true);
  };

  const handleConfirmAssignPackage = async () => {
    if (!selectedPlan || !selectedUser) {
      alert('Please select a package');
      return;
    }

    try {
      await apiService.post('/admin/assign-package', {
        userId: selectedUser._id,
        planId: selectedPlan
      });
      
      alert(`Package assigned successfully to ${selectedUser.name}!`);
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedPlan('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to assign package:', error);
      alert(error.message || 'Failed to assign package');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await apiService.put(`/admin/users/${userId}/toggle-status`);
      alert(`User ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      alert(error.message || 'Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
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

      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary">Retry</button>
        </div>
      )}

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
          Users ({Array.isArray(users) ? users.length : 0})
        </button>
        <button 
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments ({Array.isArray(payments) ? payments.filter(p => p.status === 'pending').length : 0})
        </button>
        <button 
          className={`tab ${activeTab === 'checkouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkouts')}
        >
          Checkouts ({Array.isArray(checkouts) ? checkouts.filter(c => c.status === 'pending').length : 0})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{stats?.users?.total || users.length}</p>
              <span className="stat-label">Active: {stats?.users?.active || users.filter(u => u.isActive).length}</span>
            </div>
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <p className="stat-value">{stats?.payments?.pending || payments.filter(p => p.status === 'pending').length}</p>
              <span className="stat-label">Total: ${(stats?.payments?.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <h3>Pending Checkouts</h3>
              <p className="stat-value">{stats?.checkouts?.pending || checkouts.filter(c => c.status === 'pending').length}</p>
              <span className="stat-label">Total: ${(stats?.checkouts?.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">${(stats?.payments?.totalRevenue || 0).toFixed(2)}</p>
              <span className="stat-label">Approved payments</span>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-table">
            <h2>All Users</h2>
            {Array.isArray(users) && users.length > 0 ? (
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>${(user.balance || 0).toFixed(2)}</td>
                    <td>
                      <span className={`plan-badge ${user.activePayment?.plan?.name?.toLowerCase() || 'free'}`}>
                        {user.activePayment?.plan?.name || 'Free'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleAssignPackage(user)}
                        className="btn-primary btn-sm"
                        title="Assign Package"
                      >
                        📦 Assign
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                        className={`btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {user.isActive ? '🔒' : '✅'}
                      </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No users found.</p>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-table">
            <h2>Payment Requests</h2>
            {Array.isArray(payments) && payments.length > 0 ? (
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
            ) : (
              <p className="no-data">No payment requests found.</p>
            )}
          </div>
        )}

        {activeTab === 'checkouts' && (
          <div className="checkouts-table">
            <h2>Checkout Requests</h2>
            {Array.isArray(checkouts) && checkouts.length > 0 ? (
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
            ) : (
              <p className="no-data">No checkout requests found.</p>
            )}
          </div>
        )}
      </div>

      {/* Assign Package Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Package to {selectedUser?.name}</h2>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-info">
                <strong>User:</strong> {selectedUser?.email}<br />
                <strong>Current Plan:</strong> {selectedUser?.activePayment?.plan?.name || 'Free'}
              </p>
              
              <div className="form-group">
                <label htmlFor="plan-select">Select Investment Package:</label>
                <select 
                  id="plan-select"
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="plan-select"
                >
                  <option value="">-- Choose a Package --</option>
                  {plans.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} - ${plan.price} Investment | ${plan.dailyProfit || (plan.price * 0.03).toFixed(0)} Daily Profit | {plan.dailyAdsLimit} Ads/Day
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedPlan && (
                <div className="package-preview">
                  {plans.find(p => p._id === selectedPlan) && (
                    <div className="preview-details">
                      <h4>Package Details:</h4>
                      <div className="preview-grid">
                        <div className="preview-item">
                          <span className="preview-label">Investment Amount:</span>
                          <span className="preview-value">${plans.find(p => p._id === selectedPlan).price}</span>
                        </div>
                        <div className="preview-item">
                          <span className="preview-label">Daily Profit (3%):</span>
                          <span className="preview-value highlight">${plans.find(p => p._id === selectedPlan).dailyProfit || (plans.find(p => p._id === selectedPlan).price * 0.03).toFixed(0)}</span>
                        </div>
                        <div className="preview-item">
                          <span className="preview-label">Ads Per Day:</span>
                          <span className="preview-value">{plans.find(p => p._id === selectedPlan).dailyAdsLimit}</span>
                        </div>
                        <div className="preview-item">
                          <span className="preview-label">Duration:</span>
                          <span className="preview-value">{plans.find(p => p._id === selectedPlan).duration} days</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAssignPackage}
                className="btn-primary"
                disabled={!selectedPlan}
              >
                Assign Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
