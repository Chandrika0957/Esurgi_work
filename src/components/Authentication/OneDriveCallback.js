import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OneDriveCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
    const sessionState = queryParams.get('session_state');

    if (code) {
      axios.post('/api/connect/onedrive', { code })
        .then(response => {
          console.log('OneDrive connected:', response.data);
          navigate('/settings');
        })
        .catch(error => {
          console.error('Error connecting OneDrive:', error.response ? error.response.data : error.message);
        });
    } else {
    }
  }, [navigate]);

  return <div>Processing...</div>;
};

export default OneDriveCallback;
