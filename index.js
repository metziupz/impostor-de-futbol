const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// --- LISTA DE PERSONAJES ---
const characterNames = [
    'Lionel Messi', 'Cristiano Ronaldo', 'Neymar', 'Kylian Mbappé', 'Karim Benzema',
    'Robert Lewandowski', 'Luka Modrić', 'Kevin De Bruyne', 'Erling Haaland', 'Vinícius Júnior',
    'Mohamed Salah', 'Sadio Mané', 'Bruno Fernandes', 'Bernardo Silva', 'Phil Foden',
    'Pedri', 'Gavi', 'Frenkie de Jong', 'Antoine Griezmann', 'João Félix', 'David de Gea',
    'Thibaut Courtois', 'Marc-André ter Stegen', 'Ederson', 'Alisson Becker', 'Manuel Neuer',
    'Gianluigi Donnarumma', 'Gianluigi Buffon', 'Iker Casillas', 'Sergio Ramos', 'Gerard Piqué',
    'Carles Puyol', 'Jordi Alba', 'Dani Alves', 'Marcelo', 'Roberto Carlos', 'Cafu',
    'Paolo Maldini', 'Alessandro Nesta', 'Giorgio Chiellini', 'Virgil van Dijk', 'Raphaël Varane',
    'Pepe', 'Diego Godín', 'Marquinhos', 'Thiago Silva', 'Javier Mascherano', 'Sergio Busquets',
    'Xavi Hernández', 'Andrés Iniesta', 'Cesc Fàbregas', 'David Silva', 'Toni Kroos',
    'Mesut Özil', 'Paul Pogba', 'N’Golo Kanté', 'Declan Rice', 'Steven Gerrard', 'Frank Lampard',
    'Andrea Pirlo', 'Gennaro Gattuso', 'Francesco Totti', 'Alessandro Del Piero', 'Gabriel Batistuta',
    'Ángel Di María', 'Paulo Dybala', 'Gonzalo Higuaín', 'Carlos Tévez', 'Juan Román Riquelme',
    'Diego Maradona', 'Pelé', 'Ronaldo Nazário', 'Ronaldinho', 'Rivaldo', 'Kaká', 'Romário',
    'George Best', 'Bobby Charlton', 'Paul Scholes', 'Ryan Giggs', 'Wayne Rooney', 'David Beckham',
    'Rio Ferdinand', 'Peter Schmeichel', 'Eric Cantona', 'Ruud van Nistelrooy', 'Dennis Bergkamp',
    'Patrick Vieira', 'Thierry Henry', 'Sol Campbell', 'Olivier Giroud', 'Alexis Sánchez',
    'Bukayo Saka', 'Martin Ødegaard', 'Raheem Sterling', 'Reece James', 'Mason Mount',
    'Didier Drogba', 'John Terry', 'Petr Čech', 'Claude Makélélé', 'Arjen Robben', 'Eden Hazard',
    'Fernando Torres', 'Samuel Eto’o', 'Riyad Mahrez', 'Sergio Agüero', 'Vincent Kompany',
    'Mario Balotelli', 'Marco Verratti', 'Achraf Hakimi', 'Edinson Cavani', 'Zlatan Ibrahimović',
    'Fabio Cannavaro', 'Clarence Seedorf', 'Wesley Sneijder', 'Johan Cruyff', 'Hugo Sánchez',
    'Guillermo Ochoa'
];

app.use(express.static(__dirname));

