// --- GAME DATA ---
// gameData is now loaded from gameData.js

// --- STATE MANAGEMENT ---
const STATE_KEY = 'scontrino_ignoto_v1';

let currentState = {
    date: null, // "YYYY-MM-DD" of the current game state
    attempts: [], // array of guessed prices in cents
    status: 'PLAYING', // 'PLAYING', 'WON', 'LOST'
    streak: 0,
    hasSeenWelcome: false,
    // Statistics
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    bestStreak: 0
};

let currentDayData = null;
let currentInput = "0"; // String representation of cents input

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    startLevel();
    initUI();
    initSmartInput();
});

let inputCents = 0; // Internal state for the input

function initSmartInput() {
    const input = document.getElementById('price-input');

    // Prevent non-numeric usage except basic controls
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitGuess();
            return;
        }
        if (e.key === 'Backspace') {
            e.preventDefault();
            inputCents = Math.floor(inputCents / 10);
            updateInputValue(input);
            return;
        }
        // Allow numbers
        if (/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            if (inputCents < 1000000) { // Safety limit
                inputCents = (inputCents * 10) + parseInt(e.key);
                updateInputValue(input);
            }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            // Block other characters
            e.preventDefault();
        }
    });

    // Handle paste or other input methods crudely by resetting
    input.addEventListener('input', (e) => {
        // Fallback for mobile virtual keyboards that might bypass keydown
        // This is complex to do perfectly mixed with keydown, so we rely mainly on keydown
        // and just force format here if value seems out of sync
        // actually for "tel" inputmode numeric, mostly keydown/input works.
        // Simplified approach: rely on custom visualization.
        // If the user managed to type text, clear it.
        const val = input.value.replace(/[^0-9]/g, '');
        if (val === '') return; // Let keydown handle it
        // If input event fired with new content, try to parse? 
        // Best to just strictly control via keydown for "ATM style" or use a library.
        // For this task, strict keydown is safer for the "ATM feel".
        // We wipe standard input value to force our formatted view
        // But we need to keep the visual value.
        // Let's rely on updateInputValue to set the value property.
    });

    // Initial render
    updateInputValue(input);
}

function updateInputValue(input) {
    const formatted = (inputCents / 100).toFixed(2);
    input.value = formatted;
}

function loadState() {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        currentState = { ...currentState, ...parsed };
    }
}

function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(currentState));
}

function startLevel(forceNew = false) {
    // UI Cleanup
    const stamps = document.getElementById('stamps-container');
    if (stamps) stamps.innerHTML = '';

    const receipt = document.getElementById('receipt-card');
    if (receipt) receipt.classList.remove('animate-tear');

    // If we have a saved game...
    if (!forceNew && currentState.status === 'PLAYING' && currentState.currentLevelId) {
        currentDayData = gameData.find(d => d.id === currentState.currentLevelId);
        // Fallback if data missing
        if (!currentDayData) {
            pickRandomLevel();
        }
    } else {
        // Start new game
        pickRandomLevel();
    }

    // Update UI headers
    const now = new Date();
    document.getElementById('receipt-date').textContent = now.toLocaleDateString('it-IT');
    document.getElementById('receipt-time').textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('receipt-id').textContent = `${1000 + currentDayData.id}`;

    // Render Products
    const list = document.getElementById('product-list');
    list.innerHTML = currentDayData.items.map(item => `
        <div class="flex justify-between items-start">
            <span>${item.name}</span>
            <span>x${item.qty}</span>
        </div>
    `).join('');

    // Show Welcome only if very first time ever
    if (!currentState.hasSeenWelcome) {
        document.getElementById('welcome-modal').classList.remove('hidden');
    } else {
        document.getElementById('welcome-modal').classList.add('hidden');
    }

    // Reset inputs if new game
    if (forceNew) {
        inputCents = 0;
        const input = document.getElementById('price-input');
        const btn = document.getElementById('submit-btn');
        if (input) {
            input.value = '';
            input.disabled = false; // Re-enable
            updateInputValue(input);
        }
        if (btn) btn.disabled = false; // Re-enable
    }

    updateUI();
}

function pickRandomLevel() {
    const randomIndex = Math.floor(Math.random() * gameData.length);
    currentDayData = gameData[randomIndex];

    // Reset State for new level
    currentState.date = new Date().toISOString().split('T')[0];
    currentState.currentLevelId = currentDayData.id;
    currentState.attempts = [];
    currentState.status = 'PLAYING';
    saveState();
}

// --- GAME LOGIC ---

