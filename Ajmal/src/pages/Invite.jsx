import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import apiService from '../services/api';
import './Invite.css';

const Invite = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralStats, setReferralStats] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    } else {
      fetchReferralStats();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/referrals/stats');
      setReferralStats(response.data);
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = referralStats?.referralLink || `${window.location.origin}/signup?ref=${user?.referralCode || ''}`;
  const totalReferrals = referralStats?.teamMembers || 0;
  const referralEarnings = referralStats?.totalEarnings || 0;
  const teamMembers = referralStats?.team || [];
  const bonusProgress = referralStats?.progressToBonus || 0;
  const bonusEligible = referralStats?.bonusEligible || false;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const shareViaWhatsApp = () => {
    const message = `Join me on Perbity! Earn money by watching ads. Use my referral link: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Join Perbity - Earn Money Online';
    const body = `Join me on Perbity! Earn money by watching ads and inviting friends. Use my referral link: ${referralLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) {
    return (
      <div className="invite-container">
        <header className="invite-header">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="invite-title">Invite Friends</h1>
          <div className="header-spacer"></div>
        </header>
        <main className="invite-main">
          <div className="loading">Loading...</div>
        </main>
      </div>
    );
  }

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

          {/* Bonus Progress */}
          {!bonusEligible && (
            <div className="bonus-progress-card">
              <div className="bonus-header">
                <h3>🎁 $50 Bonus Challenge</h3>
                <p>Invite 15 members to earn $50!</p>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(bonusProgress / 15) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {bonusProgress} / 15 members ({15 - bonusProgress} more to go!)
              </div>
            </div>
          )}

          {bonusEligible && (
            <div className="bonus-achieved">
              <div className="bonus-icon">🎉</div>
              <h3>Congratulations!</h3>
              <p>You've earned the $50 bonus for reaching 15 referrals!</p>
            </div>
          )}

          {/* Referral Stats */}
          <div className="referral-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>👥</div>
              <div className="stat-info">
                <span className="stat-value">{totalReferrals}</span>
                <span className="stat-label">TEAM MEMBERS</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>💰</div>
              <div className="stat-info">
                <span className="stat-value">${referralEarnings.toFixed(2)}</span>
                <span className="stat-label">EARNINGS</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>🎯</div>
              <div className="stat-info">
                <span className="stat-value">{bonusProgress}/15</span>
                <span className="stat-label">BONUS PROGRESS</span>
              </div>
            </div>
          </div>

          {/* Team Members List */}
          {teamMembers.length > 0 && (
            <div className="team-members-section">
              <h3>Your Team ({teamMembers.length})</h3>
              <div className="team-list">
                {teamMembers.map((member, index) => (
                  <div key={member._id || index} className="team-member-card">
                    <div className="member-avatar">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div className="member-email">{member.email}</div>
                      <div className="member-stats">
                        <span>Joined: {new Date(member.createdAt).toLocaleDateString()}</span>
                        {member.isActive && <span className="active-badge">Active</span>}
                      </div>
                    </div>
                    <div className="member-earnings">
                      ${(member.totalEarnings || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Referral Link Section */}
          <div className="referral-link-section">
            <h3>Your Referral Link</h3>
            <div className="referral-link-box">
              <input 
                type="text" 
                value={referralLink} 
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
                  <h4>They Register</h4>
                  <p>Friends sign up using your link</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Build Your Team</h4>
                  <p>They join your team automatically</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Earn $50 Bonus</h4>
                  <p>Get $50 when you reach 15 team members!</p>
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
