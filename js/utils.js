// Utility Functions
export const Utils = {
    audioContext: null,

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    playSound(type) {
        if (!this.audioContext) this.initAudio();
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        switch (type) {
            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'error':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'win':
                // Arpeggio
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
                notes.forEach((freq, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.connect(g);
                    g.connect(ctx.destination);
                    o.type = 'sine';
                    o.frequency.value = freq;
                    g.gain.setValueAtTime(0.05, now + i * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
                    o.start(now + i * 0.1);
                    o.stop(now + i * 0.1 + 0.3);
                });
                break;

            case 'lose':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.5);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
        }
    },

    /**
     * get today's date string
     */
    getTodayString() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    },

    /**
     * Get countdown to next midnight
     */
    getNextGameCountdown() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const diff = tomorrow - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return { hours, minutes, seconds, text: `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` };
    },

    /**
     * Generate shareable emoji result
     */
    generateShareText(attempts, won, grid, secretPrice) {
        const title = "Scontrino Ignoto 🧾";
        const result = won ? `${attempts}/5` : "X/5";

        let emojiGrid = "";
        // We only show the attempts made
        const rowsToShow = won ? attempts : 5; // Show all if lost? Or just attempts?
        // Let's show up to current row
        for (let i = 0; i < grid.length; i++) {
            if (!grid[i] || grid[i] === "") continue;

            const guess = parseInt(grid[i]);
            // Logic to determine color:
            // Green if exact match
            // Yellow if close? Actually we use Up/Down arrows in UI.
            // Standard Wordle uses colored squares.
            // Let's stick to Green/Yellow/Black squares for share.
            if (guess === secretPrice) {
                emojiGrid += "🟩🟩🟩🟩🟩\n";
            } else {
                // If we want detailed share, we can use arrows
                // ⬆️⬇️
                const diff = guess - secretPrice;
                const arrow = diff > 0 ? "⬇️" : "⬆️";
                emojiGrid += `⬜⬜${arrow}⬜⬜\n`;
            }
        }

        return `${title} ${Utils.getTodayString()}\n${result}\n\n${emojiGrid}`;
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    },

    /**
     * Vibrate device (mobile haptic feedback)
     */
    vibrate(pattern = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    },

    /**
     * Launch Confetti
     */
    launchConfetti() {
        const colors = ['#6aaa64', '#c9b458', '#e8eaed', '#ff5722', '#2196f3'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            const x = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 2 + Math.random() * 3;
            const color = colors[Math.floor(Math.random() * colors.length)];

            confetti.style.cssText = `
                position: fixed;
                top: -10px;
                left: ${x}vw;
                width: 8px;
                height: 8px;
                background-color: ${color};
                animation: confettiFall ${duration}s linear ${delay}s forwards;
                z-index: 1000;
                transform: rotate(${Math.random() * 360}deg);
            `;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), (duration + delay) * 1000);
        }
    },

    showToast(message, duration = 2000) {
        const existing = document.getElementById('toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 200;
            backdrop-filter: blur(4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-size: 0.9rem;
            animation: fadeIn 0.3s ease-out;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// Add CSS keyframes for confetti if not exists
if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
        @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
