// State Management
const STATE_KEY = 'wordle_scontrino_arcade_v1';

const defaultState = {
    // Game Status
    status: 'IDLE', // IDLE, PLAYING, ROUND_WON, ROUND_LOST, GAME_OVER, GAME_WON

    // Progression
    currentRound: 1, // 1 to 5
    totalRounds: 5,
    score: 0,
    roundsData: [], // Array of level IDs
    roundResults: [], // ['WIN', 'LOSS', 'WIN', null, null]

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
        this.state.status = 'PLAYING';
        this.state.currentRound = 1;
        this.state.score = 0;
        this.state.roundResults = []; // Reset results history
        this.state.roundsData = levels.map(l => l.id);

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

        // Calculate Score: 1000 base - 200 per attempt used (0-indexed)
        const points = 1000 - (this.state.currentRow * 200);
        this.state.score += points;

        // Track result
        this.state.roundResults[this.state.currentRound - 1] = 'WIN';

        this.save();
        return points;
    }

    roundLoss() {
        this.state.status = 'ROUND_LOST';
        this.state.roundResults[this.state.currentRound - 1] = 'LOSS';
        this.save();
    }

    nextRound(nextLevel) {
        this.state.currentRound++;
        this.setupLevel(nextLevel);
    }

    gameComplete() {
        this.state.status = 'GAME_WON';
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
