import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import apiService from '../services/api';
import './History.css';

const History = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    fetchHistory();
    fetchStats();
  }, [isAuthenticated, user, navigate, filter, page]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'all' 
        ? `/history?page=${page}&limit=20`
        : `/history/type/${filter}?page=${page}&limit=20`;
      
      const response = await apiService.get(endpoint);
      
      if (response.success) {
        setHistory(response.data);
        setTotalPages(response.pages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/history/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      ad_earning: '📺',
      referral_bonus: '👥',
      daily_profit: '💰',
      withdrawal: '💸',
      deposit: '💵',
      bonus: '🎁',
      refund: '↩️'
    };
    return icons[type] || '📊';
  };

  const getTypeLabel = (type) => {
    const labels = {
      ad_earning: 'Ad Earnings',
      referral_bonus: 'Referral Bonus',
      daily_profit: 'Daily Profit',
      withdrawal: 'Withdrawal',
      deposit: 'Deposit',
      bonus: 'Bonus',
      refund: 'Refund'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      ad_earning: 'blue',
      referral_bonus: 'purple',
      daily_profit: 'green',
      withdrawal: 'red',
      deposit: 'teal',
      bonus: 'orange',
      refund: 'gray'
    };
    return colors[type] || 'gray';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading && history.length === 0) {
    return (
      <div className="history-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-page">
        <div className="history-header">
          <button className="back-btn" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1>Transaction History</h1>
        </div>

        {stats && (
          <div className="stats-cards">
            <div className="stat-card earnings">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-label">Total Earnings</span>
                <span className="stat-value">${stats.totalEarnings.toFixed(2)}</span>
              </div>
            </div>
            <div className="stat-card ads">
              <div className="stat-icon">📺</div>
              <div className="stat-info">
                <span className="stat-label">Ad Earnings</span>
                <span className="stat-value">${stats.adEarnings.toFixed(2)}</span>
              </div>
            </div>
            <div className="stat-card referrals">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-label">Referral Bonus</span>
                <span className="stat-value">${stats.referralBonus.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="filter-section">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => { setFilter('all'); setPage(1); }}
            >
              All
            </button>
            <button 
              className={`filter-tab ${filter === 'ad_earning' ? 'active' : ''}`}
              onClick={() => { setFilter('ad_earning'); setPage(1); }}
            >
              📺 Ads
            </button>
            <button 
              className={`filter-tab ${filter === 'referral_bonus' ? 'active' : ''}`}
              onClick={() => { setFilter('referral_bonus'); setPage(1); }}
            >
              👥 Referrals
            </button>
            <button 
              className={`filter-tab ${filter === 'daily_profit' ? 'active' : ''}`}
              onClick={() => { setFilter('daily_profit'); setPage(1); }}
            >
              💰 Profits
            </button>
            <button 
              className={`filter-tab ${filter === 'withdrawal' ? 'active' : ''}`}
              onClick={() => { setFilter('withdrawal'); setPage(1); }}
            >
              💸 Withdrawals
            </button>
          </div>
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="no-history">
              <div className="no-history-icon">📋</div>
              <h3>No Transactions Yet</h3>
              <p>Your transaction history will appear here</p>
            </div>
          ) : (
            <>
              {history.map((record) => (
                <div key={record._id} className={`history-item ${getTypeColor(record.type)}`}>
                  <div className="history-icon">
                    {getTypeIcon(record.type)}
                  </div>
                  <div className="history-details">
                    <div className="history-main">
                      <span className="history-type">{getTypeLabel(record.type)}</span>
                      <span className={`history-amount ${record.amount >= 0 ? 'positive' : 'negative'}`}>
                        {record.amount >= 0 ? '+' : ''}{record.amount >= 0 ? '$' : '-$'}{Math.abs(record.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="history-meta">
                      <span className="history-description">{record.description}</span>
                      <span className="history-time">
                        {formatDate(record.createdAt)} • {formatTime(record.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="history-status">
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="page-info">
              Page {page} of {totalPages}
            </span>
            <button 
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
