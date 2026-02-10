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
// Resets entire RUN
window.resetGame = () => {
    Utils.playSound('click');
    APP.startNewRun();
}
window.shareResult = () => {
    Utils.playSound('click');
    APP.shareResult();
}
window.nextRound = () => {
    Utils.playSound('click');
    APP.nextRound();
}

const APP = {

    init() {
        UI.init();

        // Apply dark mode preference on load
        if (settings.get('darkMode')) {
            document.body.classList.add('dark-mode');
        }

        this.setupEventListeners();

        // Check for existing run or start new
        this.resumeOrStart();

        this.updateHeader();

        // Audio init on first interaction
        document.body.addEventListener('click', () => Utils.initAudio(), { once: true });

        console.log("Lo Scontrino Ignoto ARCADE initialized ✨");
    },

    resumeOrStart() {
        // If state is valid and playing, do nothing, just render
        if (store.state.status === 'PLAYING') {
            const level = gameData.find(l => l.id === store.state.secretLevelId);

            if (level) {
                UI.renderReceipt(level.items);
                UI.renderGrid(store.state);
                this.updateKeypadState();
            } else {
                this.startNewRun();
            }
        } else {
            this.startNewRun();
        }
    },

    startNewRun() {
        // Difficulty Logic: Shuffle and Pick 5
        const shuffled = [...gameData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);

        console.log(`Starting Run with Levels: ${selected.map(l => l.id)}`);

        store.startNewRun(selected);
        this.startLevel(selected[0]);
    },

    startLevel(level) {
        store.setupLevel(level);

        UI.renderReceipt(level.items);
        UI.renderGrid(store.state);
        UI.toggleModal('result-modal', false);
        UI.toggleModal('info-modal', false);
        this.updateKeypadState();
        this.updateHeader();

        // Remove old stamp
        const oldStamp = document.querySelector('.receipt-stamp');
        if (oldStamp) oldStamp.remove();
    },

    nextRound() {
        if (store.state.currentRound < store.state.totalRounds) {
            // Move to next
            const nextIndex = store.state.currentRound; // Current passed rounds = index for next from 0-based array?
            // Store.currentRound is 1-based (starts at 1).
            // So if currentRound is 1, we just finished round 1. Next is round 2.
            // But array index for round 2 is 1.

            const nextLvlId = store.state.roundsData[store.state.currentRound];
            const nextLevel = gameData.find(l => l.id === nextLvlId);

            if (nextLevel) {
                store.state.currentRound++; // Increment validly
                this.startLevel(nextLevel);
            } else {
                this.finishGame();
            }
        } else {
            this.finishGame();
        }
    },

    finishGame() {
        store.gameComplete();
        UI.showFinalStats(store.state);
    },

    updateHeader() {
        // We need to implement this in UI
        const headerTitle = document.querySelector('header h1');
        if (headerTitle) {
            headerTitle.innerHTML = `ROUND ${store.state.currentRound}/${store.state.totalRounds} <span style="opacity:0.4; margin:0 8px;">|</span> SCORE: ${store.state.score}`;
        }
    },

    updateKeypadState() {
        // No-op
    },

    setupEventListeners() {
        // Keypad
        const keypad = document.getElementById('keypad');
        if (keypad) {
            keypad.addEventListener('click', (e) => {
                const btn = e.target.closest('.key');
                if (!btn) return;

                btn.style.transform = "scale(0.95)";
                setTimeout(() => btn.style.transform = "", 100);

                this.handleInput(btn.dataset.key);
            });
        }

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (store.state.status !== 'PLAYING') return;
            if (e.key === 'Enter') this.handleInput('ENTER');
            else if (e.key === 'Backspace' || e.key === 'Delete') this.handleInput('DEL');
            else if (/^[0-9]$/.test(e.key)) this.handleInput(e.key);
        });
    },

    handleInput(key) {
        if (store.state.status !== 'PLAYING') return;

        Utils.initAudio();

        if (key === 'ENTER') {
            this.submitGuess();
        } else {
            Utils.playSound('click');
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
            return;
        }

        Utils.playSound('click');
        store.submitCurrentRow();

        const rowId = store.state.currentRow;
        const target = store.state.secretPrice;

        UI.animateFlip(rowId, () => {
            UI.updateRow(rowId, guessCents, target, true);
        });

        const check = Game.checkGuess(guessCents, target);

        setTimeout(() => {
            if (check.direction === 'EQUAL') {
                // ROUND WIN
                const points = store.roundWin();
                Utils.launchConfetti();
                Utils.playSound('win');
                UI.showStamp('win');

                UI.pulseRow(rowId);
                this.updateHeader();

                setTimeout(() => UI.showRoundResult(store.state, true, points), 1500);
            } else {
                // WRONG OR GAME OVER ROUND
                if (store.state.currentRow >= 4) {
                    store.roundLoss();
                    Utils.playSound('lose');
                    UI.showStamp('loss');
                    setTimeout(() => UI.showRoundResult(store.state, false, 0), 1500);
                } else {
                    store.advanceRow();
                }
            }
        }, 600);
    },

    shareResult() {
        const shareText = `🧾 Lo Scontrino Ignoto \nScore: ${store.state.score}\nRound ${store.state.currentRound}/5`;
        Utils.copyToClipboard(shareText).then(() => Utils.showToast('Copiato!'));
    }
};

APP.init();
