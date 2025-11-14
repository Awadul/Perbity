import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import apiService from '../services/api';
import WelcomeModal from '../components/common/WelcomeModal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  
  const [userData, setUserData] = useState({
    name: 'Guest',
    email: '',
    balance: 0.00,
    totalDeposits: 0,
    totalWithdraws: 0.00,
    referralBonus: 0,
    totalProfit: 0,
    pendingWithdraws: 0,
    teamMembers: 0,
    teamDeposit: 0
  });

  const [activePackage, setActivePackage] = useState(null);
  const [adsData, setAdsData] = useState({
    totalAdsAvailable: 0,
    dailyLimit: 0,
    viewedToday: 0,
    remaining: 0,
    earningsPerAd: 1.00, // $1.00 per ad
    todayEarnings: 0
  });

  // Check authentication and role on mount
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Redirect admin to admin dashboard
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    fetchUserData();
    
    // Show welcome modal on first visit
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user profile with active payment
      const profileResponse = await apiService.get('/users/profile');
      const userProfile = profileResponse.data;
      
      // Fetch ads data to get total available ads
      const adsResponse = await apiService.get('/ads');
      const totalAdsCount = adsResponse.data?.count || 200;
      
      setUserData({
        name: userProfile.name,
        email: userProfile.email,
        balance: userProfile.balance || 0,
        totalDeposits: userProfile.totalDeposits || 0,
        totalWithdraws: userProfile.totalWithdrawn || 0,
        referralBonus: 0,
        totalProfit: userProfile.totalWithdrawn || 0,
        pendingWithdraws: userProfile.pendingWithdraws || 0,
        teamMembers: userProfile.team?.totalMembers || 0,
        teamDeposit: userProfile.team?.teamEarnings || 0
      });

      // Set active package info
      if (userProfile.activePayment && userProfile.activePayment.plan) {
        const plan = userProfile.activePayment.plan;
        setActivePackage({
          name: plan.name,
          price: plan.price,
          dailyAdLimit: plan.dailyAdsLimit,
          dailyProfit: plan.dailyProfit || (plan.price * 0.03),
          profitPercentage: plan.profitPercentage || 3,
          duration: plan.duration || 365,
          features: plan.features || [],
          expiresAt: userProfile.activePayment.expiresAt,
          activatedAt: userProfile.activePayment.createdAt,
          isActive: userProfile.activePayment.isActive
        });

        // Calculate ads data
        const dailyLimit = plan.dailyAdsLimit;
        const viewedToday = userProfile.adsViewedToday || 0;
        const remaining = Math.max(0, dailyLimit - viewedToday);
        
        setAdsData({
          totalAdsAvailable: totalAdsCount,
          dailyLimit,
          viewedToday,
          remaining,
          earningsPerAd: 1.00,
          todayEarnings: viewedToday * 1.00
        });
      } else {
        // No active package - show message to buy plan
        setActivePackage(null);

        const viewedToday = userProfile.adsViewedToday || 0;
        setAdsData({
          totalAdsAvailable: totalAdsCount,
          dailyLimit: 0,
          viewedToday: 0,
          remaining: 0,
          earningsPerAd: 1.00,
          todayEarnings: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleViewAds = () => {
    if (adsData.remaining > 0) {
      navigate('/view-ads');
    } else {
      alert(`You've reached your daily limit of ${adsData.dailyLimit} ads. Come back tomorrow!`);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={handleCloseWelcomeModal}
        username={user?.name}
      />

      {/* Package Info Modal */}
      {showPackageModal && activePackage && (
        <div className="modal-overlay" onClick={() => setShowPackageModal(false)}>
          <div className="package-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPackageModal(false)}>×</button>
            <h2>📦 Active Package Details</h2>
            <div className="package-details">
              <div className="detail-row">
                <span>Investment Package:</span>
                <strong className="highlight-text">{activePackage.name}</strong>
              </div>
              <div className="detail-row">
                <span>Investment Amount:</span>
                <strong>${activePackage.price}</strong>
              </div>
              <div className="detail-row">
                <span>Daily Profit ({activePackage.profitPercentage || 3}%):</span>
                <strong className="highlight-text">${activePackage.dailyProfit?.toFixed(2) || (activePackage.price * 0.03).toFixed(2)}</strong>
              </div>
              <div className="detail-row">
                <span>Package Duration:</span>
                <strong>{activePackage.duration || 365} days</strong>
              </div>
              <div className="detail-row">
                <span>Ads Available Daily:</span>
                <strong>{activePackage.dailyAdLimit} ads</strong>
              </div>
              <div className="detail-row">
                <span>Viewed Today:</span>
                <strong>{adsData.viewedToday} ads</strong>
              </div>
              <div className="detail-row">
                <span>Remaining Today:</span>
                <strong className="highlight-text">{adsData.remaining} ads</strong>
              </div>
              <div className="detail-row">
                <span>Earning per Ad:</span>
                <strong>$1.00</strong>
              </div>
              <div className="detail-row">
                <span>Max Daily Earnings:</span>
                <strong className="success-text">${(activePackage.dailyAdLimit * 1.00).toFixed(2)}</strong>
              </div>
              <div className="detail-row">
                <span>Today's Earnings:</span>
                <strong className="success-text">${adsData.todayEarnings.toFixed(2)}</strong>
              </div>
              {activePackage.expiresAt && (
                <div className="detail-row">
                  <span>Package Expires:</span>
                  <strong>{new Date(activePackage.expiresAt).toLocaleDateString()}</strong>
                </div>
              )}
              <div className="detail-row">
                <span>Status:</span>
                <strong className={activePackage.isActive ? "success-text" : "error-text"}>
                  {activePackage.isActive ? '✓ Active' : '✗ Inactive'}
                </strong>
              </div>
              {activePackage.activatedAt && (
                <div className="detail-row">
                  <span>Activated On:</span>
                  <strong>{new Date(activePackage.activatedAt).toLocaleDateString()}</strong>
                </div>
              )}
              <div className="detail-row">
                <span>Total Earnings Potential:</span>
                <strong className="success-text">${(activePackage.dailyProfit * activePackage.duration).toFixed(2)}</strong>
              </div>
              <div className="detail-row">
                <span>Total Return:</span>
                <strong className="success-text">{((activePackage.dailyProfit * activePackage.duration / activePackage.price) * 100).toFixed(0)}%</strong>
              </div>
            </div>
            
            {/* Package Features */}
            {activePackage.features && activePackage.features.length > 0 && (
              <div className="package-features">
                <h3>📋 Package Features</h3>
                <ul>
                  {activePackage.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <button className="btn-primary" onClick={() => setShowPackageModal(false)}>Got It</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src="/logo.png" alt="Logo" className="dashboard-logo" />
        </div>
        <div className="header-center">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="logout-btn" aria-label="Logout">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          
          {/* Welcome Card */}
          <div className="welcome-card">
            <h2>Welcome</h2>
            <p className="username">{userData.name}</p>
          </div>

          {/* Active Package Card */}
          {activePackage ? (
            <div className="package-card" onClick={() => setShowPackageModal(true)}>
              <div className="package-header">
                <h3>💎 Investment Package</h3>
                <span className="package-badge">{activePackage.name}</span>
              </div>
              <div className="investment-summary">
                <div className="investment-row">
                  <span className="invest-label">Investment:</span>
                  <span className="invest-value">${activePackage.price}</span>
                </div>
                <div className="investment-row profit-row">
                  <span className="invest-label">Daily Profit ({activePackage.profitPercentage}%):</span>
                  <span className="invest-value profit">${activePackage.dailyProfit?.toFixed(2)}</span>
                </div>
              </div>
              <div className="package-info">
                <div className="package-stat">
                  <span>Daily Ads</span>
                  <strong>{activePackage.dailyAdLimit}</strong>
                </div>
                <div className="package-stat">
                  <span>Viewed</span>
                  <strong>{adsData.viewedToday}</strong>
                </div>
                <div className="package-stat">
                  <span>Remaining</span>
                  <strong className="highlight">{adsData.remaining}</strong>
                </div>
              </div>
              <p className="package-hint">👆 Tap for full details</p>
            </div>
          ) : (
            <div className="no-package-card" onClick={() => window.location.href = '/buy-plan'}>
              <div className="no-package-icon">📦</div>
              <h3>No Active Package</h3>
              <p>Purchase an investment package to start earning</p>
              <button className="buy-package-btn">Browse Packages</button>
            </div>
          )}

          {/* Balance Card */}
          <div className="balance-card">
            <h3>Account Balance</h3>
            <div className="balance-amount">${userData.balance.toFixed(2)}</div>
            <div className="balance-subinfo">
              <span>Today's Earnings: ${adsData.todayEarnings.toFixed(3)}</span>
            </div>
          </div>

          {/* View Ads CTA */}
          <div className="ads-cta-card">
            <h3>Watch Ads & Earn</h3>
            <p>Earn $1.00 per ad viewed</p>
            <button 
              className={`ads-btn ${adsData.remaining === 0 ? 'disabled' : ''}`}
              onClick={handleViewAds}
              disabled={adsData.remaining === 0}
            >
              {adsData.remaining > 0 
                ? `View Ads (${adsData.remaining} available)` 
                : 'Daily limit reached'}
            </button>
          </div>

          {/* Team Reward Banner */}
          <div className="team-reward-banner">
            <button className="reward-btn" onClick={() => navigate('/referrals')}>
              Team Reward
            </button>
            <div className="trophy-icon">🏆</div>
          </div>

          {/* Menu Grid */}
          <div className="menu-grid">
            <button className="menu-item" onClick={() => navigate('/buy-plan')}>
              <div className="menu-icon">💰</div>
              <span>Buy Plan</span>
            </button>
            <button className="menu-item" onClick={() => navigate('/cashout')}>
              <div className="menu-icon">💸</div>
              <span>Cashout</span>
            </button>
            <button 
              className="menu-item" 
              onClick={() => activePackage ? setShowPackageModal(true) : alert('No active package. Please purchase a plan first!')}
              title={activePackage ? 'View your active package details' : 'No active package'}
              style={!activePackage ? {opacity: 0.6} : {}}
            >
              <div className="menu-icon">📋</div>
              <span>Active Plans</span>
            </button>
            <button className="menu-item" onClick={() => navigate('/history')}>
              <div className="menu-icon">📊</div>
              <span>History</span>
            </button>
            <button className="menu-item" onClick={() => navigate('/referrals')}>
              <div className="menu-icon">👥</div>
              <span>Referrals</span>
            </button>
            {/* <button className="menu-item" onClick={() => navigate('/total-deposits')}>
              <div className="menu-icon">📈</div>
              <span>Total Deposits</span>
            </button> */}
          </div>

          {/* Account Overview */}
          {/* <div className="overview-section">
            <h3 className="section-title">Account Overview</h3>
            <div className="overview-list">
              <div className="overview-item">
                <span>Total Deposits</span>
                <span className="overview-value">${userData.totalDeposits.toFixed(2)}</span>
              </div>
              <div className="overview-item">
                <span>Total Withdraws</span>
                <span className="overview-value">${userData.totalWithdraws.toFixed(2)}</span>
              </div>
              <div className="overview-item">
                <span>Referral Bonus</span>
                <span className="overview-value">${userData.referralBonus.toFixed(2)}</span>
              </div>
              <div className="overview-item">
                <span>Total Profit</span>
                <span className="overview-value">${userData.totalProfit.toFixed(2)}</span>
              </div>
              <div className="overview-item">
                <span>Pending Withdraws</span>
                <span className="overview-value">${userData.pendingWithdraws.toFixed(2)}</span>
              </div>
              <div className="overview-item">
                <span>Team Members</span>
                <span className="overview-value">{userData.teamMembers}</span>
              </div>
              <div className="overview-item">
                <span>Team Earnings</span>
                <span className="overview-value">${userData.teamDeposit.toFixed(2)}</span>
              </div>
            </div>
          </div> */}

        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/dashboard')}>
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
        <button className="nav-item" onClick={() => navigate('/invite')}>
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

export default Dashboard;
