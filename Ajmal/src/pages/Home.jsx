import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Clear authentication state/tokens
    navigate('/login');
  };

  return (
    <div className="home">
      <h1>Welcome to Ajmal</h1>
      <p>This is the home page of your React application.</p>
      <p>You have successfully logged in!</p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Button onClick={() => navigate('/about')}>
          Go to About
        </Button>
        <Button onClick={handleLogout} variant="secondary">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Home;
