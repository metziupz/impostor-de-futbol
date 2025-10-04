document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // --- Selectores de Elementos ---
    const screens = {
        menu: document.getElementById('menu-screen'),
        lobby: document.getElementById('lobby-screen'),
        game: document.getElementById('game-screen'),
        voting: document.getElementById('voting-screen'),
        gameOver: document.getElementById('game-over-screen'),
        offlineSetup: document.getElementById('offline-setup-screen'),
        offlineReveal: document.getElementById('offline-reveal-screen')
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
    const ejectionList = document.getElementById('ejection-list');
    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    const wordForm = document.getElementById('word-form');
    const wordInput = document.getElementById('word-input');
    const wordInputContainer = document.getElementById('word-input-container');
    const errorModalContainer = document.getElementById('error-modal-container');
    
    // Selectores para Opciones Online
    const optionsBtn = document.getElementById('optionsBtn');
    const optionsModal = document.getElementById('options-modal');
    const saveOptionsBtn = document.getElementById('save-options-btn');
    const closeOptionsBtn = document.getElementById('close-options-btn');
    const onlineGameModeSelect = document.getElementById('online-game-mode-select');
    const impostorCountSelector = document.querySelector('.impostor-count-selector');
    const playerRequirementNotice = document.getElementById('player-requirement-notice');
    const votingTimeSelector = document.querySelector('.voting-time-selector');
    const onlineCluesOptionGroup = document.getElementById('online-clues-option-group');
    const cluesEnabledCheckbox = document.getElementById('clues-enabled-checkbox');
    const clueProbabilityGroup = document.getElementById('clue-probability-group');
    const clueProbabilitySlider = document.getElementById('clue-probability-slider');
    const probabilityValue = document.getElementById('probability-value');
    const onlineConfusedOptionGroup = document.getElementById('online-confused-option-group');
    const confusedCrewmateSlider = document.getElementById('confused-crewmate-slider');
    const confusedCrewmateValue = document.getElementById('confused-crewmate-value');
    const gameOptionsDisplay = document.getElementById('game-options-display');

    // --- Selectores para MODO PRESENCIAL ---
    const offlineModeBtn = document.getElementById('offlineModeBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    const offlinePlayerCountSelect = document.getElementById('offlinePlayerCount');
    const offlinePlayerNamesContainer = document.getElementById('offline-player-names-container');
    const startOfflineGameBtn = document.getElementById('startOfflineGameBtn');
    const offlinePassDeviceDiv = document.getElementById('offline-pass-device');
    const offlinePlayerNameTurn = document.getElementById('offline-player-name-turn');
    const offlineShowRoleBtn = document.getElementById('offline-show-role-btn');
    const offlineRoleRevealDiv = document.getElementById('offline-role-reveal');
    const offlineCountdown = document.getElementById('offline-countdown');
    const offlineRoleContent = document.getElementById('offline-role-content');
    const offlinePlayerNameReveal = document.getElementById('offline-player-name-reveal');
    const offlineRoleInfo = document.getElementById('offline-role-info');
    const offlineHideRoleBtn = document.getElementById('offline-hide-role-btn');
    // Selectores para Opciones Offline
    const offlineGameModeSelect = document.getElementById('offline-game-mode-select');
    const offlineImpostorCountSelector = document.getElementById('offline-impostor-count-selector');
    const offlinePlayerRequirementNotice = document.getElementById('offline-player-requirement-notice');
    const offlineCluesOptionGroup = document.getElementById('offline-clues-option-group');
    const offlineCluesEnabledCheckbox = document.getElementById('offline-clues-enabled-checkbox');
    const offlineClueProbabilityGroup = document.getElementById('offline-clue-probability-group');
    const offlineClueProbabilitySlider = document.getElementById('offline-clue-probability-slider');
    const offlineProbabilityValue = document.getElementById('offline-probability-value');
    const offlineConfusedOptionGroup = document.getElementById('offline-confused-option-group');
    const offlineConfusedCrewmateSlider = document.getElementById('offline-confused-crewmate-slider');
    const offlineConfusedCrewmateValue = document.getElementById('offline-confused-crewmate-value');

    let currentRoomCode = '';
    let isHost = false;
    let myPlayerData = {};
    let localGameOptions = { gameMode: 'playersOnly', impostorCount: 1, votingTime: 90, cluesEnabled: false, clueProbability: 5, confusedCrewmateProbability: 0 };
    let localOfflineGameOptions = { gameMode: 'playersOnly', impostorCount: 1, cluesEnabled: false, clueProbability: 5, confusedCrewmateProbability: 0 };
    let playerCount = 0;
    let ejectionHistory = [];
    let isMyTurn = false;
    let wordPhase = false;
    let offlineGame = {};

    // --- Función auxiliar showScreen (MODIFICADA) ---
    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        }

        // Lógica centralizada para mostrar/ocultar el botón
        if (screenName === 'menu') {
            offlineModeBtn.style.display = 'block';
        } else {
            offlineModeBtn.style.display = 'none';
        }
    }

    // --- Eventos de Botones y Formularios (Modo Online) ---
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
            window.location.reload();
        }
    });

    wordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const word = wordInput.value.trim();
        if (word && isMyTurn && wordPhase) {
            const wordCount = word.split(' ').filter(w => w.length > 0).length;
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
        }
    });

    // --- Lógica del Modal de Opciones (Online) ---
    optionsBtn.addEventListener('click', () => optionsModal.style.display = 'flex');
    closeOptionsBtn.addEventListener('click', () => optionsModal.style.display = 'none');
    saveOptionsBtn.addEventListener('click', () => {
        socket.emit('updateGameOptions', { roomCode: currentRoomCode, options: localGameOptions });
        optionsModal.style.display = 'none';
    });
    
    onlineGameModeSelect.addEventListener('change', () => {
        localGameOptions.gameMode = onlineGameModeSelect.value;
        updateOptionsUI();
    });

    function setupVotingTimeButtons() {
        votingTimeSelector.innerHTML = '';
        [60, 90, 120, 150].forEach(time => {
            const btn = document.createElement('button');
            btn.textContent = `${time}s`;
            btn.dataset.time = time;
            votingTimeSelector.appendChild(btn);
        });
    }

    votingTimeSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            localGameOptions.votingTime = parseInt(e.target.dataset.time, 10);
            updateOptionsUI();
        }
    });
    
    function setupImpostorButtons(maxImpostors) {
        impostorCountSelector.innerHTML = '';
        for (let i = 1; i <= maxImpostors; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.dataset.count = i;
            impostorCountSelector.appendChild(btn);
        }
    }

    impostorCountSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            localGameOptions.impostorCount = parseInt(e.target.dataset.count, 10);
            updateOptionsUI();
        }
    });

    cluesEnabledCheckbox.addEventListener('change', () => {
        localGameOptions.cluesEnabled = cluesEnabledCheckbox.checked;
        updateOptionsUI();
    });

    clueProbabilitySlider.addEventListener('input', () => {
        const value = clueProbabilitySlider.value;
        localGameOptions.clueProbability = parseInt(value, 10);
        probabilityValue.textContent = `${value}%`;
    });

    confusedCrewmateSlider.addEventListener('input', () => {
        const value = parseInt(confusedCrewmateSlider.value, 10);
        localGameOptions.confusedCrewmateProbability = value;
        confusedCrewmateValue.textContent = value === 0 ? '0% (Desactivado)' : `${value}%`;
    });

    function updateOptionsUI() {
        onlineGameModeSelect.value = localGameOptions.gameMode;
        
        impostorCountSelector.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.count) === localGameOptions.impostorCount);
        });
        
        votingTimeSelector.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.time) === localGameOptions.votingTime);
        });

        let requiredPlayers = 3;
        if (localGameOptions.impostorCount === 2) requiredPlayers = 7;
        if (localGameOptions.impostorCount === 3) requiredPlayers = 9;

        if (playerCount < requiredPlayers) {
            playerRequirementNotice.textContent = `Se necesitan ${requiredPlayers} jugadores para ${localGameOptions.impostorCount} impostor(es).`;
            playerRequirementNotice.style.display = 'block';
        } else {
            playerRequirementNotice.style.display = 'none';
        }

        if (isHost) {
            startGameBtn.disabled = playerCount < requiredPlayers;
        }

        const isClubsOnly = localGameOptions.gameMode === 'clubsOnly';
        if(isClubsOnly) {
            onlineCluesOptionGroup.setAttribute('disabled', 'true');
            onlineConfusedOptionGroup.setAttribute('disabled', 'true');
        } else {
            onlineCluesOptionGroup.removeAttribute('disabled');
            onlineConfusedOptionGroup.removeAttribute('disabled');
        }

        cluesEnabledCheckbox.checked = localGameOptions.cluesEnabled;
        clueProbabilityGroup.style.display = localGameOptions.cluesEnabled && !isClubsOnly ? 'block' : 'none';
        clueProbabilitySlider.value = localGameOptions.clueProbability;
        probabilityValue.textContent = `${localGameOptions.clueProbability}%`;

        const confValue = localGameOptions.confusedCrewmateProbability;
        confusedCrewmateSlider.value = confValue;
        confusedCrewmateValue.textContent = confValue === 0 ? '0% (Desactivado)' : `${confValue}%`;
    }

    // --- RECEPCIÓN DE EVENTOS DEL SERVIDOR (Modo Online) ---
    socket.on('roomCreated', ({ roomCode }) => {
        currentRoomCode = roomCode;
        roomCodeDisplay.textContent = roomCode;
        setupVotingTimeButtons();
        showScreen('lobby');
    });

    socket.on('joinedLobby', ({ roomCode }) => {
        currentRoomCode = roomCode;
        roomCodeDisplay.textContent = roomCode;
        setupVotingTimeButtons();
        showScreen('lobby');
    });

    socket.on('updatePlayerList', ({ players, hostId }) => {
        playerCount = players.length;
        isHost = socket.id === hostId;
        
        startGameBtn.style.display = isHost ? 'inline-block' : 'none';
        optionsBtn.style.display = isHost ? 'inline-block' : 'none';

        let maxImpostors = 1;
        if (playerCount >= 9) maxImpostors = 3;
        else if (playerCount >= 7) maxImpostors = 2;
        
        setupImpostorButtons(maxImpostors);
        if (localGameOptions.impostorCount > maxImpostors) {
            localGameOptions.impostorCount = maxImpostors;
            if(isHost) {
                 socket.emit('updateGameOptions', { roomCode: currentRoomCode, options: localGameOptions });
            }
        }
        updateOptionsUI();
        
        playerList.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.innerHTML = `${player.id === hostId ? '👑 ' : ''}${player.name}${isHost && player.id !== socket.id ? `<button class="kick-btn" data-id="${player.id}">X</button>` : ''}`;
            playerList.appendChild(li);
        });
    });

    socket.on('gameOptionsUpdated', (options) => {
        localGameOptions = options;
        updateOptionsUI();
        let modeText = 'Jugadores + Clubes';
        if(options.gameMode === 'playersOnly') modeText = 'Solo Jugadores';
        if(options.gameMode === 'clubsOnly') modeText = 'Solo Clubes';
        
        gameOptionsDisplay.textContent = `Impostores: ${options.impostorCount} | Modo: ${modeText}`;
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
        ejectionHistory = [];
        showScreen('game');
        
        let roleHTML = `Eres un ${playerData.role === 'impostor' ? '<strong>IMPOSTOR</strong>' : '<strong>TRIPULANTE</strong>'}`;
        if (playerData.characterName) {
            roleHTML += `<br><small style="font-size: 18px;">El personaje es: ${playerData.characterName}</small>`;
        }
        if (playerData.role === 'impostor' && playerData.clue) {
            roleHTML += `<br><small style="font-size: 18px; color: var(--color-warning);">Pista: ${playerData.clue}</small>`;
        }
        roleInfo.innerHTML = roleHTML;
    });

    socket.on('wordPhaseStart', ({ currentPlayerName, currentPlayerId, wordsSpoken }) => {
        setTimeout(() => {
            showScreen('voting');
            wordPhase = true;
            isMyTurn = currentPlayerId === socket.id;
            
            votingStatusTitle.innerHTML = `<i class="fas fa-comments"></i> Fase de Palabras`;
            
            let roleText = `Tu rol: <strong>${myPlayerData.role === 'impostor' ? 'Impostor' : 'Tripulante'}</strong>`;
            if (myPlayerData.role === 'crewmate' && myPlayerData.characterName) {
                 roleText += ` | El personaje: <strong>${myPlayerData.characterName}</strong>`;
            }
            if (myPlayerData.role === 'impostor' && myPlayerData.clue) {
                roleText += ` <span style="color: var(--color-warning); font-style: italic;">(Pista: ${myPlayerData.clue})</span>`;
            }
            roleInfoText.innerHTML = roleText;

            const turnInfo = document.getElementById('timer-container');
            turnInfo.innerHTML = `<h4 style="color: #f1c40f; margin: 0;">Es el turno de: <strong style="color: #fff;">${currentPlayerName}</strong></h4>`;

            wordInputContainer.style.display = isMyTurn ? 'block' : 'none';
            if (isMyTurn) setTimeout(() => wordInput.focus(), 100);

            updateWordHistory(wordsSpoken);
            votingList.innerHTML = '';
        }, 4000);
    });

    socket.on('nextPlayerTurn', ({ currentPlayerName, currentPlayerId, wordsSpoken }) => {
        isMyTurn = currentPlayerId === socket.id;
        
        const turnInfo = document.getElementById('timer-container');
        turnInfo.innerHTML = `<h4 style="color: #f1c40f; margin: 0;">Es el turno de: <strong style="color: #fff;">${currentPlayerName}</strong></h4>`;
        
        wordInputContainer.style.display = isMyTurn ? 'block' : 'none';
        if (isMyTurn) setTimeout(() => wordInput.focus(), 100);
        
        updateWordHistory(wordsSpoken);
    });

    socket.on('startVoting', (gameState) => {
        wordPhase = false;
        isMyTurn = false;
        wordInputContainer.style.display = 'none';
        
        votingList.innerHTML = '';
        votingStatusTitle.innerHTML = `<i class="fas fa-vote-yea"></i> ¡Ahora vota por el Impostor!`;

        const amIAlive = gameState.players.find(p => p.id === socket.id)?.isAlive;

        let roleText = `Tu rol: <strong>${myPlayerData.role === 'impostor' ? 'Impostor' : 'Tripulante'}</strong>`;
        if (myPlayerData.role === 'crewmate' && myPlayerData.characterName) {
            roleText += ` | El personaje: <strong>${myPlayerData.characterName}</strong>`;
        }
        if (myPlayerData.role === 'impostor' && myPlayerData.clue) {
            roleText += ` <span style="color: var(--color-warning); font-style: italic;">(Pista: ${myPlayerData.clue})</span>`;
        }
        if (!amIAlive) {
            roleText = 'Has sido expulsado. Eres un espectador.';
        }
        roleInfoText.innerHTML = roleText;

        updateEjectionHistory();
        updateWordHistory(gameState.wordsSpoken);

        gameState.players.forEach(player => {
            const li = document.createElement('li');
            const voteCount = gameState.voteCounts[player.id] || 0;

            li.innerHTML = `<span>${player.name}</span> <span class="vote-count">${voteCount}</span>`;
            if (player.isAlive && amIAlive) li.dataset.id = player.id;
            if (!player.isAlive) li.classList.add('ejected');
            if (!amIAlive || !!gameState.votes[socket.id]) li.style.pointerEvents = 'none';
            
            votingList.appendChild(li);
        });
    });

    socket.on('voteUpdate', ({ voteCounts }) => {
        votingList.querySelectorAll('li').forEach(li => {
            const voteCountSpan = li.querySelector('.vote-count');
            const playerId = li.dataset.id;
            if (voteCountSpan) {
                voteCountSpan.textContent = voteCounts[playerId] || 0;
            }
        });
    });

    socket.on('timerUpdate', ({ timeRemaining }) => {
        const timerContainer = document.getElementById('timer-container');
        timerContainer.style.display = 'block';
        timerContainer.innerHTML = `<div id="timer-display">${timeRemaining}</div>`;
    });

    socket.on('timeUp', () => {
        votingStatusTitle.textContent = '¡Se acabó el tiempo!';
    });

    socket.on('roundResult', ({ message, ejectedPlayer, wasImpostor }) => {
        roundResultText.textContent = message;
        if (ejectedPlayer) {
            ejectionHistory.push({
                name: ejectedPlayer.name,
                wasImpostor: wasImpostor,
                round: ejectionHistory.length + 1
            });
        }
        setTimeout(() => {
            roundResultText.textContent = '';
        }, 4000);
    });

    socket.on('gameOver', ({ ejectedPlayerName, impostorName, winner }) => {
        showScreen('gameOver');
        const impostorReveal = document.getElementById('impostor-reveal');
        
        if (winner === 'crewmates') {
            gameResultTitle.textContent = '🏆 ¡Los Tripulantes Ganan!';
            ejectionInfo.textContent = ejectedPlayerName ? `${ejectedPlayerName} fue expulsado. ¡Era el último Impostor!` : `¡Todos los impostores fueron descubiertos!`;
        } else {
            gameResultTitle.textContent = '🏆 ¡Los Impostores Ganan!';
            if(ejectedPlayerName) {
                ejectionInfo.textContent = `${ejectedPlayerName} fue expulsado, pero no era el único Impostor.`;
            } else {
                 ejectionInfo.textContent = 'Los tripulantes no lograron descubrir a los impostores.';
            }
        }
        impostorReveal.innerHTML = `<strong style="color: #e74c3c;">🕵️ El/Los Impostor(es) era(n): ${impostorName}</strong>`;
        
        playAgainBtn.style.display = 'inline-block';
        playAgainBtn.textContent = isHost ? 'Iniciar Nueva Partida' : 'Esperando al Host...';
    });

    socket.on('returnToLobby', () => {
        playAgainBtn.style.display = 'none';
        messagesContainer.innerHTML = '';
        ejectionHistory = [];
        showScreen('lobby');
    });

    socket.on('youWereKicked', () => {
        alert('El host te ha expulsado de la sala.');
        window.location.reload();
    });

    socket.on('error', (message) => showError(message));

    // --- LÓGICA PARA MODO PRESENCIAL ---
    
    offlineModeBtn.addEventListener('click', () => {
        showScreen('offlineSetup');
        generatePlayerNameInputs(parseInt(offlinePlayerCountSelect.value, 10));
        updateOfflineOptionsUI();
    });

    backToMenuBtn.addEventListener('click', () => {
        showScreen('menu');
    });

    offlinePlayerCountSelect.addEventListener('change', () => {
        const count = parseInt(offlinePlayerCountSelect.value, 10);
        generatePlayerNameInputs(count);
        updateOfflineOptionsUI();
    });
    
    offlineGameModeSelect.addEventListener('change', () => {
        localOfflineGameOptions.gameMode = offlineGameModeSelect.value;
        updateOfflineOptionsUI();
    });

    function generatePlayerNameInputs(count) {
        offlinePlayerNamesContainer.innerHTML = '<h4>Nombres de los Jugadores:</h4>';
        for (let i = 1; i <= count; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Nombre Jugador ${i}`;
            input.className = 'offline-player-name-input';
            input.style.maxWidth = '300px';
            input.style.margin = '5px auto';
            input.style.display = 'block';
            offlinePlayerNamesContainer.appendChild(input);
        }
    }

    function setupOfflineImpostorButtons(maxImpostors) {
        offlineImpostorCountSelector.innerHTML = '';
        for (let i = 1; i <= maxImpostors; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.dataset.count = i;
            offlineImpostorCountSelector.appendChild(btn);
        }
    }

    offlineImpostorCountSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            localOfflineGameOptions.impostorCount = parseInt(e.target.dataset.count, 10);
            updateOfflineOptionsUI();
        }
    });

    offlineCluesEnabledCheckbox.addEventListener('change', () => {
        localOfflineGameOptions.cluesEnabled = offlineCluesEnabledCheckbox.checked;
        updateOfflineOptionsUI();
    });

    offlineClueProbabilitySlider.addEventListener('input', () => {
        const value = offlineClueProbabilitySlider.value;
        localOfflineGameOptions.clueProbability = parseInt(value, 10);
        offlineProbabilityValue.textContent = `${value}%`;
    });

    offlineConfusedCrewmateSlider.addEventListener('input', () => {
        const value = parseInt(offlineConfusedCrewmateSlider.value, 10);
        localOfflineGameOptions.confusedCrewmateProbability = value;
        offlineConfusedCrewmateValue.textContent = value === 0 ? '0% (Desactivado)' : `${value}%`;
    });

    function updateOfflineOptionsUI() {
        offlineGameModeSelect.value = localOfflineGameOptions.gameMode;
        const currentOfflinePlayerCount = parseInt(offlinePlayerCountSelect.value, 10);
        
        let maxImpostors = 1;
        if (currentOfflinePlayerCount >= 9) maxImpostors = 3;
        else if (currentOfflinePlayerCount >= 7) maxImpostors = 2;
        
        setupOfflineImpostorButtons(maxImpostors);
        if (localOfflineGameOptions.impostorCount > maxImpostors) {
            localOfflineGameOptions.impostorCount = maxImpostors;
        }

        offlineImpostorCountSelector.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.count) === localOfflineGameOptions.impostorCount);
        });

        let requiredPlayers = 3;
        if (localOfflineGameOptions.impostorCount === 2) requiredPlayers = 7;
        if (localOfflineGameOptions.impostorCount === 3) requiredPlayers = 9;

        if (currentOfflinePlayerCount < requiredPlayers) {
            offlinePlayerRequirementNotice.textContent = `Se necesitan ${requiredPlayers} jugadores para ${localOfflineGameOptions.impostorCount} impostor(es).`;
            offlinePlayerRequirementNotice.style.display = 'block';
            startOfflineGameBtn.disabled = true;
        } else {
            offlinePlayerRequirementNotice.style.display = 'none';
            startOfflineGameBtn.disabled = false;
        }
        
        const isClubsOnly = localOfflineGameOptions.gameMode === 'clubsOnly';
        if(isClubsOnly) {
            offlineCluesOptionGroup.setAttribute('disabled', 'true');
            offlineConfusedOptionGroup.setAttribute('disabled', 'true');
        } else {
            offlineCluesOptionGroup.removeAttribute('disabled');
            offlineConfusedOptionGroup.removeAttribute('disabled');
        }

        offlineCluesEnabledCheckbox.checked = localOfflineGameOptions.cluesEnabled;
        offlineClueProbabilityGroup.style.display = localOfflineGameOptions.cluesEnabled && !isClubsOnly ? 'block' : 'none';
        offlineClueProbabilitySlider.value = localOfflineGameOptions.clueProbability;
        offlineProbabilityValue.textContent = `${localOfflineGameOptions.clueProbability}%`;

        const confValue = localOfflineGameOptions.confusedCrewmateProbability;
        offlineConfusedCrewmateSlider.value = confValue;
        offlineConfusedCrewmateValue.textContent = confValue === 0 ? '0% (Desactivado)' : `${confValue}%`;
    }

    startOfflineGameBtn.addEventListener('click', () => {
        const playerCount = parseInt(offlinePlayerCountSelect.value, 10);
        const nameInputs = document.querySelectorAll('.offline-player-name-input');
        const playerNames = [];
        let allNamesFilled = true;
        
        nameInputs.forEach((input, index) => {
            const name = input.value.trim();
            if (name === '') {
                allNamesFilled = false;
            }
            playerNames.push(name || `Jugador ${index + 1}`);
        });
        
        if (!allNamesFilled) {
            if (!confirm('Algunos nombres están vacíos. ¿Quieres continuar con nombres por defecto?')) {
                return;
            }
        }
        
        socket.emit('getOfflineGameData', { 
            playerCount, 
            playerNames, 
            options: localOfflineGameOptions 
        });
    });

    socket.on('offlineGameDataReady', (data) => {
        offlineGame = {
            ...data,
            currentPlayerIndex: 0
        };
        showScreen('offlineReveal');
        setupOfflineRevealForPlayer(0);
    });

    offlineShowRoleBtn.addEventListener('click', () => {
        offlinePassDeviceDiv.style.display = 'none';
        offlineRoleRevealDiv.style.display = 'block';
        startOfflineCountdown();
    });

    offlineHideRoleBtn.addEventListener('click', () => {
        offlineGame.currentPlayerIndex++;
        if (offlineGame.currentPlayerIndex < offlineGame.players.length) {
            setupOfflineRevealForPlayer(offlineGame.currentPlayerIndex);
        } else {
            alert('Todos los roles han sido asignados. ¡Que comience el juego!');
            showScreen('menu');
        }
    });

    function setupOfflineRevealForPlayer(index) {
        offlinePassDeviceDiv.style.display = 'block';
        offlineRoleRevealDiv.style.display = 'none';
        offlineRoleContent.style.display = 'none';
        offlineCountdown.style.display = 'block';
        
        offlinePlayerNameTurn.textContent = offlineGame.players[index].name;
    }

    let countdownTimer;
    function startOfflineCountdown() {
        let count = 5;
        offlineCountdown.textContent = count;
        if(countdownTimer) clearInterval(countdownTimer);
        
        countdownTimer = setInterval(() => {
            count--;
            if (count > 0) {
                offlineCountdown.textContent = count;
            } else {
                clearInterval(countdownTimer);
                offlineCountdown.style.display = 'none';
                displayOfflineRole();
                offlineRoleContent.style.display = 'block';
            }
        }, 1000);
    }

    function displayOfflineRole() {
        const playerIndex = offlineGame.currentPlayerIndex;
        const playerData = offlineGame.players[playerIndex];
        
        offlinePlayerNameReveal.textContent = playerData.name;
        
        let roleHTML = `Eres un ${playerData.role === 'impostor' ? '<strong style="color: var(--color-danger);">IMPOSTOR</strong>' : '<strong style="color: var(--accent-primary);">TRIPULANTE</strong>'}`;
        
        if (playerData.characterName) {
            roleHTML += `<br><small style="font-size: 18px;">El personaje es: ${playerData.characterName}</small>`;
        } else {
            roleHTML += `<br><small style="font-size: 18px;">¡No sabes quién es el personaje!</small>`;
        }

        if (playerData.role === 'impostor' && playerData.clue) {
            roleHTML += `<br><small style="font-size: 18px; color: var(--color-warning);">Pista: ${playerData.clue}</small>`;
        }

        offlineRoleInfo.innerHTML = roleHTML;
    }

    // --- Funciones auxiliares ---
    function showError(message) {
        errorModalContainer.querySelector('.error-modal').innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        errorModalContainer.style.display = 'flex';
        
        setTimeout(() => {
            errorModalContainer.style.display = 'none';
        }, 3000);
    }

    function updateWordHistory(wordsSpoken) {
        const wordHistoryContainer = document.getElementById('ejection-history');
        const wordHistoryList = document.getElementById('ejection-list');
        const wordHistoryTitle = wordHistoryContainer.querySelector('h4');

        wordHistoryTitle.innerHTML = `<i class="fas fa-comments"></i> Palabras Dichas:`;

        if (wordsSpoken && wordsSpoken.length > 0) {
            wordHistoryList.innerHTML = wordsSpoken.map(word => 
                `<div style="margin: 4px 0;"><strong>${word.playerName}:</strong> "${word.word}"</div>`
            ).join('');
        } else {
            wordHistoryList.innerHTML = '<em>Nadie ha dicho su palabra aún...</em>';
        }
    }

    function updateEjectionHistory() {
        const ejectionHistoryContainer = document.getElementById('ejection-history');
        const ejectionHistoryList = document.getElementById('ejection-list');
        const ejectionHistoryTitle = ejectionHistoryContainer.querySelector('h4');

        ejectionHistoryTitle.innerHTML = `<i class="fas fa-user-slash"></i> Historial de Expulsiones`;

        if (ejectionHistory.length === 0) {
            ejectionHistoryList.innerHTML = '<em>Ninguna expulsión aún...</em>';
        } else {
            ejectionHistoryList.innerHTML = ejectionHistory.map(ejection => {
                const status = ejection.wasImpostor ? 
                    '<span style="color: #e74c3c;">❌ Era Impostor</span>' : 
                    '<span style="color: #95a5a6;">✓ No era Impostor</span>';
                return `<div style="margin: 3px 0;">Ronda ${ejection.round}: <strong>${ejection.name}</strong> - ${status}</div>`;
            }).join('');
        }
    }
});
