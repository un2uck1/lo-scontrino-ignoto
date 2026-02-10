// Pure Game Logic

export const Game = {
    /**
     * Checks a guess against the target price.
     * @param {number} guessCents 
     * @param {number} targetCents 
     * @returns {object} { diff: number, direction: 'UP' | 'DOWN' | 'EQUAL' }
     */
    checkGuess(guessCents, targetCents) {
        const diff = guessCents - targetCents;
        if (diff === 0) return { diff, direction: 'EQUAL' };
        return {
            diff,
            direction: diff > 0 ? 'DOWN' : 'UP'
        };
    },

    /**
     * Formats cents into Euro string
     * @param {number} cents 
     * @returns {string} "12.50"
     */
    formatPrice(cents) {
        if (isNaN(cents)) return "0.00";
        return (cents / 100).toFixed(2);
    }
};
