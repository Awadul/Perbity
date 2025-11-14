import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';
import './AdViewer.css';

const AdViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(15); // 15 seconds viewing time
  const [canClose, setCanClose] = useState(false);
  const [adData, setAdData] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Get ad data from navigation state
    const ad = location.state?.ad;
    if (!ad) {
      navigate('/view-ads');
      return;
    }
    setAdData(ad);

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.state, navigate]);

  const handleComplete = async () => {
    if (!canClose || processing) return;

    try {
      setProcessing(true);
      
      // Record ad click on backend
      const response = await apiService.post(`/ads/${adData._id}/click`);
      
      if (response.data.success) {
        const { earning, newBalance, adsViewedToday, remainingAds } = response.data.data;
        
        // Show success message
        alert(`+$${earning.toFixed(2)} earned! New balance: $${newBalance.toFixed(2)}`);
        
        // Navigate back to view ads page
        navigate('/view-ads', { 
          state: { 
            refreshData: true,
            adsViewedToday,
            remainingAds 
          } 
        });
      }
    } catch (error) {
      console.error('Failed to record ad click:', error);
      const errorMsg = error.response?.data?.message || 'Failed to record ad click.';
      alert(errorMsg);
      navigate('/view-ads');
    } finally {
      setProcessing(false);
    }
  };

  const handleSkip = () => {
    if (window.confirm('Are you sure you want to skip? You will not earn anything.')) {
      navigate('/view-ads');
    }
  };

  if (!adData) {
    return (
      <div className="ad-viewer-container">
        <div className="loading">Loading ad...</div>
      </div>
    );
  }

  return (
    <div className="ad-viewer-container">
      <div className="ad-viewer-header">
        <div className="timer-section">
          {canClose ? (
            <span className="timer-complete">✓ You can now collect your reward!</span>
          ) : (
            <span className="timer">Please wait {countdown} seconds...</span>
          )}
        </div>
        <button className="skip-btn" onClick={handleSkip}>
          Skip
        </button>
      </div>

      <div className="ad-content">
        <div className="ad-frame">
          <iframe
            src={adData.url}
            title={adData.title}
            className="ad-iframe"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="eager"
          />
        </div>

        <div className="ad-info">
          <div className="ad-details">
            <div className={`ad-icon-large gradient-${adData.color.replace('from-', '').replace(' to-', '-').split('-')[0]}`}>
              <i className={`fas ${adData.icon}`}></i>
            </div>
            <div className="ad-text">
              <h2>{adData.title}</h2>
              <p>{adData.description}</p>
            </div>
          </div>

          {canClose && (
            <button 
              className="complete-btn" 
              onClick={handleComplete}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Collect $1.00 Reward'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdViewer;
