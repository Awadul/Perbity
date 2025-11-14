import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import apiService from '../services/api';
import './ViewAds.css';

const ViewAds = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [availableAds, setAvailableAds] = useState([]);
  const [remainingAds, setRemainingAds] = useState(0);
  const [viewedToday, setViewedToday] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [packageName, setPackageName] = useState('Free');
  const [clickedAdIds, setClickedAdIds] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    fetchAdsData();
  }, [isAuthenticated, user, navigate]);

  const fetchAdsData = async () => {
    try {
      setLoading(true);
      
      // Fetch ads from backend (this includes user plan info)
      const adsResponse = await apiService.get('/ads');
      
      if (adsResponse.success) {
        const { data, userPlan } = adsResponse;
        
        // Filter out already clicked ads
        const clickedIds = userPlan.clickedAdIds || [];
        const unclickedAds = data.filter(ad => !clickedIds.includes(ad._id));
        
        // Only show remaining unclicked ads up to the remaining limit
        const availableUnclickedAds = unclickedAds.slice(0, userPlan.remainingAds);
        
        // Set ads to display (only remaining/available ads)
        setAds(availableUnclickedAds);
        setAvailableAds(availableUnclickedAds);
        
        // Set user plan info
        setDailyLimit(userPlan.dailyLimit);
        setViewedToday(userPlan.clickedToday);
        setRemainingAds(userPlan.remainingAds);
        setPackageName(userPlan.name);
        setEarnings(userPlan.clickedToday * 1.00);
        setClickedAdIds(clickedIds);
      }
    } catch (error) {
      console.error('Failed to fetch ads data:', error);
      alert('Failed to load ads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async (ad) => {
    // Check if user has reached daily limit
    if (remainingAds <= 0) {
      alert('You have reached your daily ad limit! Come back tomorrow.');
      return;
    }

    try {
      // Open the ad URL in new tab immediately
      window.open(ad.url, '_blank', 'noopener,noreferrer');
      
      // Record ad click on backend
      const response = await apiService.post(`/ads/${ad._id}/click`);
      
      if (response.data.success) {
        const { earning, newBalance, adsViewedToday, remainingAds: newRemaining } = response.data.data;
        
        // Update local state
        setViewedToday(adsViewedToday);
        setRemainingAds(newRemaining);
        setEarnings(earnings + earning);
        
        // Remove the clicked ad from available ads
        setAds(prev => prev.filter(a => a._id !== ad._id));
        setAvailableAds(prev => prev.filter(a => a._id !== ad._id));
        
        // Add to clicked ads list
        setClickedAdIds(prev => [...prev, ad._id]);
        
        // Show success message
        alert(`+$${earning.toFixed(2)} earned! New balance: $${newBalance.toFixed(2)}`);
        
        // If no more ads remaining, show completion message
        if (newRemaining === 0) {
          setTimeout(() => {
            alert('Congratulations! You have viewed all available ads for today. Come back tomorrow for more!');
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to record ad click:', error);
      const errorMsg = error.response?.data?.message || 'Failed to record ad click.';
      alert(errorMsg);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="view-ads-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading ads...</p>
        </div>
      </div>
    );
  }

  // Only show limit reached if user has actually viewed ads (not 0/0 case)
  if (remainingAds === 0 && viewedToday > 0) {
    return (
      <div className="view-ads-container">
        <div className="limit-reached">
          <div className="limit-icon">🎯</div>
          <h2>Daily Limit Reached!</h2>
          <p>You've viewed all {dailyLimit} ads for today.</p>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Package:</span>
              <span className="stat-value">{packageName}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Today's Earnings:</span>
              <span className="stat-value">${earnings.toFixed(3)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ads Viewed:</span>
              <span className="stat-value">{viewedToday}/{dailyLimit}</span>
            </div>
          </div>
          <p className="comeback-msg">Come back tomorrow for more ads!</p>
          <button onClick={handleBack} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = dailyLimit > 0 ? (viewedToday / dailyLimit) * 100 : 0;

  return (
    <div className="view-ads-container">
      <div className="ads-page">
        <button className="close-btn-top" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>

        <div className="card">
          <div className="ads-header-new">
            <div>
              <h2 className="ads-title">Daily Advertisements</h2>
              <p className="ads-subtitle">Click ads to earn $1.00 per click</p>
            </div>
            <div className="progress-section">
              <span className="progress-text">{viewedToday}/{dailyLimit} completed</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
          
          {remainingAds === 0 && viewedToday > 0 ? (
            <div className="limit-message">
              <div className="limit-icon">🎯</div>
              <h2>Daily Limit Reached!</h2>
              <p>You've viewed all {dailyLimit} ads available for today.</p>
              <p className="reset-info">Your ad viewing limit resets at midnight (00:00).</p>
            </div>
          ) : availableAds.length === 0 && remainingAds > 0 ? (
            <div className="limit-message">
              <div className="limit-icon">📢</div>
              <h2>No More Ads Available</h2>
              <p>You have {remainingAds} ad{remainingAds !== 1 ? 's' : ''} remaining but all ads have been viewed.</p>
              <p className="reset-info">Check back later!</p>
            </div>
          ) : availableAds.length === 0 ? (
            <div className="limit-message">
              <div className="limit-icon">📢</div>
              <h2>No Ads Available</h2>
              <p>There are no ads in the system at the moment.</p>
            </div>
          ) : (
            <div className="ad-grid">
              {ads.map((ad) => (
                <div
                  key={ad._id}
                  className="ad-box"
                  onClick={() => handleAdClick(ad)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`ad-icon-wrapper gradient-${ad.color.replace('from-', '').replace(' to-', '-').split('-')[0]}`}>
                    <i className={`fas ${ad.icon}`}></i>
                  </div>
                  
                  <h3 className="ad-box-title">{ad.title}</h3>
                  <p className="ad-box-earning">Earn $1.00</p>
                  
                  <button className="ad-click-btn">
                    Click Ad
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAds;
