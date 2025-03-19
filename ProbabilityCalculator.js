export class ProbabilityCalculator {
    static calculateProbabilities(dice) {
        const numSimulations = 100000;
        const numDice = dice.length;
        let results = Array.from({ length: numDice }, () => Array(numDice).fill(null));

        for (let i = 0; i < numDice; i++) {
            for (let j = 0; j < numDice; j++) {
                results[i][j] = i === j ? "—" : ProbabilityCalculator.simulate(dice[i], dice[j], numSimulations);
            }
        }

        return results;
    }

    static simulate(die1, die2, numSimulations) {
        let die1Wins = 0;

        for (let i = 0; i < numSimulations; i++) {
            if (die1[Math.floor(Math.random() * 6)] > die2[Math.floor(Math.random() * 6)]) {
                die1Wins++;
            }
        }

        return `${((die1Wins / numSimulations) * 100).toFixed(1)}%`;
    }
}
