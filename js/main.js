// Main Application Entry Point
import { store } from './store.js';
import { UI } from './ui.js';
import { Game } from './game.js';
import { gameData } from './data.js';
import { Utils } from './utils.js';
import { settings } from './settings.js';

// Define global functions for HTML access
window.closeInfoModal = () => {
    Utils.playSound('click');
    UI.toggleModal('info-modal', false);
}
window.openInfoModal = () => {
    Utils.initAudio();
    Utils.playSound('click');
    UI.toggleModal('info-modal', true);
}
window.openStatsModal = () => { };
window.resetGame = () => { };
window.shareResult = () => { };
window.toggleDarkMode = () => {
    Utils.initAudio();
    Utils.playSound('click');
    settings.toggleDarkMode();
    if (settings.get('darkMode')) {
        document.body.classList.add('dark-mode');
        Utils.showToast('🌙 Dark Mode');
    } else {
        document.body.classList.remove('dark-mode');
        Utils.showToast('☀️ Light Mode');
    }
};

const APP = {
    usedKeys: new Set(),

    init() {
        UI.init();

        // Apply dark mode preference on load
        if (settings.get('darkMode')) {
            document.body.classList.add('dark-mode');
        }

        this.setupEventListeners();
        this.initDailyChallenge();
        this.updateCountdownTimer();
        this.setupKeyboardNavigation();

        // Audio init on first interaction
        document.body.addEventListener('click', () => Utils.initAudio(), { once: true });

        console.log("Lo Scontrino Ignoto initialized ✨");
    },

    initDailyChallenge() {
        const today = Utils.getTodayString();

        if (store.state.lastPlayed === today) {
            const currentLevel = gameData.find(l => l.id === store.state.secretLevelId);

            if (currentLevel) {
                UI.renderReceipt(currentLevel.items);
                UI.renderGrid(store.state);

                // Re-hydrate used keys
                store.state.grid.forEach(row => {
                    if (!row) return;
                    for (let char of row) {
                        this.usedKeys.add(char);
                    }
                });

                this.updateKeypadState();

                if (store.state.status !== 'PLAYING') {
                    setTimeout(() => {
                        UI.showStamp(store.state.status === 'WON' ? 'win' : 'loss');
                        UI.showStats(store.state, store.state.status === 'WON');
                    }, 500);
                }
            } else {
                this.startNewGame();
            }
            return;
        }

        this.startNewGame();
    },

    startNewGame() {
        const today = Utils.getTodayString();
        const dayIndex = new Date(today).getTime();
        const levelIndex = Math.floor(dayIndex / (1000 * 60 * 60 * 24)) % gameData.length;
        const level = gameData[levelIndex];

        console.log(`Starting Level ${level.id} for ${today}`);

        store.resetForNewGame(level.id, level.priceCents);
        store.state.lastPlayed = today;
        store.save();

        this.usedKeys.clear();

        UI.renderReceipt(level.items);
        UI.renderGrid(store.state);
        UI.toggleModal('result-modal', false);
        UI.toggleModal('info-modal', false);
        this.updateKeypadState();

        // Remove old stamp
        const oldStamp = document.querySelector('.receipt-stamp');
        if (oldStamp) oldStamp.remove();
    },

    updateCountdownTimer() {
        const updateTimer = () => {
            const countdown = Utils.getNextGameCountdown();
            const timerEl = document.getElementById('next-timer');
            if (timerEl) {
                if (store.state.status !== 'PLAYING') {
                    timerEl.textContent = countdown.text;
                } else {
                    timerEl.textContent = 'IN CORSO...';
                }
            }
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    },

    updateKeypadState() {
        document.querySelectorAll('.key[data-key]').forEach(key => {
            const keyValue = key.dataset.key;
            if (this.usedKeys.has(keyValue)) {
                key.classList.add('used');
            } else {
                key.classList.remove('used');
            }
        });
    },

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                UI.toggleModal('info-modal', false);
                UI.toggleModal('result-modal', false);
            }
        });
    },

    setupEventListeners() {
        // Keypad
        UI.elements.keypad.addEventListener('click', (e) => {
            const btn = e.target.closest('.key');
            if (!btn) return;

            // Add visual feedback
            btn.style.transform = "scale(0.95)";
            setTimeout(() => btn.style.transform = "", 100);

            this.handleInput(btn.dataset.key);
        });

        // Physical Keyboard
        document.addEventListener('keydown', (e) => {
            if (store.state.status !== 'PLAYING') return;

            if (e.key === 'Enter') this.handleInput('ENTER');
            else if (e.key === 'Backspace' || e.key === 'Delete') this.handleInput('DEL');
            else if (/^[0-9]$/.test(e.key)) this.handleInput(e.key);
        });

        window.openStatsModal = () => {
            Utils.playSound('click');
            UI.showStats(store.state, store.state.status === 'WON');
        }
        window.resetGame = () => {
            Utils.playSound('click');
            this.startNewGame();
        }
        window.shareResult = () => {
            Utils.playSound('click');
            this.shareResult();
        }
    },

    handleInput(key) {
        if (store.state.status !== 'PLAYING') return;

        Utils.initAudio();

        if (key === 'ENTER') {
            this.submitGuess();
        } else {
            Utils.playSound('click');

            if (settings.get('hapticEnabled')) {
                Utils.vibrate(10);
            }

            if (/^[0-9]$/.test(key)) {
                if (store.state.currentGuess.length < 6) {
                    this.usedKeys.add(key);
                }
            }

            store.updateGuess(key);
            UI.updateRow(store.state.currentRow, store.currentPrice, null, false);
        }
    },

    submitGuess() {
        const guessCents = store.currentPrice;

        if (store.state.currentGuess.length === 0) {
            Utils.showToast('⚠️ Inserisci un prezzo!');
            UI.shakeRow(store.state.currentRow);
            Utils.playSound('error');
            if (settings.get('hapticEnabled')) Utils.vibrate(100);
            return;
        }

        Utils.playSound('click');
        if (settings.get('hapticEnabled')) Utils.vibrate(30);

        store.submitCurrentRow();

        const rowId = store.state.currentRow;
        const target = store.state.secretPrice;

        UI.animateFlip(rowId, () => {
            UI.updateRow(rowId, guessCents, target, true);
        });

        const check = Game.checkGuess(guessCents, target);

        setTimeout(() => {
            if (check.direction === 'EQUAL') {
                // WIN
                store.win();
                Utils.launchConfetti();
                Utils.playSound('win');
                UI.showStamp('win'); // <--- STAMP
                if (settings.get('hapticEnabled')) Utils.vibrate([100, 50, 100, 50, 200]);

                UI.pulseRow(rowId);
                setTimeout(() => UI.showStats(store.state, true), 2000);
            } else {
                // WRONG
                if (store.state.currentRow >= 4) {
                    // GAME OVER
                    store.lose();
                    Utils.playSound('lose');
                    UI.showStamp('loss'); // <--- STAMP
                    if (settings.get('hapticEnabled')) Utils.vibrate([200, 100, 200]);
                    setTimeout(() => UI.showStats(store.state, false), 2000);
                } else {
                    store.advanceRow();
                    this.updateKeypadState();
                }
            }
        }, 600); // Sync with flip
    },

    shareResult() {
        const attempts = store.state.currentRow + (store.state.status === 'WON' ? 1 : 0);
        const won = store.state.status === 'WON';
        const shareText = Utils.generateShareText(attempts, won, store.state.grid, store.state.secretPrice);

        Utils.copyToClipboard(shareText).then(success => {
            if (success) {
                Utils.showToast('📋 Copiato negli appunti!');
                if (settings.get('hapticEnabled')) Utils.vibrate(50);
            } else {
                Utils.showToast('❌ Errore nella copia');
            }
        });
    }
};

// Start App
APP.init();
