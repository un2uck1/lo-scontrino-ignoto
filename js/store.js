// State Management
const STATE_KEY = 'wordle_scontrino_store_v1';

const defaultState = {
    status: 'PLAYING', // PLAYING, WON, LOST
    grid: ["", "", "", "", ""],
    currentRow: 0,
    currentGuess: "",
    secretPrice: 0,
    secretLevelId: null,
    stats: {
        played: 0,
        wins: 0,
        streak: 0,
        maxStreak: 0,
        distribution: [0, 0, 0, 0, 0] // Track wins by attempt count
    },
    lastPlayed: null
};

class Store {
    constructor() {
        this.state = JSON.parse(JSON.stringify(defaultState)); // Deep copy
        this.load();
    }

    load() {
        try {
            const stored = localStorage.getItem(STATE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge carefully to preserve new defaults if schema changed
                this.state = {
                    ...this.state,
                    ...parsed,
                    stats: {
                        ...this.state.stats,
                        ...(parsed.stats || {})
                    }
                };

                // Ensure distribution exists if loading old state
                if (!this.state.stats.distribution) {
                    this.state.stats.distribution = [0, 0, 0, 0, 0];
                }
            }
        } catch (e) {
            console.error('Failed to load state', e);
        }
    }

    save() {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state', e);
        }
    }

    resetForNewGame(levelId, priceCents) {
        this.state.status = 'PLAYING';
        this.state.grid = ["", "", "", "", ""];
        this.state.currentRow = 0;
        this.state.currentGuess = "";
        this.state.secretLevelId = levelId;
        this.state.secretPrice = priceCents;
        // Don't reset keys or stats
        this.save();
    }

    updateGuess(key) {
        if (key === 'DEL') {
            this.state.currentGuess = this.state.currentGuess.slice(0, -1);
        } else if (this.state.currentGuess.length < 6) { // Max 6 chars
            this.state.currentGuess += key;
        }
        // Debounce save if performance issue, but for simple app instant save is safer
        this.save();
    }

    submitCurrentRow() {
        // Save current guess into grid
        this.state.grid[this.state.currentRow] = this.state.currentGuess;
        this.save();
    }

    advanceRow() {
        this.state.currentRow++;
        this.state.currentGuess = "";
        this.save();
    }

    win() {
        this.state.status = 'WON';
        this.state.stats.played++;
        this.state.stats.wins++;
        this.state.stats.streak++;
        this.state.stats.maxStreak = Math.max(this.state.stats.streak, this.state.stats.maxStreak);

        // Update distribution (currentRow is 0-indexed, so corresponds to attempt 1..5)
        if (this.state.stats.distribution[this.state.currentRow] !== undefined) {
            this.state.stats.distribution[this.state.currentRow]++;
        }

        this.save();
    }

    lose() {
        this.state.status = 'LOST';
        this.state.stats.played++;
        this.state.stats.streak = 0;
        this.save();
    }

    // Getters
    get currentPrice() {
        return parseInt(this.state.currentGuess || "0");
    }
}

export const store = new Store();
