import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(username, password);
    if (success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Heart size={60} color="#667eea" style={{ marginBottom: '20px' }} />
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              color: '#667eea',
              marginBottom: '10px'
            }}>
              Noes Counter
            </h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Secure noes management for partners
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <User 
                  size={20} 
                  color="#667eea" 
                  style={{ 
                    position: 'absolute', 
                    left: '15px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 1
                  }} 
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '45px' }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={20} 
                  color="#667eea" 
                  style={{ 
                    position: 'absolute', 
                    left: '15px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 1
                  }} 
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '45px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={loading}
              style={{ width: '100%', fontSize: '1.1rem', padding: '15px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* <div style={{ 
            marginTop: '30px', 
            textAlign: 'center', 
            color: '#666',
            fontSize: '0.9rem'
          }}>
            <p>Default credentials:</p>
            <p><strong>Saumitr:</strong> username=saumitr, password=password1</p>
            <p><strong>Anushka:</strong> username=anushka, password=password2</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login; 