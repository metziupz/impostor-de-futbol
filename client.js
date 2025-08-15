document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Selectores de todas las pantallas y elementos
    const screens = {
        menu: document.getElementById('menu-screen'),
        lobby: document.getElementById('lobby-screen'),
        game: document.getElementById('game-screen'),
        voting: document.getElementById('voting-screen'),
        gameOver: document.getElementById('game-over-screen')
    };
    const playerNameInput = document.getElementById('playerNameInput');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const roomCodeDisplay = document.getElementById('roomCodeDisplay');
    const playerList = document.getElementById('playerList');
    const startGameBtn = document.getElementById('startGameBtn');
    const roleInfo = document.getElementById('roleInfo');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('messages');
    const votingList = document.getElementById('voting-list');
    const votingStatusTitle = document.getElementById('voting-status-title');
    const roleInfoText = document.getElementById('role-info-text');
    const roundResultText = document.getElementById('round-result-text');
    const gameResultTitle = document.getElementById('game-result-title');
    const ejectionInfo = document.getElementById('ejection-info');
    const playAgainBtn = document.getElementById('play-again-btn');
    const timerDisplay = document.getElementById('timer-display');
    const ejectionList = document.getElementById('ejection-list');
    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    const wordForm = document.getElementById('word-form');
    const wordInput = document.getElementById('word-input');
    const wordInputContainer = document.getElementById('word-input-container');

    let currentRoomCode = '';
    let isHost = false;
    let myPlayerData = {};
    let ejectionHistory = [];
    let isMyTurn = false;
    let wordPhase = false;

    // --- Eventos de botones y formularios ---

    createRoomBtn.addEventListener('click', () => {
        const playerName = playerNameInput.value;
        if (!playerName) return showError('Debes introducir un nombre.');
        socket.emit('createRoom', { playerName });
    });

    joinRoomBtn.addEventListener('click', () => {
        const playerName = playerNameInput.value;
        const roomCode = roomCodeInput.value.toUpperCase();
        if (!playerName) return showError('Debes introducir un nombre.');
        if (!roomCode) return showError('Debes introducir un código de sala.');
        socket.emit('joinRoom', { playerName, roomCode });
    });

    startGameBtn.addEventListener('click', () => {
        socket.emit('startGame', { roomCode: currentRoomCode });
    });

    playerList.addEventListener('click', (e) => {
        if (e.target.classList.contains('kick-btn')) {
            const playerIdToKick = e.target.dataset.id;
            socket.emit('kickPlayer', { roomCode: currentRoomCode, playerIdToKick });
        }
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value;
        if (message.trim()) {
            socket.emit('sendMessage', { message, roomCode: currentRoomCode });
            chatInput.value = '';
        }
    });

    leaveRoomBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres salir de la sala?')) {
            socket.emit('leaveRoom', { roomCode: currentRoomCode });
            currentRoomCode = '';
            showScreen('menu');
        }
    });

    wordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const word = wordInput.value.trim();
        if (word && isMyTurn && wordPhase) {
            const wordCount = word.split(' ').length;
            if (wordCount > 3) {
                showError('Solo puedes escribir máximo 3 palabras.');
                return;
            }
            socket.emit('sendMessage', { message: word, roomCode: currentRoomCode });
            wordInput.value = '';
            wordInputContainer.style.display = 'none';
        }
    });

    votingList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (li && li.dataset.id) {
            votingStatusTitle.textContent = 'Voto emitido. Esperando a los demás...';
            socket.emit('castVote', { roomCode: currentRoomCode, playerIdToVote: li.dataset.id });
        }
    });

    playAgainBtn.addEventListener('click', () => {
        if (isHost) {
            socket.emit('playAgain', { roomCode: currentRoomCode });
        } else {
            // Para jugadores no-host, simplemente volver al lobby
            showScreen('lobby');
        }
    });

    // --- RECEPCIÓN DE EVENTOS DEL SERVIDOR ---

    socket.on('roomCreated', ({ roomCode }) => {
        currentRoomCode = roomCode;
        roomCodeDisplay.textContent = roomCode;
        showScreen('lobby');
    });

    socket.on('joinedLobby', ({ roomCode }) => {
        currentRoomCode = roomCode;
        roomCodeDisplay.textContent = roomCode;
        showScreen('lobby');
    });

    socket.on('updatePlayerList', ({ players, hostId }) => {
        isHost = socket.id === hostId;
        startGameBtn.style.display = isHost ? 'inline-block' : 'none';
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            let content = '';
            if (player.id === hostId) content += '👑 ';
            content += player.name;
            if (isHost && player.id !== socket.id) {
                content += `<button class="kick-btn" data-id="${player.id}">X</button>`;
            }
            li.innerHTML = content;
            playerList.appendChild(li);
        });
    });

    socket.on('newMessage', ({ senderName, message }) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = `<strong>${senderName}:</strong> ${message}`;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    socket.on('assignRole', (playerData) => {
        myPlayerData = playerData;
        showScreen('game');
        if (playerData.role === 'impostor') {
            roleInfo.textContent = '¡Eres el IMPOSTOR!';
            roleInfo.style.background = '#e74c3c';
        } else {
            roleInfo.innerHTML = `Eres un TRIPULANTE<br><small style="font-size: 18px;">Tu personaje es: ${playerData.characterName}</small>`;
            roleInfo.style.background = '#27ae60';
        }

        setTimeout(() => {
            socket.emit('requestInitialGameState', { roomCode: currentRoomCode });
        }, 4000);
    });

    socket.on('wordPhaseStart', ({ currentPlayerName, currentPlayerId, wordsSpoken }) => {
        showScreen('voting');
        wordPhase = true;
        isMyTurn = currentPlayerId === socket.id;
        
        votingStatusTitle.innerHTML = `<i class="fas fa-comments"></i> Fase de Palabras`;
        roleInfoText.innerHTML = `
            <strong>Es el turno de: ${currentPlayerName}</strong><br>
            ${isMyTurn ? '¡Es tu turno! Usa el campo de abajo para escribir.' : 'Espera tu turno para hablar.'}
        `;

        // Mostrar u ocultar el campo de entrada de palabras
        wordInputContainer.style.display = isMyTurn ? 'block' : 'none';
        if (isMyTurn) {
            setTimeout(() => wordInput.focus(), 100);
        }

        // Mostrar palabras ya dichas
        updateWordHistory(wordsSpoken);
        
        // Limpiar lista de votación
        votingList.innerHTML = '';
        
        // Ocultar timer
        document.getElementById('timer-container').style.display = 'none';
    });

    socket.on('nextPlayerTurn', ({ currentPlayerName, currentPlayerId, wordsSpoken }) => {
        isMyTurn = currentPlayerId === socket.id;
        roleInfoText.innerHTML = `
            <strong>Es el turno de: ${currentPlayerName}</strong><br>
            ${isMyTurn ? '¡Es tu turno! Usa el campo de abajo para escribir.' : 'Espera tu turno para hablar.'}
        `;
        
        // Mostrar u ocultar el campo de entrada de palabras
        wordInputContainer.style.display = isMyTurn ? 'block' : 'none';
        if (isMyTurn) {
            setTimeout(() => wordInput.focus(), 100);
        }
        
        updateWordHistory(wordsSpoken);
    });

    socket.on('startVoting', (gameState) => {
        wordPhase = false;
        isMyTurn = false;
        wordInputContainer.style.display = 'none';
        
        votingList.innerHTML = '';
        votingStatusTitle.innerHTML = `<i class="fas fa-vote-yea"></i> ¡Ahora vota por el Impostor!`;

        const amIAlive = gameState.players.find(p => p.id === socket.id)?.isAlive;
        const iHaveVoted = !!gameState.votes[socket.id];

        let roleText = `Tu rol: ${myPlayerData.role === 'impostor' ? 'Impostor' : 'Tripulante'}`;
        if (myPlayerData.characterName) roleText += ` | Tu personaje: ${myPlayerData.characterName}`;
        if (!amIAlive) roleText = 'Has sido expulsado. Eres un espectador.';
        roleInfoText.textContent = roleText;

        // Actualizar historial de expulsiones
        updateEjectionHistory();
        
        // Mostrar palabras dichas durante esta ronda
        updateWordHistory(gameState.wordsSpoken);

        gameState.players.forEach(player => {
            const li = document.createElement('li');
            const voteCount = gameState.voteCounts[player.id] || 0;

            li.innerHTML = `<span>${player.name}</span> <span class="vote-count">${voteCount}</span>`;
            if (player.isAlive) li.dataset.id = player.id;

            if (!player.isAlive) li.classList.add('ejected');

            if (!amIAlive || iHaveVoted) {
                li.style.pointerEvents = 'none';
            }
            votingList.appendChild(li);
        });
    });

    socket.on('voteUpdate', (gameState) => {
        const iHaveVoted = !!gameState.votes[socket.id];
        if (iHaveVoted) {
            votingStatusTitle.textContent = 'Voto emitido. Esperando a los demás...';
        }

        // Actualizar conteos de votos
        gameState.players.forEach((player, index) => {
            const li = votingList.children[index];
            if (li) {
                const voteCount = gameState.voteCounts[player.id] || 0;
                li.innerHTML = `<span>${player.name}</span> <span class="vote-count">${voteCount}</span>`;
            }
        });
    });

    socket.on('roundResult', ({ message, ejectedPlayer, wasImpostor }) => {
        roundResultText.textContent = message;
        
        // Agregar al historial de expulsiones si hay un jugador expulsado
        if (ejectedPlayer) {
            ejectionHistory.push({
                name: ejectedPlayer.name,
                wasImpostor: wasImpostor,
                round: ejectionHistory.length + 1
            });
        }
        
        // Limpiar timer
        if (votingTimer) {
            clearInterval(votingTimer);
            votingTimer = null;
        }
        
        setTimeout(() => {
            roundResultText.textContent = '';
        }, 4000);
    });

    // Eventos de timer eliminados - ahora usamos sistema de turnos

    socket.on('gameOver', ({ ejectedPlayerName, wasImpostor, impostorName, winner }) => {
        showScreen('gameOver');
        const impostorReveal = document.getElementById('impostor-reveal');
        
        if (winner === 'crewmates') {
            gameResultTitle.textContent = '🏆 ¡Los Tripulantes Ganan!';
            gameResultTitle.style.color = '#27ae60';
            ejectionInfo.textContent = `${ejectedPlayerName} fue expulsado. ¡Era el Impostor!`;
            impostorReveal.innerHTML = `<strong style="color: #e74c3c;">🕵️ El Impostor era: ${impostorName}</strong>`;
        } else {
            gameResultTitle.textContent = '🏆 ¡El Impostor Gana!';
            gameResultTitle.style.color = '#e74c3c';
            ejectionInfo.textContent = `${ejectedPlayerName} fue expulsado. No era el Impostor.`;
            impostorReveal.innerHTML = `<strong style="color: #e74c3c;">🕵️ El Impostor era: ${impostorName}</strong><br><small style="color: #95a5a6;">¡Logró sobrevivir hasta el final!</small>`;
        }
        
        // Mostrar botón para todos los jugadores
        playAgainBtn.style.display = 'inline-block';
        playAgainBtn.textContent = isHost ? 'Iniciar Nueva Partida' : 'Volver al Lobby';
    });

    socket.on('returnToLobby', () => {
        playAgainBtn.style.display = 'none';
        messagesContainer.innerHTML = ''; // Limpiar el chat
        ejectionHistory = []; // Limpiar historial
        wordPhase = false;
        isMyTurn = false;
        document.getElementById('timer-container').style.display = 'block';
        showScreen('lobby');
    });

    socket.on('youWereKicked', () => {
        alert('El host te ha expulsado de la sala.');
        currentRoomCode = '';
        showScreen('menu');
    });

    socket.on('error', (message) => showError(message));

    // --- Funciones auxiliares ---
    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        if (screens[screenName]) screens[screenName].classList.add('active');
    }

    function showError(message) {
        // Crear el modal de error
        const errorModal = document.createElement('div');
        errorModal.classList.add('error-modal');
        errorModal.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        
        // Agregar al body
        document.body.appendChild(errorModal);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            if (document.body.contains(errorModal)) {
                document.body.removeChild(errorModal);
            }
        }, 3000);
    }

    function updateWordHistory(wordsSpoken) {
        const timerContainer = document.getElementById('timer-container');
        if (wordsSpoken.length > 0) {
            timerContainer.innerHTML = `
                <h4 style="color: #f1c40f; margin: 0 0 10px 0;"><i class="fas fa-list"></i> Palabras dichas:</h4>
                <div style="color: #ecf0f1; font-size: 16px; line-height: 1.6;">
                    ${wordsSpoken.map(word => `<span style="background: rgba(116, 185, 255, 0.2); padding: 5px 10px; margin: 3px; border-radius: 10px; display: inline-block;"><strong>${word.playerName}:</strong> "${word.word}"</span>`).join('')}
                </div>
            `;
        } else {
            timerContainer.innerHTML = `
                <h4 style="color: #f1c40f; margin: 0;"><i class="fas fa-hourglass-start"></i> Esperando palabras...</h4>
            `;
        }
        timerContainer.style.display = 'block';
    }

    function updateEjectionHistory() {
        if (ejectionHistory.length === 0) {
            ejectionList.innerHTML = '<em>Ninguna expulsión aún...</em>';
        } else {
            ejectionList.innerHTML = ejectionHistory.map(ejection => {
                const status = ejection.wasImpostor ? 
                    '<span style="color: #e74c3c;">❌ Era el Impostor</span>' : 
                    '<span style="color: #95a5a6;">✓ No era el Impostor</span>';
                return `<div style="margin: 3px 0;">Ronda ${ejection.round}: <strong>${ejection.name}</strong> - ${status}</div>`;
            }).join('');
        }
    }
});
