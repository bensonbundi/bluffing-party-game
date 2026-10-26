import { useEffect, useRef, useState, useCallback } from 'react';
import { ClientMessage, RoomState, ServerMessage } from '../types/game';
import { sound } from '../utils/sound';

export function useGameSocket() {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bluffFeedback, setBluffFeedback] = useState<{ valid: boolean; message?: string } | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedRoomCodeRef = useRef<string | null>(null);
  const savedPlayerIdRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setErrorMessage(null);

      // Attempt reconnect if we had an active session
      if (savedRoomCodeRef.current && savedPlayerIdRef.current) {
        ws.send(JSON.stringify({
          type: 'RECONNECT',
          payload: {
            roomCode: savedRoomCodeRef.current,
            playerId: savedPlayerIdRef.current
          }
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);
        switch (msg.type) {
          case 'ROOM_STATE':
            setRoomState(msg.payload);
            break;
          case 'JOIN_SUCCESS':
            setPlayerId(msg.payload.playerId);
            setIsHost(msg.payload.isHost);
            savedRoomCodeRef.current = msg.payload.roomCode;
            savedPlayerIdRef.current = msg.payload.playerId;
            setErrorMessage(null);
            break;
          case 'ERROR':
            setErrorMessage(msg.payload.message);
            break;
          case 'BLUFF_FEEDBACK':
            setBluffFeedback(msg.payload);
            break;
          case 'TICK':
            setRoomState(prev => prev ? { ...prev, timerSecondsRemaining: msg.payload.timerSecondsRemaining } : prev);
            if (msg.payload.timerSecondsRemaining <= 5 && msg.payload.timerSecondsRemaining > 0) {
              sound.playTick(true);
            }
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Attempt reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 2000);
    };

    ws.onerror = (err) => {
      console.warn('WebSocket encountered error:', err);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, [connect]);

  const sendMessage = useCallback((msg: ClientMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('Cannot send message: WebSocket is not open');
    }
  }, []);

  const createRoom = useCallback(() => {
    sendMessage({ type: 'HOST_CREATE_ROOM', payload: {} });
  }, [sendMessage]);

  const joinRoom = useCallback((roomCode: string, playerName: string, avatar: string, color: string) => {
    setErrorMessage(null);
    sendMessage({
      type: 'JOIN_ROOM',
      payload: { roomCode, playerName, avatar, color }
    });
  }, [sendMessage]);

  const updateSettings = useCallback((settings: { categories?: any[]; questionsPerRound?: number; difficultyMode?: any }) => {
    sendMessage({ type: 'UPDATE_SETTINGS', payload: settings });
  }, [sendMessage]);

  const addBot = useCallback((name?: string) => {
    sendMessage({ type: 'ADD_BOT', payload: { name } });
  }, [sendMessage]);

  const removeBot = useCallback((botId: string) => {
    sendMessage({ type: 'REMOVE_BOT', payload: { botId } });
  }, [sendMessage]);

  const addCustomQuestion = useCallback((question: any) => {
    sendMessage({ type: 'ADD_CUSTOM_QUESTION', payload: question });
  }, [sendMessage]);

  const removeCustomQuestion = useCallback((questionId: string) => {
    sendMessage({ type: 'REMOVE_CUSTOM_QUESTION', payload: { questionId } });
  }, [sendMessage]);

  const startGame = useCallback(() => {
    sendMessage({ type: 'START_GAME' });
  }, [sendMessage]);

  const submitBluff = useCallback((bluffText: string) => {
    sendMessage({ type: 'SUBMIT_BLUFF', payload: { bluffText } });
  }, [sendMessage]);

  const submitVote = useCallback((choiceId: string) => {
    sendMessage({ type: 'SUBMIT_VOTE', payload: { choiceId } });
  }, [sendMessage]);

  const nextStep = useCallback(() => {
    sendMessage({ type: 'HOST_NEXT_STEP' });
  }, [sendMessage]);

  const restartGame = useCallback(() => {
    sendMessage({ type: 'RESTART_GAME' });
  }, [sendMessage]);

  return {
    roomState,
    playerId,
    isHost,
    isConnected,
    errorMessage,
    setErrorMessage,
    bluffFeedback,
    setBluffFeedback,
    createRoom,
    joinRoom,
    updateSettings,
    addBot,
    removeBot,
    addCustomQuestion,
    removeCustomQuestion,
    startGame,
    submitBluff,
    submitVote,
    nextStep,
    restartGame
  };
}
