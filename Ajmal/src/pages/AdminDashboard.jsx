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
  const [ads, setAds] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [editingAd, setEditingAd] = useState(null);
  const [adForm, setAdForm] = useState({
    title: 'Tech Gadgets',
    description: '',
    url: '',
    icon: 'fa-mobile-screen',
    color: 'from-blue-500 to-blue-400',
    earning: 1.00,
    isActive: true,
    isPremium: false
  });

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
      
      const [dashStats, usersData, paymentsData, checkoutsData, plansData, adsData] = await Promise.all([
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
        }),
        apiService.get('/ads').catch(err => {
          console.error('Ads data error:', err);
          return { data: { data: [] } };
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
      
      // Ads data
      const adsList = adsData?.data?.data || [];
      setAds(Array.isArray(adsList) ? adsList : []);
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

  const handleOpenAdModal = (ad = null) => {
    if (ad) {
      setEditingAd(ad);
      setAdForm({
        title: ad.title,
        description: ad.description,
        url: ad.url,
        icon: ad.icon,
        color: ad.color,
        earning: ad.earning,
        isActive: ad.isActive,
        isPremium: ad.isPremium || false
      });
    } else {
      setEditingAd(null);
      setAdForm({
        title: 'Tech Gadgets',
        description: '',
        url: '',
        icon: 'fa-mobile-screen',
        color: 'from-blue-500 to-blue-400',
        earning: 1.00,
        isActive: true,
        isPremium: false
      });
    }
    setShowAdModal(true);
  };

  const handleSaveAd = async () => {
    try {
      if (!adForm.title || !adForm.description || !adForm.url) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingAd) {
        // Update existing ad
        await apiService.put(`/ads/${editingAd._id}`, adForm);
        alert('Ad updated successfully!');
      } else {
        // Create new ad
        await apiService.post('/ads', adForm);
        alert('Ad created successfully!');
      }
      
      setShowAdModal(false);
      setEditingAd(null);
      fetchData();
    } catch (error) {
      console.error('Failed to save ad:', error);
      alert(error.message || 'Failed to save ad');
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      await apiService.delete(`/ads/${adId}`);
      alert('Ad deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to delete ad:', error);
      alert(error.message || 'Failed to delete ad');
    }
  };

  const handleToggleAdStatus = async (adId, currentStatus) => {
    try {
      await apiService.put(`/ads/${adId}`, { isActive: !currentStatus });
      alert(`Ad ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
      alert(error.message || 'Failed to update ad status');
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
        <button 
          className={`tab ${activeTab === 'ads' ? 'active' : ''}`}
          onClick={() => setActiveTab('ads')}
        >
          Ads ({Array.isArray(ads) ? ads.length : 0})
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)'}}>
                  👥
                </div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-value">{stats?.users?.total || users.length}</p>
                  <span className="stat-label">Active: {stats?.users?.active || users.filter(u => u.isActive).length} | Banned: {users.filter(u => u.isBanned).length}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)'}}>
                  💰
                </div>
                <div className="stat-content">
                  <h3>Total Balance</h3>
                  <p className="stat-value">${users.reduce((sum, u) => sum + (u.balance || 0), 0).toFixed(2)}</p>
                  <span className="stat-label">Total Earnings: ${users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)'}}>
                  📊
                </div>
                <div className="stat-content">
                  <h3>Pending Payments</h3>
                  <p className="stat-value">{stats?.payments?.pending || payments.filter(p => p.status === 'pending').length}</p>
                  <span className="stat-label">Total: ${(stats?.payments?.totalAmount || payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0)).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'}}>
                  💸
                </div>
                <div className="stat-content">
                  <h3>Pending Checkouts</h3>
                  <p className="stat-value">{stats?.checkouts?.pending || checkouts.filter(c => c.status === 'pending').length}</p>
                  <span className="stat-label">Total: ${(stats?.checkouts?.totalAmount || checkouts.filter(c => c.status === 'pending').reduce((sum, c) => sum + (c.amount || 0), 0)).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'}}>
                  💳
                </div>
                <div className="stat-content">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${(stats?.payments?.totalRevenue || payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0)).toFixed(2)}</p>
                  <span className="stat-label">Approved: {payments.filter(p => p.status === 'completed').length} payments</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'}}>
                  📱
                </div>
                <div className="stat-content">
                  <h3>Total Ads</h3>
                  <p className="stat-value">{ads.length}</p>
                  <span className="stat-label">Active: {ads.filter(a => a.isActive).length} | Clicks: {ads.reduce((sum, a) => sum + (a.clicks || 0), 0)}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)'}}>
                  🎯
                </div>
                <div className="stat-content">
                  <h3>Total Referrals</h3>
                  <p className="stat-value">{users.reduce((sum, u) => sum + (u.referralCount || 0), 0)}</p>
                  <span className="stat-label">Active: {users.reduce((sum, u) => sum + (u.activeReferrals || 0), 0)}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon" style={{background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)'}}>
                  💵
                </div>
                <div className="stat-content">
                  <h3>Total Withdrawn</h3>
                  <p className="stat-value">${users.reduce((sum, u) => sum + (u.totalWithdrawn || 0), 0).toFixed(2)}</p>
                  <span className="stat-label">From completed checkouts</span>
                </div>
              </div>
            </div>
            
            <div className="dashboard-overview" style={{marginTop: '30px'}}>
              <h2>System Overview</h2>
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>📊 Earnings Breakdown</h3>
                  <div className="overview-stats">
                    <div className="overview-stat">
                      <span>Ads Earnings:</span>
                      <strong>${users.reduce((sum, u) => sum + (u.earnings?.ads || 0), 0).toFixed(2)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Referral Earnings:</span>
                      <strong>${users.reduce((sum, u) => sum + (u.earnings?.referrals || 0), 0).toFixed(2)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Investment Earnings:</span>
                      <strong>${users.reduce((sum, u) => sum + (u.earnings?.investments || 0), 0).toFixed(2)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Email Earnings:</span>
                      <strong>${users.reduce((sum, u) => sum + (u.earnings?.emails || 0), 0).toFixed(2)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Review Earnings:</span>
                      <strong>${users.reduce((sum, u) => sum + (u.earnings?.reviews || 0), 0).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="overview-card">
                  <h3>📈 User Activity</h3>
                  <div className="overview-stats">
                    <div className="overview-stat">
                      <span>Total Ads Completed:</span>
                      <strong>{users.reduce((sum, u) => sum + (u.adsCompleted || 0), 0)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Ads Today:</span>
                      <strong>{users.reduce((sum, u) => sum + (u.adsCompletedToday || 0), 0)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Total Deposits (Approved Packages):</span>
                      <strong>${users.reduce((sum, u) => sum + (u.totalDeposits || 0), 0).toFixed(2)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Active Investments:</span>
                      <strong>{users.reduce((sum, u) => sum + (u.activeInvestments || 0), 0)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Investment Profit:</span>
                      <strong>${users.reduce((sum, u) => sum + (u.investmentProfit || 0), 0).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="overview-card">
                  <h3>👥 User Statistics</h3>
                  <div className="overview-stats">
                    <div className="overview-stat">
                      <span>Email Verified:</span>
                      <strong>{users.filter(u => u.isEmailVerified).length}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Phone Verified:</span>
                      <strong>{users.filter(u => u.isPhoneVerified).length}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Average Level:</span>
                      <strong>{(users.reduce((sum, u) => sum + (u.level || 1), 0) / users.length).toFixed(1)}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Total Experience:</span>
                      <strong>{users.reduce((sum, u) => sum + (u.experience || 0), 0).toLocaleString()}</strong>
                    </div>
                    <div className="overview-stat">
                      <span>Total Logins:</span>
                      <strong>{users.reduce((sum, u) => sum + (u.loginCount || 0), 0)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
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
                    <th>Total Deposits</th>
                    <th>Total Earnings</th>
                    <th>Today's Ads</th>
                    <th>Level</th>
                    <th>Referrals</th>
                    <th>Withdrawn</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} style={{width: '32px', height: '32px', borderRadius: '50%'}} />
                        ) : (
                          <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#00BCD4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div>{user.name}</div>
                          {user.country && <small style={{color: '#666'}}>📍 {user.country}</small>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{user.email}</div>
                      {user.isEmailVerified && <small style={{color: '#4CAF50'}}>✓ Verified</small>}
                    </td>
                    <td>
                      <div>{user.phone}</div>
                      {user.isPhoneVerified && <small style={{color: '#4CAF50'}}>✓ Verified</small>}
                    </td>
                    <td>
                      <strong>${(user.balance || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <div style={{color: '#4CAF50', fontWeight: 'bold'}}>${(user.totalDeposits || 0).toFixed(2)}</div>
                      <small style={{color: '#666'}}>From approved packages</small>
                    </td>
                    <td>
                      <div>${(user.totalEarnings || 0).toFixed(2)}</div>
                      <small style={{color: '#666'}}>
                        Ads: ${(user.earnings?.ads || 0).toFixed(2)} | 
                        Ref: ${(user.earnings?.referrals || 0).toFixed(2)}
                      </small>
                    </td>
                    <td>
                      <div>{user.adsCompletedToday || 0} / {user.maxDailyAds || 10}</div>
                      <small style={{color: '#666'}}>Total: {user.adsCompleted || 0}</small>
                    </td>
                    <td>
                      <div>Level {user.level || 1}</div>
                      <small style={{color: '#666'}}>XP: {user.experience || 0}</small>
                    </td>
                    <td>
                      <div>{user.referralCount || 0} total</div>
                      <small style={{color: '#666'}}>Active: {user.activeReferrals || 0}</small>
                    </td>
                    <td>
                      <div style={{color: '#f44336', fontWeight: 'bold'}}>${(user.totalWithdrawn || 0).toFixed(2)}</div>
                      <small style={{color: '#666'}}>From completed checkouts</small>
                    </td>
                    <td>
                      <div>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {user.isBanned && <small style={{color: '#f44336'}}>🚫 Banned</small>}
                      {user.role === 'admin' && <small style={{color: '#FF9800'}}>👑 Admin</small>}
                    </td>
                    <td>
                      <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                      {user.lastLogin && <small style={{color: '#666'}}>Last: {new Date(user.lastLogin).toLocaleDateString()}</small>}
                    </td>
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

        {activeTab === 'ads' && (
          <div className="ads-table">
            <div className="table-header">
              <h2>Ads Management</h2>
              <button onClick={() => handleOpenAdModal()} className="btn-primary">
                + Add New Ad
              </button>
            </div>
            {Array.isArray(ads) && ads.length > 0 ? (
              <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>URL</th>
                  <th>Icon</th>
                  <th>Earning</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad._id}>
                    <td>{ad.title}</td>
                    <td>
                      <small>{ad.description?.substring(0, 50)}...</small>
                    </td>
                    <td>
                      <a href={ad.url} target="_blank" rel="noopener noreferrer" className="btn-link">
                        Visit
                      </a>
                    </td>
                    <td>
                      <i className={`fas ${ad.icon}`}></i>
                    </td>
                    <td>${ad.earning.toFixed(2)}</td>
                    <td>{ad.totalClicks || 0}</td>
                    <td>
                      <span className={`status-badge ${ad.isActive ? 'active' : 'inactive'}`}>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleOpenAdModal(ad)}
                        className="btn-primary btn-sm"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleToggleAdStatus(ad._id, ad.isActive)}
                        className={`btn-sm ${ad.isActive ? 'btn-warning' : 'btn-success'}`}
                        title={ad.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {ad.isActive ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        onClick={() => handleDeleteAd(ad._id)}
                        className="btn-danger btn-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            ) : (
              <p className="no-data">No ads found. Create your first ad!</p>
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
                  <th>Payment Details</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkouts.map(checkout => (
                  <tr key={checkout._id}>
                    <td>
                      <div>{checkout.user?.name}</div>
                      <small style={{color: '#666'}}>{checkout.user?.email}</small>
                    </td>
                    <td>
                      <div style={{fontWeight: 'bold', color: '#f44336'}}>${checkout.amount.toFixed(2)}</div>
                    </td>
                    <td>
                      <span style={{textTransform: 'capitalize', fontWeight: '500'}}>
                        {checkout.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <div style={{fontSize: '13px'}}>
                        {checkout.paymentMethod === 'easypaisa' ? (
                          <>
                            <div><strong>Phone:</strong> {checkout.paymentDetails?.phoneNumber || 'N/A'}</div>
                            <div><strong>Name:</strong> {checkout.paymentDetails?.accountHolderName || checkout.paymentDetails?.accountName || 'N/A'}</div>
                          </>
                        ) : checkout.paymentMethod === 'bank' ? (
                          <>
                            <div><strong>Account:</strong> {checkout.paymentDetails?.accountNumber || 'N/A'}</div>
                            <div><strong>Name:</strong> {checkout.paymentDetails?.accountName || 'N/A'}</div>
                            <div><strong>Bank:</strong> {checkout.paymentDetails?.bankName || 'N/A'}</div>
                          </>
                        ) : checkout.paymentMethod === 'binance' ? (
                          <>
                            <div><strong>ID:</strong> {checkout.paymentDetails?.binanceId || 'N/A'}</div>
                            <div><strong>Email:</strong> {checkout.paymentDetails?.email || 'N/A'}</div>
                          </>
                        ) : checkout.paymentMethod === 'crypto' ? (
                          <>
                            <div><strong>Wallet:</strong> {checkout.paymentDetails?.walletAddress || 'N/A'}</div>
                          </>
                        ) : (
                          <>
                            <div><strong>Email:</strong> {checkout.paymentDetails?.email || 'N/A'}</div>
                            {checkout.paymentDetails?.accountNumber && (
                              <div><strong>Account:</strong> {checkout.paymentDetails.accountNumber}</div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${checkout.status}`}>
                        {checkout.status}
                      </span>
                    </td>
                    <td>
                      <div>{new Date(checkout.createdAt).toLocaleDateString()}</div>
                      <small style={{color: '#666'}}>{new Date(checkout.createdAt).toLocaleTimeString()}</small>
                    </td>
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

      {/* Ad Modal */}
      {showAdModal && (
        <div className="modal-overlay" onClick={() => setShowAdModal(false)}>
          <div className="modal-content ad-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAd ? 'Edit Ad' : 'Create New Ad'}</h2>
              <button className="modal-close" onClick={() => setShowAdModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="ad-title">Title *</label>
                <select 
                  id="ad-title"
                  value={adForm.title}
                  onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                  className="form-control"
                >
                  <option value="Tech Gadgets">Tech Gadgets</option>
                  <option value="Mobile Packages">Mobile Packages</option>
                  <option value="Online Learning">Online Learning</option>
                  <option value="Shopping Deals">Shopping Deals</option>
                  <option value="Freelance Work">Freelance Work</option>
                  <option value="Health Products">Health Products</option>
                  <option value="Travel Offers">Travel Offers</option>
                  <option value="Food Delivery">Food Delivery</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Home Services">Home Services</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="ad-description">Description *</label>
                <textarea 
                  id="ad-description"
                  value={adForm.description}
                  onChange={(e) => setAdForm({...adForm, description: e.target.value})}
                  placeholder="Brief description of the ad"
                  className="form-control"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ad-url">URL *</label>
                <input 
                  id="ad-url"
                  type="url"
                  value={adForm.url}
                  onChange={(e) => setAdForm({...adForm, url: e.target.value})}
                  placeholder="https://example.com"
                  className="form-control"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ad-icon">Icon (FontAwesome)</label>
                  <select 
                    id="ad-icon"
                    value={adForm.icon}
                    onChange={(e) => setAdForm({...adForm, icon: e.target.value})}
                    className="form-control"
                  >
                    <option value="fa-mobile-screen">📱 Mobile Screen (Tech)</option>
                    <option value="fa-sim-card">📶 SIM Card (Mobile)</option>
                    <option value="fa-graduation-cap">🎓 Graduation Cap (Learning)</option>
                    <option value="fa-bag-shopping">🛍️ Shopping Bag (Shopping)</option>
                    <option value="fa-laptop-code">💻 Laptop Code (Freelance)</option>
                    <option value="fa-heart-pulse">❤️ Heart Pulse (Health)</option>
                    <option value="fa-plane">✈️ Plane (Travel)</option>
                    <option value="fa-utensils">🍴 Utensils (Food)</option>
                    <option value="fa-film">🎬 Film (Entertainment)</option>
                    <option value="fa-house-chimney">🏠 House (Home Services)</option>
                  </select>
                  <small>Icon preview: <i className={`fas ${adForm.icon}`}></i></small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="ad-earning">Earning per View</label>
                  <input 
                    id="ad-earning"
                    type="number"
                    step="0.01"
                    min="0"
                    value={adForm.earning}
                    onChange={(e) => setAdForm({...adForm, earning: parseFloat(e.target.value)})}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="ad-color">Color Gradient</label>
                <select 
                  id="ad-color"
                  value={adForm.color}
                  onChange={(e) => setAdForm({...adForm, color: e.target.value})}
                  className="form-control"
                >
                  <option value="from-blue-500 to-blue-400">Blue</option>
                  <option value="from-green-500 to-green-400">Green</option>
                  <option value="from-yellow-500 to-yellow-400">Yellow</option>
                  <option value="from-red-500 to-red-400">Red</option>
                  <option value="from-purple-500 to-purple-400">Purple</option>
                  <option value="from-pink-500 to-pink-400">Pink</option>
                  <option value="from-indigo-500 to-indigo-400">Indigo</option>
                  <option value="from-orange-500 to-orange-400">Orange</option>
                  <option value="from-teal-500 to-teal-400">Teal</option>
                  <option value="from-cyan-500 to-cyan-400">Cyan</option>
                </select>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox"
                    checked={adForm.isActive}
                    onChange={(e) => setAdForm({...adForm, isActive: e.target.checked})}
                  />
                  <span>Active (visible to users)</span>
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox"
                    checked={adForm.isPremium}
                    onChange={(e) => setAdForm({...adForm, isPremium: e.target.checked})}
                  />
                  <span>Premium Ad</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowAdModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAd}
                className="btn-primary"
              >
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </button>
            </div>
          </div>
        </div>
      )}

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
