/**
 * useSocket.js
 * Returns a stable Socket.io socket instance tied to the current auth session.
 *
 * The socket connects automatically when accessToken is present and
 * disconnects cleanly on logout or component unmount.
 *
 * Usage:
 *   const socket = useSocket();
 *   useEffect(() => {
 *     if (!socket) return;
 *     socket.on('message', handler);
 *     return () => socket.off('message', handler);
 *   }, [socket]);
 */

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? '';

export function useSocket() {
  const { accessToken } = useAuth();
  const socketRef        = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      // If we had a socket from a previous session, disconnect it
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Create a new connection with the latest token
    const s = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
    });

    socketRef.current = s;
    setSocket(s);

    s.on('connect_error', (err) => {
      console.warn('[Socket] connection error:', err.message);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [accessToken]); // reconnect whenever the token changes (e.g. after refresh)

  return socket;
}
