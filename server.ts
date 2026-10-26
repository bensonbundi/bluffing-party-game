import http from 'http';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { ClientMessage } from './src/types/game';
import { GameRoom } from './server/gameEngine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory room store
const rooms = new Map<string, GameRoom>();

function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', activeRooms: rooms.size, timestamp: new Date().toISOString() });
});

app.get('/api/rooms/:code', (req, res) => {
  const code = (req.params.code || '').toUpperCase();
  const room = rooms.get(code);
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }
  res.json({
    roomCode: room.roomCode,
    playerCount: room.players.size,
    phase: room.phase
  });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomCode: string | null = null;
  let currentPlayerId: string | null = null;
  let isHostConnection = false;

  ws.on('message', async (data: Buffer | string) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'HOST_CREATE_ROOM': {
          const roomCode = generateRoomCode();
          const hostId = `host-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const room = new GameRoom(roomCode, hostId, ws);
          rooms.set(roomCode, room);

          currentRoomCode = roomCode;
          currentPlayerId = hostId;
          isHostConnection = true;

          ws.send(JSON.stringify({
            type: 'JOIN_SUCCESS',
            payload: { playerId: hostId, roomCode, isHost: true }
          }));

          room.broadcastState();
          break;
        }

        case 'JOIN_ROOM': {
          const { roomCode, playerName, avatar, color } = message.payload;
          const cleanCode = (roomCode || '').toUpperCase().trim();
          const room = rooms.get(cleanCode);

          if (!room) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: `Room "${cleanCode}" not found. Check code on the TV screen!` }
            }));
            return;
          }

          if (room.phase !== 'LOBBY') {
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: 'Game has already started in this room.' }
            }));
            return;
          }

          const playerId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

          try {
            room.addPlayer({
              id: playerId,
              name: playerName.trim() || 'Mystery Player',
              avatar: avatar || '🦊',
              color: color || '#10B981',
              ws
            });

            currentRoomCode = cleanCode;
            currentPlayerId = playerId;
            isHostConnection = false;

            ws.send(JSON.stringify({
              type: 'JOIN_SUCCESS',
              payload: { playerId, roomCode: cleanCode, isHost: false }
            }));
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Could not join room';
            ws.send(JSON.stringify({
              type: 'ERROR',
              payload: { message: errorMsg }
            }));
          }
          break;
        }

        case 'RECONNECT': {
          const { roomCode, playerId } = message.payload;
          const cleanCode = (roomCode || '').toUpperCase();
          const room = rooms.get(cleanCode);

          if (room) {
            currentRoomCode = cleanCode;
            currentPlayerId = playerId;

            if (room.hostId === playerId) {
              isHostConnection = true;
              room.hostWs = ws;
            } else {
              const player = room.players.get(playerId);
              if (player) {
                player.ws = ws;
                player.isConnected = true;
              }
            }

            ws.send(JSON.stringify({
              type: 'JOIN_SUCCESS',
              payload: { playerId, roomCode: cleanCode, isHost: isHostConnection }
            }));

            room.broadcastState();
          }
          break;
        }

        case 'UPDATE_SETTINGS': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room && isHostConnection) {
              room.updateSettings(message.payload);
            }
          }
          break;
        }

        case 'ADD_BOT': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room && isHostConnection) {
              room.addBot(message.payload?.name);
            }
          }
          break;
        }

        case 'REMOVE_BOT': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room && isHostConnection) {
              room.removeBot(message.payload.botId);
            }
          }
          break;
        }

        case 'ADD_CUSTOM_QUESTION': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room) {
              room.addCustomQuestion(message.payload);
            }
          }
          break;
        }

        case 'REMOVE_CUSTOM_QUESTION': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room && isHostConnection) {
              room.removeCustomQuestion(message.payload.questionId);
            }
          }
          break;
        }

        case 'START_GAME': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room && isHostConnection) {
              try {
                await room.startGame();
              } catch (err: unknown) {
                const errorMsg = err instanceof Error ? err.message : 'Could not start game';
                ws.send(JSON.stringify({
                  type: 'ERROR',
                  payload: { message: errorMsg }
                }));
              }
            }
          }
          break;
        }

        case 'SUBMIT_BLUFF': {
          if (currentRoomCode && currentPlayerId) {
            const room = rooms.get(currentRoomCode);
            if (room) {
              room.submitBluff(currentPlayerId, message.payload.bluffText);
            }
          }
          break;
        }

        case 'SUBMIT_VOTE': {
          if (currentRoomCode && currentPlayerId) {
            const room = rooms.get(currentRoomCode);
            if (room) {
              room.submitVote(currentPlayerId, message.payload.choiceId);
            }
          }
          break;
        }

        case 'HOST_NEXT_STEP': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room && isHostConnection) {
              if (room.phase === 'REVEAL_BLUFFS' || room.phase === 'REVEAL_TRUTH') {
                room.advanceReveal();
              } else if (room.phase === 'SCOREBOARD') {
                room.checkRoundTransition();
              }
            }
          }
          break;
        }

        case 'RESTART_GAME': {
          if (currentRoomCode) {
            const room = rooms.get(currentRoomCode);
            if (room && isHostConnection) {
              room.restartGame();
            }
          }
          break;
        }

        case 'PING': {
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomCode && currentPlayerId) {
      const room = rooms.get(currentRoomCode);
      if (room) {
        if (!isHostConnection) {
          const player = room.players.get(currentPlayerId);
          if (player) {
            player.isConnected = false;
            // If in lobby, can remove
            if (room.phase === 'LOBBY') {
              room.removePlayer(currentPlayerId);
            } else {
              room.broadcastState();
            }
          }
        }
      }
    }
  });
});

// Vite middleware in dev or static files in production
async function setupVite() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupVite().catch(console.error);
