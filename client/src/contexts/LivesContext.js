import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const LivesContext = createContext();

export const useLives = () => {
  const context = useContext(LivesContext);
  if (!context) {
    throw new Error('useLives must be used within a LivesProvider');
  }
  return context;
};

// Get initial lives data from localStorage or create default
const getInitialLivesData = () => {
  const stored = localStorage.getItem('livesData');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default data
  const defaultData = {
    user1: {
      currentLives: 5,
      maxLives: 5,
      lastRefresh: new Date().toISOString(),
      pendingRequests: [],
      sharedLives: 0,
      name: 'Saumitr'
    },
    user2: {
      currentLives: 10,
      maxLives: 10,
      lastRefresh: new Date().toISOString(),
      pendingRequests: [],
      sharedLives: 0,
      boosterActive: false,
      boosterStart: null,
      boosterNoes: 0,
      name: 'Anushka'
    }
  };
  
  localStorage.setItem('livesData', JSON.stringify(defaultData));
  return defaultData;
};

// Check and refresh monthly
const checkMonthlyRefresh = (livesData) => {
  const now = new Date();
  let updated = false;

  Object.keys(livesData).forEach(userId => {
    const lastRefresh = new Date(livesData[userId].lastRefresh);
    const monthsDiff = (now.getFullYear() - lastRefresh.getFullYear()) * 12 + 
                      (now.getMonth() - lastRefresh.getMonth());
    
    if (monthsDiff >= 1) {
      livesData[userId].currentLives = livesData[userId].maxLives;
      livesData[userId].lastRefresh = now.toISOString();
      livesData[userId].pendingRequests = [];
      updated = true;
    }
  });

  return updated;
};

// Check and lapse booster
const checkAndLapseBooster = (livesData) => {
  const boosterUser = livesData.user2;
  if (boosterUser.boosterActive && boosterUser.boosterStart) {
    const boosterStart = new Date(boosterUser.boosterStart);
    const now = new Date();
    const diffDays = (now - boosterStart) / (1000 * 60 * 60 * 24);
    if (diffDays >= 7) {
      boosterUser.currentLives = Math.max(0, boosterUser.currentLives - boosterUser.boosterNoes);
      boosterUser.boosterActive = false;
      boosterUser.boosterStart = null;
      boosterUser.boosterNoes = 0;
      return true;
    }
  }
  return false;
};

export const LivesProvider = ({ children }) => {
  const [livesData, setLivesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLivesData();
    }
  }, [user]);

  const fetchLivesData = () => {
    try {
      let data = getInitialLivesData();
      
      // Check monthly refresh
      if (checkMonthlyRefresh(data)) {
        localStorage.setItem('livesData', JSON.stringify(data));
      }
      
      // Check booster lapse
      if (checkAndLapseBooster(data)) {
        localStorage.setItem('livesData', JSON.stringify(data));
      }
      
      setLivesData(data);
    } catch (error) {
      toast.error('Failed to fetch lives data');
    } finally {
      setLoading(false);
    }
  };

  const saveLivesData = (data) => {
    localStorage.setItem('livesData', JSON.stringify(data));
    setLivesData(data);
  };

  const requestLife = async (targetUserId) => {
    try {
      const data = { ...livesData };
      const requestId = Date.now().toString();
      
      const request = {
        id: requestId,
        requesterId: user.id,
        requesterName: user.name,
        targetUserId,
        message: 'Do you really want to say no to this cute guy?',
        photoUrl: '/uploads/cute-guy.jpg',
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      data[targetUserId].pendingRequests.push(request);
      saveLivesData(data);
      
      toast.success('Life request sent!');
      return true;
    } catch (error) {
      toast.error('Failed to request life');
      return false;
    }
  };

  const approveLife = async (requestId) => {
    try {
      const data = { ...livesData };
      const userData = data[user.id];
      
      const requestIndex = userData.pendingRequests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) {
        toast.error('Request not found');
        return false;
      }

      const request = userData.pendingRequests[requestIndex];
      request.approvals = request.approvals || {};
      request.approvals[user.id] = true;
      
      const otherUserId = user.id === 'user1' ? 'user2' : 'user1';
      
      if (request.approvals[user.id] && request.approvals[otherUserId]) {
        // Both confirmed - decrement the no
        if (user.id === 'user2' && userData.boosterActive && userData.boosterNoes > 0) {
          userData.boosterNoes -= 1;
          userData.currentLives = Math.max(0, userData.currentLives - 1);
          if (userData.boosterNoes === 0) {
            userData.boosterActive = false;
            userData.boosterStart = null;
          }
        } else {
          userData.currentLives = Math.max(0, userData.currentLives - 1);
        }
        request.status = 'approved';
        userData.pendingRequests.splice(requestIndex, 1);
        toast.success('Life approved!');
      } else {
        userData.pendingRequests[requestIndex] = request;
      }

      saveLivesData(data);
      return true;
    } catch (error) {
      toast.error('Failed to approve life');
      return false;
    }
  };

  const denyLife = async (requestId) => {
    try {
      const data = { ...livesData };
      const userData = data[user.id];
      
      const requestIndex = userData.pendingRequests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) {
        toast.error('Request not found');
        return false;
      }

      userData.pendingRequests.splice(requestIndex, 1);
      saveLivesData(data);
      
      toast.success('Life request denied');
      return true;
    } catch (error) {
      toast.error('Failed to deny life');
      return false;
    }
  };

  const shareLives = async (targetUserId, livesToShare) => {
    try {
      const data = { ...livesData };
      
      if (!data[targetUserId] || !data[user.id]) {
        toast.error('User not found');
        return false;
      }

      const userData = data[user.id];
      if (userData.currentLives < livesToShare) {
        toast.error('Not enough lives to share');
        return false;
      }

      // Transfer lives
      userData.currentLives -= livesToShare;
      data[targetUserId].sharedLives += livesToShare;
      
      saveLivesData(data);
      toast.success(`${livesToShare} lives shared!`);
      return true;
    } catch (error) {
      toast.error('Failed to share lives');
      return false;
    }
  };

  const activateBooster = async () => {
    try {
      if (user.id !== 'user2') {
        toast.error('Only Anushka can activate the booster.');
        return false;
      }
      
      const data = { ...livesData };
      const boosterUser = data.user2;
      
      if (checkAndLapseBooster(data)) {
        saveLivesData(data);
      }
      
      if (boosterUser.boosterActive) {
        toast.error('Booster already active.');
        return false;
      }
      
      boosterUser.currentLives += 5;
      boosterUser.boosterActive = true;
      boosterUser.boosterStart = new Date().toISOString();
      boosterUser.boosterNoes = 5;
      
      saveLivesData(data);
      toast.success('Period Booster activated! +5 noes for 7 days.');
      return true;
    } catch (error) {
      toast.error('Failed to activate booster');
      return false;
    }
  };

  const value = {
    livesData,
    loading,
    requestLife,
    approveLife,
    denyLife,
    shareLives,
    activateBooster,
    fetchLivesData
  };

  return (
    <LivesContext.Provider value={value}>
      {children}
    </LivesContext.Provider>
  );
}; 