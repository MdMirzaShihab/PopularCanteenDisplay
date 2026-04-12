import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getCurrent } from '../api/tokens.api';

export const useSocketTokens = () => {
  const [currentToken, setCurrentToken] = useState(null);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [shouldAnnounce, setShouldAnnounce] = useState(false);
  const [reannounceNumber, setReannounceNumber] = useState(null);

  useEffect(() => {
    // Fetch current state on mount so the display is correct after refresh
    getCurrent()
      .then((data) => {
        setCurrentToken(data.currentToken);
        setTokenHistory(data.history || []);
      })
      .catch(() => {});

    const socket = io(import.meta.env.VITE_API_URL + '/tokens');

    socket.on('connect', () => setConnectionStatus('connected'));
    socket.on('disconnect', () => setConnectionStatus('disconnected'));
    socket.on('connect_error', () => setConnectionStatus('error'));

    socket.on('token-updated', (data) => {
      setCurrentToken(data.currentToken);
      setTokenHistory(data.history || []);
      setShouldAnnounce(!data.silent);
    });

    socket.on('token-cleared', (data) => {
      setCurrentToken(data.currentToken || null);
      setTokenHistory(data.history || []);
      setShouldAnnounce(false);
    });

    socket.on('token-reannounce', (data) => {
      setReannounceNumber(data.number);
    });

    return () => socket.disconnect();
  }, []);

  // Reset reannounce after it's consumed
  const clearReannounce = useCallback(() => setReannounceNumber(null), []);

  return { currentToken, tokenHistory, connectionStatus, shouldAnnounce, reannounceNumber, clearReannounce };
};
