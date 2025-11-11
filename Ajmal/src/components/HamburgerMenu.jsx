import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './HamburgerMenu.css';

const HamburgerMenu = ({ userName, onUpdateDetails, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAppContext();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (action) => {
    setIsOpen(false);
    if (action) action();
  };

  return (
    <div className="hamburger-menu">
      <button className="hamburger-button" onClick={toggleMenu}>
        <div className={`hamburger-icon ${isOpen ? 'open' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="menu-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="menu-dropdown">
            <div className="menu-header">
              <div className="menu-user-name">{userName}</div>
              {user?.role === 'admin' && (
                <span className="admin-badge">Admin</span>
              )}
            </div>
            <div className="menu-items">
              {user?.role === 'admin' && (
                <button 
                  className="menu-item admin-item"
                  onClick={() => handleItemClick(() => navigate('/admin'))}
                >
                  <span className="menu-icon">👑</span>
                  Admin Dashboard
                </button>
              )}
              <button 
                className="menu-item"
                onClick={() => handleItemClick(() => navigate('/dashboard'))}
              >
                <span className="menu-icon">🏠</span>
                Dashboard
              </button>
              <button 
                className="menu-item"
                onClick={() => handleItemClick(() => navigate('/buy-plan'))}
              >
                <span className="menu-icon">💎</span>
                Buy Plan
              </button>
              <button 
                className="menu-item"
                onClick={() => handleItemClick(() => navigate('/cashout'))}
              >
                <span className="menu-icon">💰</span>
                Cashout
              </button>
              <button 
                className="menu-item"
                onClick={() => handleItemClick(() => navigate('/invite'))}
              >
                <span className="menu-icon">👥</span>
                Invite Friends
              </button>
              <button 
                className="menu-item"
                onClick={() => handleItemClick(onUpdateDetails)}
              >
                <span className="menu-icon">⚙️</span>
                Settings
              </button>
              <button 
                className="menu-item logout-item"
                onClick={() => handleItemClick(onLogout)}
              >
                <span className="menu-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HamburgerMenu;
