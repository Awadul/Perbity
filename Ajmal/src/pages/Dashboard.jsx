import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout, isAuthenticated } from '../services/auth';
import WelcomeModal from '../components/common/WelcomeModal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  const [userData, setUserData] = useState({
    username: 'Guest',
    balance: 0.00,
    referredBy: 'muhammadramzan',
    promoReward: 0.00,
    totalDeposits: 0,
    totalWithdraws: 0.00,
    referralBonus: 0,
    totalProfit: 0,
    pendingWithdraws: 0,
    teamMembers: 0,
    teamDeposit: 0
  });

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
    } else {
      const user = getCurrentUser();
      setCurrentUser(user);
      setUserData(prev => ({
        ...prev,
        username: user?.username || 'Guest'
      }));
      setIsLoading(false);
      
      // Show welcome modal on first visit
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
        sessionStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [navigate]);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
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
        username={currentUser?.username}
      />

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
            <p className="username">{userData.username}</p>
          </div>

          {/* Balance Card */}
          <div className="balance-card">
            <h3>Account Balance</h3>
            <div className="balance-amount">PKR {userData.balance.toFixed(2)}</div>
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
            <button className="menu-item" onClick={() => navigate('/active-plans')}>
              <div className="menu-icon">📋</div>
              <span>Active Plans</span>
            </button>
            <button className="menu-item" onClick={() => navigate('/history')}>
              <div className="menu-icon">📊</div>
              <span>History</span>
            </button>
            <button className="menu-item" onClick={() => navigate('/earnings')}>
              <div className="menu-icon">💵</div>
              <span>Earnings</span>
            </button>
            <button className="menu-item" onClick={() => navigate('/referrals')}>
              <div className="menu-icon">👥</div>
              <span>Referrals</span>
            </button>
            <button className="menu-item" onClick={() => navigate('/total-deposits')}>
              <div className="menu-icon">📈</div>
              <span>Total Deposits</span>
            </button>
            <button className="menu-item" onClick={() => navigate('/total-withdraws')}>
              <div className="menu-icon">📉</div>
              <span>Total Withdraws</span>
            </button>
          </div>

          {/* Shortcuts */}
          <div className="shortcuts-section">
            <h3 className="section-title">Quick Links</h3>
            <div className="shortcuts-grid">
              <a href="https://wa.me/+923296830617" target="_blank" rel="noopener noreferrer" className="shortcut-item">
                <div className="shortcut-icon">💬</div>
                <span>Admin</span>
              </a>
              <a href="https://whatsapp.com/channel/0029Vb6f8YMKbYMFUyUzmL2Y" target="_blank" rel="noopener noreferrer" className="shortcut-item">
                <div className="shortcut-icon">👥</div>
                <span>Group</span>
              </a>
              <a href="https://whatsapp.com/channel/0029Vb6f8YMKbYMFUyUzmL2Y" target="_blank" rel="noopener noreferrer" className="shortcut-item">
                <div className="shortcut-icon">📢</div>
                <span>Channel</span>
              </a>
              <button className="shortcut-item" onClick={() => alert('SECP Info')}>
                <div className="shortcut-icon">🛡️</div>
                <span>SECP</span>
              </button>
              <button className="shortcut-item" onClick={() => alert('FBR Info')}>
                <div className="shortcut-icon">📑</div>
                <span>FBR</span>
              </button>
              <button className="shortcut-item" onClick={handleLogout}>
                <div className="shortcut-icon">🚪</div>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Account Overview */}
          <div className="overview-section">
            <h3 className="section-title">Account Overview</h3>
            <div className="overview-list">
              <div className="overview-item">
                <span>Promo Code Reward</span>
                <span className="overview-value">PKR {userData.promoReward.toFixed(2)}</span>
              </div>
              <div className="overview-item">
                <span>Total Deposits</span>
                <span className="overview-value">PKR {userData.totalDeposits}</span>
              </div>
              <div className="overview-item">
                <span>Total Withdraws</span>
                <span className="overview-value">PKR {userData.totalWithdraws.toFixed(2)}</span>
              </div>
              <div className="overview-item">
                <span>Referral Bonus</span>
                <span className="overview-value">PKR {userData.referralBonus}</span>
              </div>
              <div className="overview-item">
                <span>Total Profit</span>
                <span className="overview-value">PKR {userData.totalProfit}</span>
              </div>
              <div className="overview-item">
                <span>Pending Withdraws</span>
                <span className="overview-value">PKR {userData.pendingWithdraws}</span>
              </div>
              <div className="overview-item">
                <span>Team Members</span>
                <span className="overview-value">{userData.teamMembers}</span>
              </div>
              <div className="overview-item">
                <span>Team Deposit</span>
                <span className="overview-value">PKR {userData.teamDeposit}</span>
              </div>
            </div>
          </div>

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
