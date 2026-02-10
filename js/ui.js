// UI Controller
import { Game } from './game.js';
import { Utils } from './utils.js';

export const UI = {
    elements: {
        grid: document.getElementById('grid-board'),
        receiptList: document.getElementById('product-list'),
        modals: {
            info: document.getElementById('info-modal'),
            result: document.getElementById('result-modal')
        }
    },

    init() {
        document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
    },

    renderReceipt(items) {
        // Generate random realistic receipt data
        const storeId = "00" + (Math.floor(Math.random() * 90) + 10);
        const transId = Math.floor(Math.random() * 90000) + 10000;

        const today = new Date();
        const dateStr = today.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = today.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        const dateEl = document.getElementById('receipt-date');
        const numEl = document.getElementById('receipt-number');

        if (dateEl) dateEl.textContent = `${dateStr} ${timeStr}`;
        if (numEl) numEl.textContent = `RT ${storeId} #${transId}`;

        this.elements.receiptList.innerHTML = items.map(i => `
            <div class="flex">
                <span>${i.name}</span>
                <span>${i.qty > 1 ? `x${i.qty}` : ''} ${(i.priceCents / 100).toFixed(2)}</span>
            </div>
        `).join('');

        const total = items.reduce((acc, item) => acc + item.priceCents, 0);
        const taxBase = Math.round(total / 1.22);
        const tax = total - taxBase;

        this.elements.receiptList.innerHTML += `
            <div class="receipt-divider"></div>
            <div class="flex" style="opacity: 0.7; font-size: 0.6rem;">
                <span>IMPONIBILE</span>
                <span>${(taxBase / 100).toFixed(2)}</span>
            </div>
            <div class="flex" style="opacity: 0.7; font-size: 0.6rem;">
                <span>IVA 22%</span>
                <span>${(tax / 100).toFixed(2)}</span>
            </div>
            <div class="receipt-divider" style="margin-bottom: 0;"></div>
        `;

        let footer = document.querySelector('.receipt-footer');
        if (footer && !footer.querySelector('.barcode')) {
            const barcode = document.createElement('div');
            barcode.className = 'barcode';
            footer.appendChild(barcode);
        }
    },

    renderGrid(state) {
        // Clear all rows first to ensure clean state for new rounds
        for (let i = 0; i < 5; i++) {
            const row = document.getElementById(`row-${i}`);
            if (row) {
                const tile = row.querySelector('.tile');
                if (tile) {
                    tile.className = 'tile';
                    tile.textContent = '';
                    delete tile.dataset.state;
                }
            }
        }

        // Render current state
        state.grid.forEach((guessStr, idx) => {
            if (idx < state.currentRow) {
                const val = parseInt(guessStr || "0");
                this.updateRow(idx, val, state.secretPrice, true);
            }
        });

        if (state.status === 'PLAYING') {
            const currentVal = parseInt(state.currentGuess || "0");
            this.updateRow(state.currentRow, currentVal, null, false);
        }
    },

    updateRow(rowIdx, currentCents, targetCents, isFinal) {
        const rowEl = document.getElementById(`row-${rowIdx}`);
        if (!rowEl) return;

        const tile = rowEl.querySelector('.tile');
        const formatted = Game.formatPrice(currentCents);

        if (isFinal) {
            tile.textContent = `€ ${formatted}`;

            const check = Game.checkGuess(currentCents, targetCents);
            delete tile.dataset.state;

            if (check.direction === 'EQUAL') {
                tile.dataset.state = 'correct';
                tile.innerHTML = `€ ${formatted} <span style="margin-left:10px; font-size: 0.8em">✅</span>`;
            } else {
                tile.dataset.state = 'present';
                const arrow = check.direction === 'UP' ? '⬆️' : '⬇️';
                tile.innerHTML = `€ ${formatted} <span style="margin-left:10px">${arrow}</span>`;
            }
        } else {
            tile.dataset.state = 'active';
            tile.textContent = `€ ${formatted}`;
        }
    },

    animateFlip(rowIdx, callback) {
        const rowEl = document.getElementById(`row-${rowIdx}`);
        const tile = rowEl.querySelector('.tile');
        if (!tile) return;

        tile.classList.remove('animate-flip');
        void tile.offsetWidth;

        tile.classList.add('animate-flip');

        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                tile.classList.remove('animate-flip');
            }, 500);
        }, 300);
    },

    showRoundResult(state, isWin, points) {
        const m = this.elements.modals.result;
        if (!m) return;
        m.classList.remove('hidden');

        const modalContent = m.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <div style="text-align:center;">
                    <h2 style="color:${isWin ? '#4caf50' : '#ef4444'}; margin-bottom: 5px;">
                        ${isWin ? 'SCONTRINO PAGATO!' : 'SCONTRINO RESPINTO'}
                    </h2>
                    
                    <div style="font-size: 3rem; font-weight: 800; margin: 20px 0;">
                        ${isWin ? `+${points}` : '0'} <span style="font-size: 1rem; opacity: 0.5;">PTS</span>
                    </div>

                    <div style="margin-bottom: 30px; opacity: 0.8;">
                        Totale Reale: <strong>€${Game.formatPrice(state.secretPrice)}</strong>
                    </div>

                    <div style="margin-bottom: 20px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">
                        Round ${state.currentRound} / ${state.totalRounds}
                    </div>

                    <button onclick="window.nextRound()" class="play-btn">
                        ${state.currentRound < state.totalRounds ? 'PROSSIMO SCONTRINO &rarr;' : 'Vedi Risultato Finale'}
                    </button>
                    <!-- Small debug/skip -->
                    <button onclick="window.nextRound()" style="margin-top:20px; opacity:0.3; font-size:10px; border:none; background:transparent">Skip</button>
                </div>
            `;
        }
    },

    showFinalStats(state) {
        const m = this.elements.modals.result;
        if (!m) return;
        m.classList.remove('hidden');

        const modalContent = m.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <button class="close-btn" onclick="window.UI.toggleModal('result-modal', false)">&times;</button>
                <div style="text-align:center;">
                    <h2 style="margin-bottom: 10px;">PARTITA FINITA</h2>
                    
                    <div style="font-size: 4rem; font-weight: 900; line-height: 1; margin: 20px 0; color: #1f2937;">
                        ${state.score}
                    </div>
                    <div style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 2px; opacity: 0.6; margin-bottom: 30px;">
                        Punteggio Totale
                    </div>

                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-value">${state.stats.playedRuns}</div>
                            <div class="stat-label">Partite</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${state.stats.highScore}</div>
                            <div class="stat-label">Record</div>
                        </div>
                    </div>

                    <button onclick="shareResult()" class="play-btn" style="background: #1f2937; margin-bottom: 10px;">
                        CONDIVIDI RISULTATO
                    </button>
                    <button onclick="resetGame()" class="play-btn" style="background: transparent; color: #1f2937; border: 1px solid #1f2937;">
                        NUOVA PARTITA
                    </button>
                </div>
            `;
        }
    },

    toggleModal(id, show) {
        const el = document.getElementById(id);
        if (!el) return;
        if (show) el.classList.remove('hidden');
        else el.classList.add('hidden');
    },

    updateHeader(round, total, score, roundResults = []) {
        // Update Title Text
        const h1 = document.querySelector('header h1');
        if (h1) {
            h1.innerHTML = `<span style="opacity:0.6">ROUND</span> ${round}/${total} &nbsp;&middot;&nbsp; <span style="opacity:0.6">SCORE</span> <span class="score-val">${score}</span>`;

            // Simple Score Animation Detection
            const scoreEl = h1.querySelector('.score-val');
            // In a real app we'd track prevScore to toggle class only on change
        }

        // Update Progress Bar
        const container = document.getElementById('game-container');
        if (!container) return;

        let progressBar = document.getElementById('round-progress-bar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'round-progress-bar';
            progressBar.className = 'progress-container';
            // Insert after title or before receipt? Before receipt is best.
            // Game Container has children. Receipt is usually first or after a wrapper.
            // Let's prepend to game container for top visibility
            container.insertBefore(progressBar, container.firstChild);
        }

        // Render Segments
        progressBar.innerHTML = '';
        for (let i = 1; i <= total; i++) {
            const seg = document.createElement('div');
            seg.className = 'progress-segment';

            // Logic
            if (i < round) {
                // Past round
                const result = roundResults[i - 1];
                if (result === 'WIN') seg.classList.add('completed-win');
                else if (result === 'LOSS') seg.classList.add('completed-loss');
                else seg.classList.add('completed-win'); // Default/legacy
            } else if (i === round) {
                seg.classList.add('active');
            }

            progressBar.appendChild(seg);
        }
    },

    shakeRow(rowIdx) {
        const rowEl = document.getElementById(`row-${rowIdx}`);
        if (!rowEl) return;
        const tile = rowEl.querySelector('.tile');
        if (tile) {
            tile.classList.add('animate-shake');
            setTimeout(() => tile.classList.remove('animate-shake'), 400);
        }
    },

    pulseRow(rowIdx) {
        const rowEl = document.getElementById(`row-${rowIdx}`);
        if (!rowEl) return;
        const tile = rowEl.querySelector('.tile');
        if (tile) {
            tile.classList.add('animate-pulse');
            setTimeout(() => tile.classList.remove('animate-pulse'), 2000);
        }
    },

    showStamp(type) {
        const receipt = document.getElementById('receipt-preview');
        if (!receipt) return;

        const old = receipt.querySelector('.receipt-stamp');
        if (old) old.remove();

        const stamp = document.createElement('div');
        stamp.className = `receipt-stamp ${type === 'win' ? 'is-win' : 'is-loss'}`;
        stamp.textContent = type === 'win' ? 'PAGATO' : 'RESPINTO';

        receipt.appendChild(stamp);
    }
};

window.UI = UI;