function submitGuess() {
    const inputElement = document.getElementById('price-input');

    // Use our internal state
    const guessCents = inputCents;

    if (guessCents <= 0) return;

    currentState.attempts.push(guessCents);

    const target = currentDayData.priceCents;
    const TOLERANCE_CENTS = 50; // 0.50€ tolerance

    // Check Win/Loss
    if (Math.abs(guessCents - target) <= TOLERANCE_CENTS) {
        currentState.status = 'WON';
        currentState.streak++;
        currentState.totalGames++;
        currentState.totalWins++;
        if (currentState.streak > currentState.bestStreak) {
            currentState.bestStreak = currentState.streak;
        }
        finishGame();
    } else if (currentState.attempts.length >= 5) {
        currentState.status = 'LOST';
        currentState.streak = 0;
        currentState.totalGames++;
        currentState.totalLosses++;
        finishGame();
    } else {
        // Feedback
        animateFeedback(guessCents > target ? 'LOWER' : 'HIGHER');
    }

    saveState();
    updateUI();

    // Clear input for next guess and keep focus
    inputCents = 0;
    updateInputValue(inputElement);
    inputElement.focus();
}

function updateUI() {
    // Render Previous Attempts bubbles
    const container = document.getElementById('attempts-container');
    container.innerHTML = '';

    const maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
        const div = document.createElement('div');
        div.className = "w-2.5 h-2.5 rounded-full transition-colors duration-200 ";

        if (i < currentState.attempts.length) {
            const guess = currentState.attempts[i];
            const target = currentDayData.priceCents;

            if (guess === target) {
                div.className += "bg-green-500";
            } else {
                div.className += "bg-red-500";
            }
        } else {
            div.className += "bg-gray-200";
        }

        if (i === currentState.attempts.length && currentState.status === 'PLAYING') {
            div.className += " bg-gray-400"; // Active indicator (simple gray)
        }

        container.appendChild(div);
    }

    // Render Attempts History
    const historyContainer = document.getElementById('attempts-history');
    historyContainer.innerHTML = '';

    if (currentState.attempts.length === 0) {
        historyContainer.innerHTML = '<div class="text-xs text-gray-300 text-center py-4 italic">Nessun tentativo</div>';
    } else {
        // Reverse attempts to show newest first
        const reversedAttempts = [...currentState.attempts].reverse();
        const totalAttempts = currentState.attempts.length;
        const target = currentDayData.priceCents;

        reversedAttempts.forEach((attemptCents, index) => {
            const originalIndex = totalAttempts - 1 - index;
            const attemptEuro = (attemptCents / 100).toFixed(2);

            const isCorrect = attemptCents === target;
            const isHigh = attemptCents > target;

            const historyItem = document.createElement('div');
            historyItem.className = `flex justify-between items-center text-xs p-3 ${isCorrect ? 'bg-green-50' : 'bg-white'}`;

            let feedbackIcon = '';
            let feedbackText = '';

            if (isCorrect) {
                feedbackIcon = '🎉';
                feedbackText = '<span class="text-green-600 font-bold">ESATTO</span>';
            } else if (isHigh) {
                feedbackIcon = '↓';
                feedbackText = '<span class="text-red-500 font-medium">TROPPO ALTO</span>';
            } else {
                feedbackIcon = '↑';
                feedbackText = '<span class="text-blue-500 font-medium">TROPPO BASSO</span>';
            }

            historyItem.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-gray-400 font-receipt text-[10px] w-4">#${originalIndex + 1}</span>
                    <span class="font-receipt font-bold text-gray-900 text-sm">€${attemptEuro}</span>
                </div>
                <div class="flex items-center gap-2">${feedbackIcon} ${feedbackText}</div>
            `;

            historyContainer.appendChild(historyItem);
        });
    }

    // Game Over check to show modal
    if (currentState.status !== 'PLAYING') {
        showResultModal();
    }
}

function animateFeedback(type) {
    const messageEl = document.getElementById('message-text');
    const inputEl = document.getElementById('price-input'); // Updated target

    // Clear previous
    messageEl.textContent = '';
    messageEl.className = "text-xs font-bold uppercase tracking-wider text-center h-4 transition-all duration-300";

    // Set new message
    if (type === 'LOWER') {
        messageEl.textContent = "↓ TROPPO ALTO";
        messageEl.classList.add('text-red-500');
    } else {
        messageEl.textContent = "↑ TROPPO BASSO";
        messageEl.classList.add('text-blue-500');
    }

    // Shake animation on input
    if (inputEl) {
        inputEl.classList.remove('animate-shake');
        void inputEl.offsetWidth; // Trigger reflow
        inputEl.classList.add('animate-shake');
    }
}

function finishGame() {
    // Add Stamp
    const isWin = currentState.status === 'WON';
    const stampsContainer = document.getElementById('stamps-container');
    const stamp = document.createElement('div');
    stamp.className = `stamp-mark ${isWin ? 'stamp-success' : 'stamp-error'}`;
    stamp.textContent = isWin ? 'PAGATO' : 'RESPINTO';
    stampsContainer.appendChild(stamp);

    // Play sound or vibration here if requested
    if (navigator.vibrate) navigator.vibrate(isWin ? 200 : [50, 50, 50]);

    // Delay modal slightly to see the stamp
    setTimeout(() => {
        showResultModal();
    }, 1200);
}

// --- MODALS & CONTROLS ---

function closeWelcome() {
    currentState.hasSeenWelcome = true;
    saveState();
    const modal = document.getElementById('welcome-modal');
    if (modal) modal.classList.add('hidden');
}

function openInfoModal() {
    document.getElementById('info-modal').classList.remove('hidden');
    document.getElementById('info-modal').classList.add('flex');
}

function closeInfoModal() {
    document.getElementById('info-modal').classList.remove('flex');
    document.getElementById('info-modal').classList.add('hidden');
}

function openZoomModal() {
    document.getElementById('zoom-modal').classList.remove('hidden');
    document.getElementById('zoom-modal').classList.add('flex');
}

function closeZoomModal() {
    document.getElementById('zoom-modal').classList.add('hidden');
    document.getElementById('zoom-modal').classList.remove('flex');
}

function showResultModal() {
    const modal = document.getElementById('result-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const isWin = currentState.status === 'WON';
    const title = document.getElementById('result-title');
    const msg = document.getElementById('result-message');
    const realPrice = document.getElementById('result-price');
    const breakdownContainer = document.getElementById('product-breakdown');
    const diffDisplay = document.getElementById('result-diff');

    if (isWin) {
        if (window.jsConfetti) {
            jsConfetti.addConfetti();
        }
        title.textContent = "SCONTRINO PAGATO! 🎉";
        title.className = "text-3xl font-bold mb-2 text-success";

        const target = currentDayData.priceCents;
        const lastGuess = currentState.attempts[currentState.attempts.length - 1];
        const diff = Math.abs(lastGuess - target);

        if (diff === 0) {
            msg.textContent = `Incredibile! Prezzo esatto al centesimo! 🎯`;
        } else {
            msg.textContent = `Vittoria! Eri vicino di €${(diff / 100).toFixed(2)}.`;
        }

        if (diffDisplay) diffDisplay.textContent = "";

    } else {
        title.textContent = "SCONTRINO NON PAGATO 💀";
        title.className = "text-3xl font-bold mb-2 text-error";
        msg.textContent = "Hai esaurito i tentativi.";

        const target = currentDayData.priceCents;
        const lastGuess = currentState.attempts[currentState.attempts.length - 1];
        const diff = lastGuess - target;
        const diffEuro = (diff / 100).toFixed(2);

        if (diffDisplay) {
            diffDisplay.textContent = `Errore finale: ${diff > 0 ? '+' : ''}€${diffEuro}`;
            diffDisplay.className = "text-xl font-receipt font-bold text-gray-700 mt-2";
        }
    }

    breakdownContainer.innerHTML = '';
    currentDayData.items.forEach(item => {
        const itemTotal = item.priceCents * item.qty;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center uppercase';
        itemDiv.innerHTML = `
            <span>${item.name} x${item.qty}</span>
            <span class="font-bold">€${(itemTotal / 100).toFixed(2)}</span>
        `;
        breakdownContainer.appendChild(itemDiv);
    });

    realPrice.textContent = "€" + (currentDayData.priceCents / 100).toFixed(2);

    document.getElementById('final-attempts').textContent = `${currentState.attempts.length}/5`;
    document.getElementById('final-streak').textContent = `${currentState.streak} 🔥`;
    document.getElementById('best-streak').textContent = `${currentState.bestStreak}`;
    document.getElementById('total-games').textContent = currentState.totalGames;
    document.getElementById('total-wins').textContent = currentState.totalWins;

    const winRate = currentState.totalGames > 0
        ? Math.round((currentState.totalWins / currentState.totalGames) * 100)
        : 0;
    document.getElementById('win-rate').textContent = `${winRate}%`;

    if (isWin) {
        triggerConfetti();
    }
}

function triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        const left = 0;
        const right = 1;

        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#2ecc71', '#f1c40f', '#e74c3c']
        });

        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#2ecc71', '#f1c40f', '#e74c3c']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function resetGame() {
    const modal = document.getElementById('result-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    // Animate Tear Off
    const receipt = document.getElementById('receipt-card');
    receipt.classList.add('animate-tear');

    // Wait for animation to finish before starting new level
    setTimeout(() => {
        startLevel(true);
    }, 800);
}

function shareResult() {
    // Generate text
    // 🟥🟥🟨🟩
    let emojiHistory = "";
    currentState.attempts.forEach(attempt => {
        if (attempt === currentDayData.priceCents) emojiHistory += "🟩";
        else if (Math.abs(attempt - currentDayData.priceCents) < 50) emojiHistory += "🟨"; // Close-ish
        else if (attempt > currentDayData.priceCents) emojiHistory += "⬇️";
        else emojiHistory += "⬆️";
    });

    const text = `Scontrino Ignoto 🧾 #${currentDayData.id}
🛒 ${currentState.status === 'WON' ? currentState.attempts.length : 'X'}/5
${emojiHistory}

Streak: ${currentState.streak} 🔥`;

    navigator.clipboard.writeText(text).then(() => {
        alert("Risultato copiato negli appunti!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function initUI() {
    // Prevent double tap zoom on buttons
    document.addEventListener('dblclick', function (event) {
        event.preventDefault();
    }, { passive: false });
}
