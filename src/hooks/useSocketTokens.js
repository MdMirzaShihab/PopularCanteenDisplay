import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getCurrent } from '../api/tokens.api';
import { playAudioUrl } from '../utils/audioPlayback';

export const useSocketTokens = () => {
  const [currentToken, setCurrentToken] = useState(null);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Audio playback queue — FIFO. Arrives via `token-audio-ready` (queued by
    // the backend after TTS finishes) and `token-reannounce` (cached audio
    // for the current token). Voices play one after another in arrival order
    // so rapid token calls get their announcements spoken sequentially.
    const audioQueue = [];
    let playing = false;

    const pumpAudioQueue = () => {
      if (playing) return;
      playing = true;
      (async () => {
        while (audioQueue.length > 0) {
          const url = audioQueue.shift();
          if (url) {
            try { await playAudioUrl(url); } catch { /* continue */ }
          }
        }
        playing = false;
      })();
    };

    const enqueueAudio = (url) => {
      if (!url) return;
      audioQueue.push(url);
      pumpAudioQueue();
    };

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

    // Visual update only — audio arrives separately on `token-audio-ready`.
    socket.on('token-updated', (data) => {
      setCurrentToken(data.currentToken);
      setTokenHistory(data.history || []);
    });

    socket.on('token-cleared', (data) => {
      setCurrentToken(data.currentToken || null);
      setTokenHistory(data.history || []);
    });

    // Audio for a called token is ready — queue it for sequential playback.
    socket.on('token-audio-ready', (data) => {
      enqueueAudio(data.audioUrl);
    });

    // Reannounce uses cached audio for the current token — queue it too so
    // it slots in after anything already playing / pending.
    socket.on('token-reannounce', (data) => {
      enqueueAudio(data.audioUrl);
    });

    return () => socket.disconnect();
  }, []);

  return { currentToken, tokenHistory, connectionStatus };
};
