const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Lista de Personajes (se mantiene igual)
const characterNames = [ /* ... Pega aquí tu lista completa de futbolistas ... */ ];

app.use(express.static(__dirname));

const rooms = {}; // Objeto para almacenar todas las salas activas

function generateRoomCode() {
    let code = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

io.on('connection', (socket) => {
    
    socket.on('createRoom', ({ playerName }) => {
        let roomCode = generateRoomCode();
        while (rooms[roomCode]) { // Asegurarse de que el código no exista ya
            roomCode = generateRoomCode();
        }
        
        socket.join(roomCode);
        rooms[roomCode] = {
            players: [{ id: socket.id, name: playerName }]
        };
        
        socket.emit('roomCreated', { roomCode });
        io.to(roomCode).emit('updatePlayerList', rooms[roomCode].players);
    });

    socket.on('joinRoom', ({ playerName, roomCode }) => {
        if (!rooms[roomCode]) {
            return socket.emit('error', 'La sala no existe.');
        }
        
        socket.join(roomCode);
        rooms[roomCode].players.push({ id: socket.id, name: playerName });

        socket.emit('joinedLobby', { roomCode });
        io.to(roomCode).emit('updatePlayerList', rooms[roomCode].players);
    });

    socket.on('startGame', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || room.players.length < 2) {
            return socket.emit('error', 'Se necesitan al menos 2 jugadores.');
        }

        const characterForCrewmates = characterNames[Math.floor(Math.random() * characterNames.length)];
        const impostorIndex = Math.floor(Math.random() * room.players.length);
        const impostor = room.players[impostorIndex];

        room.players.forEach(player => {
            if (player.id === impostor.id) {
                io.to(player.id).emit('assignRole', { role: 'impostor' });
            } else {
                io.to(player.id).emit('assignRole', {
                    role: 'crewmate',
                    characterName: characterForCrewmates
                });
            }
        });
    });

    socket.on('disconnect', () => {
        // Encontrar en qué sala estaba el jugador y notificar a los demás
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1); // Eliminar al jugador

                if (room.players.length === 0) {
                    delete rooms[roomCode]; // Borrar la sala si está vacía
                } else {
                    io.to(roomCode).emit('updatePlayerList', room.players); // Actualizar la lista para los que quedan
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});