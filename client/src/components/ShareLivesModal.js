import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLives } from '../contexts/LivesContext';
import { X, Gift, Heart } from 'lucide-react';

const ShareLivesModal = ({ onClose, currentUserData, otherUserId }) => {
  const { user } = useAuth();
  const { shareLives } = useLives();
  const [livesToShare, setLivesToShare] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await shareLives(otherUserId, livesToShare);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error sharing lives:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxLivesToShare = Math.min(currentUserData.currentLives, 5); // Limit to 5 lives max

  return (
    <div className="modal">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Gift size={50} color="#667eea" style={{ marginBottom: '15px' }} />
          <h2 style={{ color: '#667eea', marginBottom: '10px' }}>
            Share Noes
          </h2>
          <p style={{ color: '#666' }}>
            Give some of your noes to your partner
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
              Number of noes to share:
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <button
                type="button"
                onClick={() => setLivesToShare(Math.max(1, livesToShare - 1))}
                disabled={livesToShare <= 1}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #667eea',
                  borderRadius: '50%',
                  background: 'white',
                  color: '#667eea',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                -
              </button>
              
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#667eea',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {livesToShare}
              </div>
              
              <button
                type="button"
                onClick={() => setLivesToShare(Math.min(maxLivesToShare, livesToShare + 1))}
                disabled={livesToShare >= maxLivesToShare}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '2px solid #667eea',
                  borderRadius: '50%',
                  background: 'white',
                  color: '#667eea',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                +
              </button>
            </div>
            
            <div style={{ 
              background: '#f8f9ff', 
              padding: '15px', 
              borderRadius: '10px',
              border: '1px solid #e1e5e9'
            }}>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                <strong>Your current noes:</strong> {currentUserData.currentLives}
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                <strong>Noes after sharing:</strong> {currentUserData.currentLives - livesToShare}
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#667eea', fontSize: '0.9rem' }}>
                <strong>Partner will receive:</strong> {livesToShare} noes
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading || currentUserData.currentLives === 0}
              style={{ flex: 1 }}
            >
              {loading ? 'Sharing...' : 'Share Noes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareLivesModal; 