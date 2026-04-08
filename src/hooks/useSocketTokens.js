import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocketTokens = () => {
  const [currentToken, setCurrentToken] = useState(null);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL + '/tokens');

    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('connect_error', () => setConnectionStatus('error'));

    socket.on('token-updated', (data) => {
      setCurrentToken(data.currentToken);
      setTokenHistory(data.history || []);
    });

    socket.on('token-cleared', (data) => {
      setCurrentToken(data.currentToken || null);
      setTokenHistory(data.history || []);
    });

    return () => socket.disconnect();
  }, []);

  return { currentToken, tokenHistory, connectionStatus };
};
