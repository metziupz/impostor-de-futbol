document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Pantallas
    const menuScreen = document.getElementById('menu-screen');
    const lobbyScreen = document.getElementById('lobby-screen');
    const gameScreen = document.getElementById('game-screen');

    // Elementos del Menú
    const playerNameInput = document.getElementById('playerNameInput');
    const createRoomBtn = document.getElementById('createRoomBtn');
    const roomCodeInput = document.getElementById('roomCodeInput');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    const errorMessage = document.getElementById('error-message');

    // Elementos del Lobby
    const roomCodeDisplay = document.getElementById('roomCodeDisplay');
    const playerList = document.getElementById('playerList');
    const startGameBtn = document.getElementById('startGameBtn');

    // Elementos del Juego
    const roleInfo = document.getElementById('roleInfo');

    let currentRoomCode = '';

    // --- MANEJO DE EVENTOS ---

    createRoomBtn.addEventListener('click', () => {
        const playerName = playerNameInput.value;
        if (!playerName) {
            showError('Debes introducir un nombre.');
            return;
        }
        socket.emit('createRoom', { playerName });
    });

    joinRoomBtn.addEventListener('click', () => {
        const playerName = playerNameInput.value;
        const roomCode = roomCodeInput.value.toUpperCase();
        if (!playerName) {
            showError('Debes introducir un nombre.');
            return;
        }
        if (!roomCode) {
            showError('Debes introducir un código de sala.');
            return;
        }
        socket.emit('joinRoom', { playerName, roomCode });
    });

    startGameBtn.addEventListener('click', () => {
        socket.emit('startGame', { roomCode: currentRoomCode });
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
    
    socket.on('updatePlayerList', (players) => {
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name;
            playerList.appendChild(li);
        });
    });

    socket.on('assignRole', (roleData) => {
        showScreen('game');
        if (roleData.role === 'impostor') {
            roleInfo.textContent = '¡Eres el IMPOSTOR!';
            roleInfo.style.background = '#e74c3c';
        } else {
            roleInfo.innerHTML = `Eres un TRIPULANTE<br><small style="font-size: 18px;">Tu personaje es: ${roleData.characterName}</small>`;
            roleInfo.style.background = '#27ae60';
        }
    });

    socket.on('error', (message) => {
        showError(message);
    });

    // --- FUNCIONES AUXILIARES ---

    function showScreen(screenName) {
        menuScreen.classList.remove('active');
        lobbyScreen.classList.remove('active');
        gameScreen.classList.remove('active');

        if (screenName === 'menu') menuScreen.classList.add('active');
        if (screenName === 'lobby') lobbyScreen.classList.add('active');
        if (screenName === 'game') gameScreen.classList.add('active');
    }

    function showError(message) {
        errorMessage.textContent = message;
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }
});