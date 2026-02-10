// State Management
const STATE_KEY = 'wordle_scontrino_arcade_v1';

const defaultState = {
    // Game Status
    status: 'IDLE', // IDLE, PLAYING, ROUND_WON, ROUND_LOST, GAME_OVER, GAME_WON

    // Progression
    currentRound: 1, // 1 to 5
    totalRounds: 5,
    score: 0,
    roundsData: [], // Array of level IDs for this run

    // Current Level State
    grid: ["", "", "", "", ""],
    currentRow: 0,
    currentGuess: "",
    secretPrice: 0,
    secretLevelId: null,

    // Stats (Global Lifetime)
    stats: {
        playedRuns: 0,
        highScore: 0
    }
};

class Store {
    constructor() {
        this.state = JSON.parse(JSON.stringify(defaultState));
        this.load();
    }

    load() {
        try {
            const stored = localStorage.getItem(STATE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge strategies
                this.state = {
                    ...defaultState,
                    ...parsed,
                    stats: { ...defaultState.stats, ...(parsed.stats || {}) }
                };
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

    startNewRun(levels) {
        // Reset run-specific state but keep stats
        this.state.status = 'PLAYING';
        this.state.currentRound = 1;
        this.state.score = 0;
        this.state.roundsData = levels.map(l => l.id);

        // Setup first level
        this.setupLevel(levels[0]);
    }

    setupLevel(level) {
        this.state.status = 'PLAYING';
        this.state.grid = ["", "", "", "", ""];
        this.state.currentRow = 0;
        this.state.currentGuess = "";
        this.state.secretLevelId = level.id;
        this.state.secretPrice = level.priceCents;
        this.save();
    }

    updateGuess(key) {
        if (key === 'DEL') {
            this.state.currentGuess = this.state.currentGuess.slice(0, -1);
        } else if (this.state.currentGuess.length < 6) {
            this.state.currentGuess += key;
        }
        this.save();
    }

    submitCurrentRow() {
        this.state.grid[this.state.currentRow] = this.state.currentGuess;
        this.save();
    }

    advanceRow() {
        this.state.currentRow++;
        this.state.currentGuess = "";
        this.save();
    }

    roundWin() {
        this.state.status = 'ROUND_WON';

        // Calculate Score based on attempts (0-indexed row)
        // 1st try: 1000, 2nd: 800, 3rd: 600, 4th: 400, 5th: 200
        const points = 1000 - (this.state.currentRow * 200);
        this.state.score += points;

        this.save();
        return points;
    }

    roundLoss() {
        this.state.status = 'ROUND_LOST';
        this.save();
    }

    nextRound(nextLevel) {
        this.state.currentRound++;
        this.setupLevel(nextLevel);
    }

    gameComplete() {
        this.state.status = 'GAME_WON'; // Completed all 5
        this.state.stats.playedRuns++;
        if (this.state.score > this.state.stats.highScore) {
            this.state.stats.highScore = this.state.score;
        }
        this.save();
    }

    gameOver() {
        this.state.status = 'GAME_OVER';
        this.state.stats.playedRuns++;
        this.save();
    }

    get currentPrice() {
        return parseInt(this.state.currentGuess || "0");
    }
}

export const store = new Store();
