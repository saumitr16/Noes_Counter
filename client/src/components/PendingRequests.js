import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLives } from '../contexts/LivesContext';
import { Check, X, Clock, User, MessageCircle, Image } from 'lucide-react';

const PendingRequests = () => {
  const { user } = useAuth();
  const { livesData, approveLife, denyLife } = useLives();

  if (!livesData) return null;

  const currentUserData = livesData[user.id];
  const pendingRequests = currentUserData?.pendingRequests || [];

  if (pendingRequests.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#666',
        background: '#f8f9ff',
        borderRadius: '10px',
        border: '1px dashed #667eea'
      }}>
        <Clock size={40} color="#667eea" style={{ marginBottom: '15px' }} />
        <p style={{ fontSize: '1.1rem', margin: 0 }}>
          No pending no requests
        </p>
        <p style={{ fontSize: '0.9rem', margin: '5px 0 0 0' }}>
          When someone reports a no, it will appear here
        </p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleApprove = async (requestId) => {
    await approveLife(requestId);
  };

  const handleDeny = async (requestId) => {
    await denyLife(requestId);
  };

  return (
    <div>
      <h2 style={{ color: '#667eea', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Clock size={24} />
        Pending No Requests
      </h2>
      {pendingRequests.map((request) => (
        <div
          key={request.id}
          style={{
            background: '#f8f9ff',
            border: '1px solid #e1e5e9',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '15px',
            position: 'relative'
          }}
        >
          {/* Request Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '15px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} color="#667eea" />
              <div>
                <strong style={{ color: '#333' }}>
                  {request.requesterName}
                </strong>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {formatTime(request.timestamp)}
                </div>
              </div>
            </div>
            
            <div style={{ 
              background: '#667eea', 
              color: 'white', 
              padding: '4px 12px', 
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              PENDING
            </div>
          </div>

          {/* Message */}
          {request.message && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <MessageCircle size={16} color="#667eea" style={{ marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: '#333', lineHeight: '1.5' }}>
                    {request.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cute Guy Image */}
          {request.photoUrl && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Image size={16} color="#667eea" style={{ marginTop: '2px' }} />
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    margin: '0 auto',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: 'bold'
                  }}>
                    😊
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => handleDeny(request.id)}
              className="btn btn-danger"
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <X size={16} />
              Deny
            </button>
            <button
              onClick={() => handleApprove(request.id)}
              className="btn btn-success"
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Check size={16} />
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingRequests; 