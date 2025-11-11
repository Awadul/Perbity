import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Invite.css';

const Invite = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppContext();
  const [copied, setCopied] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [userData] = useState({
    username: user?.name || 'Guest',
    referralLink: 'https://infinity-earn.pro/user/signup.php?ref=awa',
    totalReferrals: 0,
    activeReferrals: 0,
    referralEarnings: 0.00,
    referredBy: 'muhammadramzan'
  });

  const copyReferralLink = () => {
    navigator.clipboard.writeText(userData.referralLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const shareViaWhatsApp = () => {
    const message = `Join me on Infinity Earn! Use my referral link: ${userData.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Join Infinity Earn';
    const body = `Join me on Infinity Earn! Use my referral link: ${userData.referralLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="invite-container">
      {/* Header */}
      <header className="invite-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="invite-title">Invite Friends</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Main Content */}
      <main className="invite-main">
        <div className="invite-content">
          
          {/* Invite Illustration */}
          <div className="invite-hero">
            <div className="hero-icon">🎁</div>
            <h2>Earn More Together!</h2>
            <p>Share your referral link and earn rewards when your friends join</p>
          </div>

          {/* Referral Stats */}
          <div className="referral-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-value">{userData.totalReferrals}</span>
                <span className="stat-label">Total Referrals</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-value">{userData.activeReferrals}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-value">PKR {userData.referralEarnings.toFixed(2)}</span>
                <span className="stat-label">Earnings</span>
              </div>
            </div>
          </div>

          {/* Referred By Badge */}
          {userData.referredBy && (
            <div className="referred-info">
              <span className="referred-label">You were referred by:</span>
              <span className="referred-name">{userData.referredBy}</span>
            </div>
          )}

          {/* Referral Link Section */}
          <div className="referral-link-section">
            <h3>Your Referral Link</h3>
            <div className="referral-link-box">
              <input 
                type="text" 
                value={userData.referralLink} 
                readOnly
                className="referral-input"
              />
              <button 
                onClick={copyReferralLink} 
                className={`copy-btn ${copied ? 'copied' : ''}`}
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="share-section">
            <h3>Share Via</h3>
            <div className="share-options">
              <button onClick={shareViaWhatsApp} className="share-btn whatsapp">
                <div className="share-icon">💬</div>
                <span>WhatsApp</span>
              </button>
              <button onClick={shareViaEmail} className="share-btn email">
                <div className="share-icon">📧</div>
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* How it Works */}
          <div className="how-it-works">
            <h3>How It Works</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Share Your Link</h4>
                  <p>Send your referral link to friends</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>They Sign Up</h4>
                  <p>Your friends create an account</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Earn Rewards</h4>
                  <p>Get bonuses when they invest</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/dashboard')}>
          <div className="nav-icon">🏠</div>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/cashout')}>
          <div className="nav-icon">💸</div>
          <span>Cashout</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/buy-plan')}>
          <div className="nav-icon">💰</div>
          <span>Buy</span>
        </button>
        <button className="nav-item active" onClick={() => navigate('/invite')}>
          <div className="nav-icon">👥</div>
          <span>Invite</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/dashboard')}>
          <div className="nav-icon">📊</div>
          <span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default Invite;