const rooms = {};
const VOTING_TIME_LIMIT = 90; // segundos

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
        while (rooms[roomCode]) { roomCode = generateRoomCode(); }

        socket.join(roomCode);
        rooms[roomCode] = {
            hostId: socket.id,
            players: [{ id: socket.id, name: playerName, isAlive: true }],
            gameState: 'lobby',
            votes: {},
            impostorId: null,
            votingTimer: null,
            timeRemaining: VOTING_TIME_LIMIT,
            currentTurnIndex: 0,
            wordsSpoken: [],
            wordPhaseComplete: false
        };

        socket.emit('roomCreated', { roomCode });
        const room = rooms[roomCode];
        io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
    });

    socket.on('joinRoom', ({ playerName, roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return socket.emit('error', 'La sala no existe.');
        if (room.gameState !== 'lobby') return socket.emit('error', 'La partida ya ha comenzado.');
        const nameExists = room.players.some(player => player.name.toLowerCase() === playerName.toLowerCase());
        if (nameExists) return socket.emit('error', 'Ese nombre ya está en uso en esta sala.');

        socket.join(roomCode);
        room.players.push({ id: socket.id, name: playerName, isAlive: true });
        socket.emit('joinedLobby', { roomCode });
        io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
    });

    socket.on('kickPlayer', ({ roomCode, playerIdToKick }) => {
        const room = rooms[roomCode];
        if (!room || socket.id !== room.hostId || playerIdToKick === room.hostId) return;

        room.players = room.players.filter(player => player.id !== playerIdToKick);
        const kickedSocket = io.sockets.sockets.get(playerIdToKick);
        if (kickedSocket) {
            kickedSocket.emit('youWereKicked');
            kickedSocket.leave(roomCode);
        }
        io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
    });

    socket.on('sendMessage', ({ message, roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return; 
        const sender = room.players.find(player => player.id === socket.id);
        if (sender) {
            if (room.gameState === 'wordPhase') {
                const alivePlayers = room.players.filter(p => p.isAlive);
                const currentPlayer = alivePlayers[room.currentTurnIndex];
                if (socket.id !== currentPlayer.id) return socket.emit('error', 'No es tu turno para hablar.');
                if (message.split(' ').length > 3) return socket.emit('error', 'Solo puedes decir máximo 3 palabras.');
                if (room.wordsSpoken.some(w => w.senderId === socket.id)) return socket.emit('error', 'Ya has dicho tu palabra.');

                room.wordsSpoken.push({ senderId: socket.id, playerName: sender.name, word: message });
                
                if (room.wordsSpoken.length === alivePlayers.length) {
                    room.wordPhaseComplete = true;
                    room.gameState = 'voting';
                    room.votes = {};
                    room.timeRemaining = VOTING_TIME_LIMIT;
                    
                    io.to(roomCode).emit('startVoting', { 
                        players: room.players, 
                        votes: room.votes, 
                        voteCounts: {},
                        wordsSpoken: room.wordsSpoken
                    });
                    startVotingTimer(roomCode);

                } else {
                    room.currentTurnIndex = (room.currentTurnIndex + 1) % alivePlayers.length;
                    const nextPlayer = alivePlayers[room.currentTurnIndex];
                    
                    // Avisar a cada jugador de forma individual quién es el siguiente
                    room.players.forEach(player => {
                        io.to(player.id).emit('nextPlayerTurn', { 
                            currentPlayerName: nextPlayer.name,
                            currentPlayerId: nextPlayer.id,
                            wordsSpoken: room.wordsSpoken
                        });
                    });
                }
            } else {
                io.to(roomCode).emit('newMessage', { senderName: sender.name, message: message });
            }
        }
    });

    socket.on('leaveRoom', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room) return;
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
            const wasHost = room.hostId === socket.id;
            room.players.splice(playerIndex, 1);
            socket.leave(roomCode);
            if (room.players.length === 0) {
                delete rooms[roomCode];
            } else {
                if (wasHost) room.hostId = room.players[0].id;
                io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
            }
        }
    });

    socket.on('startGame', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || socket.id !== room.hostId) return;

        if (room.players.length < 3) {
            return socket.emit('error', 'Se necesitan al menos 3 jugadores para empezar.');
        }
        
        room.gameState = 'wordPhase';
        room.votes = {};
        room.impostorId = null;
        room.players.forEach(p => p.isAlive = true);
        room.wordsSpoken = [];
        room.wordPhaseComplete = false;

        const characterForCrewmates = characterNames[Math.floor(Math.random() * characterNames.length)];
        const impostor = room.players[Math.floor(Math.random() * room.players.length)];
        room.impostorId = impostor.id;

        const alivePlayers = room.players.filter(p => p.isAlive);
        room.currentTurnIndex = Math.floor(Math.random() * alivePlayers.length);
        const currentPlayer = alivePlayers[room.currentTurnIndex];

        room.players.forEach(player => {
            const roleData = {
                role: player.id === room.impostorId ? 'impostor' : 'crewmate',
                characterName: player.id !== room.impostorId ? characterForCrewmates : undefined
            };
            io.to(player.id).emit('assignRole', roleData);
            
            // Enviamos el estado inicial de la fase de palabras a cada jugador de forma individual
            io.to(player.id).emit('wordPhaseStart', {
                myRole: roleData,
                currentPlayerName: currentPlayer.name,
                currentPlayerId: currentPlayer.id,
                wordsSpoken: room.wordsSpoken
            });
        });
    });

    socket.on('requestInitialGameState', ({ roomCode }) => {
        // This event might be deprecated with the new flow, but we can keep it for reconnections.
        const room = rooms[roomCode];
        if (room) {
            const player = room.players.find(p => p.id === socket.id);
            if (!player) return;

            const roleData = {
                role: player.id === room.impostorId ? 'impostor' : 'crewmate',
                characterName: player.id !== room.impostorId ? room.players.find(p => p.isAlive && p.id !== room.impostorId).characterName : undefined
            };

            if (room.gameState === 'wordPhase') {
                const currentPlayer = room.players.filter(p => p.isAlive)[room.currentTurnIndex];
                io.to(socket.id).emit('wordPhaseStart', { 
                    myRole: roleData,
                    currentPlayerName: currentPlayer.name,
                    currentPlayerId: currentPlayer.id,
                    wordsSpoken: room.wordsSpoken
                });
            } else if (room.gameState === 'voting') {
                io.to(socket.id).emit('startVoting', { 
                    players: room.players, 
                    votes: room.votes, 
                    voteCounts: {},
                    wordsSpoken: room.wordsSpoken
                });
            }
        }
    });

    socket.on('castVote', ({ roomCode, playerIdToVote }) => {
        const room = rooms[roomCode];
        const voter = room.players.find(p => p.id === socket.id);
        if (!room || room.gameState !== 'voting' || !voter || !voter.isAlive || room.votes[socket.id]) return;
        
        room.votes[socket.id] = playerIdToVote;
        
        const voteCounts = {};
        Object.values(room.votes).forEach(votedId => {
            voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
        });
        
        io.to(roomCode).emit('voteUpdate', { players: room.players, votes: room.votes, voteCounts });
        
        const livingPlayers = room.players.filter(p => p.isAlive).length;
        if (Object.keys(room.votes).length === livingPlayers) {
            clearInterval(room.votingTimer);
            room.votingTimer = null;
            setTimeout(() => tallyVotes(roomCode), 2000);
        }
    });

    socket.on('playAgain', ({ roomCode }) => {
        const room = rooms[roomCode];
        if (!room || socket.id !== room.hostId) return;
        
        room.gameState = 'lobby';
        room.votes = {};
        room.impostorId = null;
        room.players.forEach(p => p.isAlive = true);
        if (room.votingTimer) {
            clearInterval(room.votingTimer);
            room.votingTimer = null;
        }
        room.timeRemaining = VOTING_TIME_LIMIT;
        room.currentTurnIndex = 0;
        room.wordsSpoken = [];
        room.wordPhaseComplete = false;
        
        io.to(roomCode).emit('returnToLobby');
        io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
    });

    socket.on('disconnect', () => {
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                const wasHost = room.hostId === socket.id;
                room.players.splice(playerIndex, 1);
                
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                } else {
                    if (wasHost) room.hostId = room.players[0].id;
                    io.to(roomCode).emit('updatePlayerList', { players: room.players, hostId: room.hostId });
                    // Additional logic might be needed to handle disconnects during game phases
                }
                break;
            }
        }
    });
});

