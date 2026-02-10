// UI Controller
import { Game } from './game.js';
import { Utils } from './utils.js';

export const UI = {
    elements: {
        grid: document.getElementById('grid-board'),
        receiptList: document.getElementById('product-list'),
        keypad: document.getElementById('keypad'),
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

        tile.classList.add('animate-flip');

        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                tile.classList.remove('animate-flip');
            }, 500);
        }, 300);
    },

    showStats(state, isWin) {
        const m = this.elements.modals.result;
        if (!m) return;

        m.classList.remove('hidden');

        const modalContent = m.querySelector('.modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <button class="close-btn" onclick="window.UI.toggleModal('result-modal', false)">&times;</button>
                <div style="margin-top: 10px;">
                    <h2 class="${isWin ? 'text-green-600' : ''}" style="color:${isWin ? '#6aaa64' : '#d32f2f'}">
                        ${isWin ? 'PAGATO! 💶' : 'NON PAGATO 💀'}
                    </h2>
                    
                    ${!isWin ? `<div class="mb-2" style="font-size: 1.1rem;">Il totale era: <strong>€${Game.formatPrice(state.secretPrice)}</strong></div>` : ''}

                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-value">${state.stats.played}</div>
                            <div class="stat-label">Giocate</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${state.stats.played > 0 ? Math.round((state.stats.wins / state.stats.played) * 100) : 0}%</div>
                            <div class="stat-label">Vittorie</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${state.stats.streak}</div>
                            <div class="stat-label">Streak</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${state.stats.maxStreak}</div>
                            <div class="stat-label">Max</div>
                        </div>
                    </div>

                    <div id="guess-distribution" class="guess-distribution"></div>

                    <h3 style="font-size: 0.7rem; text-transform:uppercase; margin-bottom:5px; margin-top: 20px;">Prossimo Scontrino</h3>
                    <div id="next-timer" style="font-family:monospace; font-size:1.5rem; margin-bottom:15px;">--:--:--</div>

                    <button onclick="shareResult()" class="play-btn" style="background: ${isWin ? '#6aaa64' : '#1a1a1b'}">
                        CONDIVIDI RISULTATO
                    </button>
                    <!-- Debug button to reset easily during testing -->
                     <button onclick="resetGame()" class="play-btn" style="background: transparent; color: #888; font-size: 0.6rem; margin-top:5px; padding: 5px; opacity: 0.5; box-shadow:none;">
                        RESET (DEBUG)
                    </button>
                </div>
            `;

            this.renderGuessDistribution(state);
        }
    },

    renderGuessDistribution(state) {
        const container = document.getElementById('guess-distribution');
        if (!container) return;

        const distribution = state.stats.distribution || [0, 0, 0, 0, 0];
        const maxCount = Math.max(...distribution, 1);
        const currentAttemptIndex = state.status === 'WON' ? state.currentRow : -1;

        container.innerHTML = distribution.map((count, index) => {
            const attempt = index + 1;
            const percentage = (count / maxCount) * 100;
            const isCurrent = index === currentAttemptIndex;
            const barColor = isCurrent ? '#6aaa64' : 'rgba(0,0,0,0.1)';
            // Note: Dark mode logic handled by CSS classes properly but here we inline styles safely or use classes?
            // Let's use styles that work. Dark mode overrides might need 'body.dark-mode' in CSS targeting this.

            return `
                <div class="distribution-row">
                    <div class="distribution-label">${attempt}</div>
                    <div class="distribution-bar" style="background:${isCurrent ? '#6aaa64' : ''}">
                         <div style="width:${Math.max(percentage, count > 0 ? 8 : 0)}%; background:${isCurrent ? '#4caf50' : '#888'}; height:100%; display:flex; align-items:center; justify-content:flex-end; padding-right:5px; color:white; font-weight:bold; font-size:0.75rem;">
                            ${count > 0 ? count : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    toggleModal(id, show) {
        const el = document.getElementById(id);
        if (!el) return;
        if (show) el.classList.remove('hidden');
        else el.classList.add('hidden');
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

        // Remove existing
        const old = receipt.querySelector('.receipt-stamp');
        if (old) old.remove();

        const stamp = document.createElement('div');
        stamp.className = `receipt-stamp ${type === 'win' ? 'is-win' : 'is-loss'}`;
        stamp.textContent = type === 'win' ? 'PAGATO' : 'RESPINTO';

        receipt.appendChild(stamp);
    }
};

window.UI = UI;
