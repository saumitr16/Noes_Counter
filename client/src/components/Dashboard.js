import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLives } from '../contexts/LivesContext';
import { Heart, LogOut, Share2, Clock, Gift } from 'lucide-react';
import RequestLifeModal from './RequestLifeModal';
import ShareLivesModal from './ShareLivesModal';
import PendingRequests from './PendingRequests';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { livesData, loading, activateBooster } = useLives();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  if (loading || !livesData) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const currentUserData = livesData[user.id];
  const otherUserId = user.id === 'user1' ? 'user2' : 'user1';
  const otherUserData = livesData[otherUserId];

  const getNextRefreshDate = () => {
    const lastRefresh = new Date(currentUserData.lastRefresh);
    const nextRefresh = new Date(lastRefresh);
    nextRefresh.setMonth(nextRefresh.getMonth() + 1);
    return nextRefresh;
  };

  // Helper for booster badge
  const renderBoosterBadge = () => {
    if (user.id !== 'user2') return null;
    if (!currentUserData.boosterActive) {
      return (
        <button
          className="btn btn-danger"
          style={{ marginBottom: '15px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          onClick={async () => {
            await activateBooster();
          }}
        >
          <span style={{ fontSize: '1.2rem', marginRight: 8 }}>❤️</span> Activate Period Booster
        </button>
      );
    }
    // Booster is active
    const boosterStart = new Date(currentUserData.boosterStart);
    const now = new Date();
    const daysLeft = Math.max(0, 7 - Math.floor((now - boosterStart) / (1000 * 60 * 60 * 24)));
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '15px',
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#fff0f3',
          color: '#e63946',
          borderRadius: '999px',
          padding: '8px 18px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: '0 2px 8px rgba(230,57,70,0.08)',
        }}>
          <span style={{ fontSize: '1.5rem', marginRight: 8 }}>❤️</span>
          Booster: +{currentUserData.boosterNoes} noes
          <span style={{ marginLeft: 12, fontSize: '0.95rem', color: '#b71c1c' }}>
            {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
          </span>
        </span>
      </div>
    );
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Heart size={40} color="#667eea" />
            <div>
              <h1 style={{ fontSize: '2rem', color: '#667eea', margin: 0 }}>
                Welcome, {user.name}!
              </h1>
              <p style={{ color: '#666', margin: 0 }}>
                Next refresh: {getNextRefreshDate().toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <button onClick={logout} className="btn btn-secondary">
            <LogOut size={20} style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>
      </div>

      {/* Noes Display */}
      <div className="lives-grid">
        {/* Current User */}
        <div className="card">
          {renderBoosterBadge()}
          <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '20px' }}>
            Your Noes
          </h2>
          <div className="lives-display">
            {currentUserData.currentLives}
          </div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Max: {currentUserData.maxLives} | Shared: {currentUserData.sharedLives}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowRequestModal(true)}
                className="btn"
                disabled={currentUserData.currentLives === 0}
              >
                <Heart size={20} style={{ marginRight: '8px' }} />
                Have you used a no? Tell us here!!
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="btn btn-success"
                disabled={currentUserData.currentLives === 0}
              >
                <Share2 size={20} style={{ marginRight: '8px' }} />
                Share Noes
              </button>
            </div>
          </div>
        </div>

        {/* Partner */}
        <div className="card">
          <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '20px' }}>
            {otherUserData.name}'s Noes
          </h2>
          <div className="lives-display">
            {otherUserData.currentLives}
          </div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              Max: {otherUserData.maxLives} | Shared: {otherUserData.sharedLives}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowRequestModal(true)}
                className="btn"
                disabled={otherUserData.currentLives === 0}
              >
                <Heart size={20} style={{ marginRight: '8px' }} />
                Did {otherUserData.name} use a no? Say here!!
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="btn btn-success"
                disabled={currentUserData.currentLives === 0}
              >
                <Gift size={20} style={{ marginRight: '8px' }} />
                Gift Noes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="card">
        <h2 style={{ color: '#667eea', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={24} />
          Pending Requests
        </h2>
        <PendingRequests />
      </div>

      {/* Modals */}
      {showRequestModal && (
        <RequestLifeModal 
          onClose={() => setShowRequestModal(false)}
          currentUserData={currentUserData}
          otherUserData={otherUserData}
          otherUserId={otherUserId}
        />
      )}

      {showShareModal && (
        <ShareLivesModal 
          onClose={() => setShowShareModal(false)}
          currentUserData={currentUserData}
          otherUserId={otherUserId}
        />
      )}
    </div>
  );
};

export default Dashboard; 