function tallyVotes(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.gameState !== 'voting') return;

    const voteCounts = {};
    Object.values(room.votes).forEach(votedForId => {
        voteCounts[votedForId] = (voteCounts[votedForId] || 0) + 1;
    });

    let maxVotes = 0;
    let ejectedPlayerId = null;
    for (const playerId in voteCounts) {
        if (voteCounts[playerId] > maxVotes) {
            maxVotes = voteCounts[playerId];
            ejectedPlayerId = playerId;
        }
    }

    const idsWithMaxVotes = Object.keys(voteCounts).filter(id => voteCounts[id] === maxVotes);
    const impostor = room.players.find(p => p.id === room.impostorId);

    if (idsWithMaxVotes.length > 1) { // Tie
        io.to(roomCode).emit('roundResult', { 
            message: '¡Empate! Nadie fue expulsado. Iniciando ronda de palabras...',
            ejectedPlayer: null,
            wasImpostor: false
        });
        room.votes = {};
        room.timeRemaining = VOTING_TIME_LIMIT;
        setTimeout(() => {
            room.gameState = 'wordPhase';
            const alivePlayers = room.players.filter(p => p.isAlive);
            room.currentTurnIndex = Math.floor(Math.random() * alivePlayers.length);
            room.wordsSpoken = [];
            room.wordPhaseComplete = false;
            const currentPlayer = alivePlayers[room.currentTurnIndex];
            
            room.players.forEach(player => {
                io.to(player.id).emit('wordPhaseStart', { 
                    myRole: {
                        role: player.id === room.impostorId ? 'impostor' : 'crewmate',
                        characterName: player.id !== room.impostorId ? room.players.find(p => p.isAlive && p.id !== room.impostorId).characterName : undefined
                    },
                    currentPlayerName: currentPlayer.name,
                    currentPlayerId: currentPlayer.id,
                    wordsSpoken: room.wordsSpoken
                });
            });
        }, 4000);
        return;
    }

    const ejectedPlayer = room.players.find(p => p.id === ejectedPlayerId);
    if (!ejectedPlayer) { // No votes cast, timer ran out
        io.to(roomCode).emit('roundResult', { message: '¡Nadie votó! Iniciando ronda de palabras...', ejectedPlayer: null, wasImpostor: false });
        room.votes = {};
        // similar logic to a tie
        setTimeout(() => { /* restart word phase */ }, 4000);
        return;
    }

    ejectedPlayer.isAlive = false;

    const wasImpostor = ejectedPlayer.id === room.impostorId;
    io.to(roomCode).emit('roundResult', { 
        message: `${ejectedPlayer.name} fue expulsado. ${wasImpostor ? '' : 'No era el Impostor.'}`,
        ejectedPlayer: { name: ejectedPlayer.name },
        wasImpostor: wasImpostor
    });

    const livingPlayers = room.players.filter(p => p.isAlive);

    if (wasImpostor) {
        room.gameState = 'gameOver';
        io.to(roomCode).emit('gameOver', { winner: 'crewmates', ejectedPlayerName: ejectedPlayer.name, wasImpostor: true, impostorName: impostor ? impostor.name : 'Desconocido' });
    } else if (livingPlayers.length <= 2) {
        room.gameState = 'gameOver';
        io.to(roomCode).emit('gameOver', { winner: 'impostor', ejectedPlayerName: ejectedPlayer.name, wasImpostor: false, impostorName: impostor ? impostor.name : 'Desconocido' });
    } else {
        room.votes = {};
        room.timeRemaining = VOTING_TIME_LIMIT;
        setTimeout(() => {
            room.gameState = 'wordPhase';
            const alivePlayers = room.players.filter(p => p.isAlive);
            room.currentTurnIndex = Math.floor(Math.random() * alivePlayers.length);
            room.wordsSpoken = [];
            room.wordPhaseComplete = false;
            const currentPlayer = alivePlayers[room.currentTurnIndex];
            
            room.players.forEach(player => {
                io.to(player.id).emit('wordPhaseStart', { 
                    myRole: {
                        role: player.id === room.impostorId ? 'impostor' : 'crewmate',
                        characterName: player.id !== room.impostorId ? room.players.find(p => p.isAlive && p.id !== room.impostorId).characterName : undefined
                    },
                    currentPlayerName: currentPlayer.name,
                    currentPlayerId: currentPlayer.id,
                    wordsSpoken: room.wordsSpoken
                });
            });
        }, 4000);
    }
}

function startVotingTimer(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.votingTimer) return;

    room.timeRemaining = VOTING_TIME_LIMIT;

    room.votingTimer = setInterval(() => {
        room.timeRemaining--;
        io.to(roomCode).emit('timerUpdate', { timeRemaining: room.timeRemaining });
        if (room.timeRemaining <= 0) {
            clearInterval(room.votingTimer);
            room.votingTimer = null;
            io.to(roomCode).emit('timeUp');
            setTimeout(() => tallyVotes(roomCode), 2000);
        }
    }, 1000);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
