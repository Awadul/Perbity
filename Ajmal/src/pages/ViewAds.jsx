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
      
      if (adsResponse.data.success) {
        const { data, userPlan } = adsResponse.data;
        
        // Set all ads
        setAds(data || []);
        
        // Filter out already clicked ads and limit to remaining count
        const clickedIds = userPlan.clickedAdIds || [];
        const unclickedAds = data.filter(ad => !clickedIds.includes(ad._id));
        
        // Only show ads up to the remaining limit
        const adsToShow = unclickedAds.slice(0, userPlan.remainingAds);
        setAvailableAds(adsToShow);
        
        // Set user plan info
        setDailyLimit(userPlan.dailyLimit);
        setViewedToday(userPlan.clickedToday);
        setRemainingAds(userPlan.remainingAds);
        setPackageName(userPlan.name);
        setEarnings(userPlan.clickedToday * 0.30);
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
      // Record ad click on backend
      const response = await apiService.post(`/ads/${ad._id}/click`);
      
      if (response.data.success) {
        const { earning, newBalance, adsViewedToday, remainingAds: newRemaining } = response.data.data;
        
        // Update local state
        setViewedToday(adsViewedToday);
        setRemainingAds(newRemaining);
        setEarnings(earnings + earning);
        
        // Remove the clicked ad from available ads
        setAvailableAds(prev => prev.filter(a => a._id !== ad._id));
        
        // Add to clicked ads list
        setClickedAdIds(prev => [...prev, ad._id]);
        
        // Open the ad URL in new tab
        window.open(ad.url, '_blank', 'noopener,noreferrer');
        
        // Show success message
        alert(`+$${earning.toFixed(3)} earned! New balance: $${newBalance.toFixed(2)}`);
        
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

  return (
    <div className="view-ads-container">
      <div className="ads-page">
        <div className="ads-header">
          <button className="close-btn" onClick={handleBack}>
            <i className="fas fa-times"></i>
          </button>
          
          <h1>Available Ads</h1>
          
          <div className="ads-stats-bar">
            <div className="stat-item">
              <span className="stat-label">Package:</span>
              <span className="stat-value">{packageName}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Can Watch Today:</span>
              <span className="stat-value">{remainingAds}/{dailyLimit}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Viewed Today:</span>
              <span className="stat-value">{viewedToday}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Today's Earnings:</span>
              <span className="stat-value highlight">${earnings.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {remainingAds === 0 && viewedToday > 0 ? (
          <div className="limit-message">
            <div className="limit-icon">🎯</div>
            <h2>Daily Limit Reached!</h2>
            <p>You've viewed all {dailyLimit} ads available for today.</p>
            <p className="reset-info">Your ad viewing limit resets at midnight (00:00).</p>
            <p>Come back tomorrow for more opportunities!</p>
          </div>
        ) : availableAds.length === 0 && remainingAds > 0 ? (
          <div className="limit-message">
            <div className="limit-icon">📢</div>
            <h2>No More Ads Available</h2>
            <p>You have {remainingAds} ad{remainingAds !== 1 ? 's' : ''} remaining but all ads have been viewed.</p>
            <p className="reset-info">New ads or your limit will reset at midnight (00:00).</p>
            <p>Check back later!</p>
          </div>
        ) : availableAds.length === 0 ? (
          <div className="limit-message">
            <div className="limit-icon">📢</div>
            <h2>No Ads Available</h2>
            <p>There are no ads in the system at the moment.</p>
            <p>Please check back later!</p>
          </div>
        ) : (
          <>
            <div className="ads-instruction">
              <i className="fas fa-info-circle"></i>
              <span>Click on any ad card to visit the website and earn $0.30 per ad! Showing {availableAds.length} ad{availableAds.length !== 1 ? 's' : ''} available to you.</span>
            </div>
            
            <div className="ads-grid">
              {availableAds.map((ad) => (
                <div
                  key={ad._id}
                  className={`ad-card-item gradient-${ad.color}`}
                  onClick={() => handleAdClick(ad)}
                >
                  <div className="ad-icon">
                    <i className={`fas ${ad.icon}`}></i>
                  </div>
                  <h3 className="ad-title">{ad.title}</h3>
                  <p className="ad-description">{ad.description}</p>
                  <div className="ad-footer">
                    <span className="earn-badge">
                      <i className="fas fa-dollar-sign"></i> Earn $0.30
                    </span>
                    <i className="fas fa-external-link-alt visit-icon"></i>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewAds;
