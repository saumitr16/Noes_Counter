import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLives } from '../contexts/LivesContext';
import { X, Heart, User } from 'lucide-react';

const RequestLifeModal = ({ onClose, currentUserData, otherUserData, otherUserId }) => {
  const { user } = useAuth();
  const { requestLife } = useLives();
  const [loading, setLoading] = useState(false);
  const [targetUser, setTargetUser] = useState('self'); // 'self' or 'partner'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const targetUserId = targetUser === 'self' ? user.id : otherUserId;
      const success = await requestLife(targetUserId);
      
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error requesting life:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTargetUserData = () => {
    return targetUser === 'self' ? currentUserData : otherUserData;
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Heart size={50} color="#667eea" style={{ marginBottom: '15px' }} />
          <h2 style={{ color: '#667eea', marginBottom: '10px' }}>
            Report No Usage
          </h2>
          <p style={{ color: '#666' }}>
            Both partners must confirm to use a no
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Target User Selection */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>
              Report no usage for:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setTargetUser('self')}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: `2px solid ${targetUser === 'self' ? '#667eea' : '#e1e5e9'}`,
                  borderRadius: '10px',
                  background: targetUser === 'self' ? '#f0f2ff' : 'white',
                  color: targetUser === 'self' ? '#667eea' : '#666',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
              >
                <User size={20} style={{ marginRight: '8px' }} />
                Yourself ({currentUserData.currentLives} noes)
              </button>
              <button
                type="button"
                onClick={() => setTargetUser('partner')}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: `2px solid ${targetUser === 'partner' ? '#667eea' : '#e1e5e9'}`,
                  borderRadius: '10px',
                  background: targetUser === 'partner' ? '#f0f2ff' : 'white',
                  color: targetUser === 'partner' ? '#667eea' : '#666',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
              >
                <User size={20} style={{ marginRight: '8px' }} />
                {otherUserData.name} ({otherUserData.currentLives} noes)
              </button>
            </div>
          </div>

          {/* Cute Guy Message */}
          <div style={{ 
            background: '#f8f9ff', 
            padding: '20px', 
            borderRadius: '15px',
            border: '2px solid #667eea',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#667eea', marginBottom: '10px' }}>
              Do you really want to say no to your cutie?
            </h3>
            <div style={{ 
              width: '150px', 
              height: '150px', 
              margin: '0 auto 15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem',
              fontWeight: 'bold'
            }}>
              😊
            </div>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
              This will send a request to your partner for confirmation
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn"
            disabled={loading || getTargetUserData().currentLives === 0}
            style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}
          >
            {loading ? 'Sending Request...' : 'Send No Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestLifeModal; 