export class ProbabilityCalculator {
    static calculateProbabilities(dice) {
        const numSimulations = 100000;
        const numDice = dice.length;
        let results = Array(numDice).fill(null).map(() => Array(numDice).fill(null));

        for (let i = 0; i < numDice; i++) {
            for (let j = 0; j < numDice; j++) {
                if (i === j) {
                    results[i][j] = '—';
                } else {
                    results[i][j] = ProbabilityCalculator.simulate(dice[i], dice[j], numSimulations);
                }
            }
        }

        return results;
    }

    static simulate(die1, die2, numSimulations) {
        let die1Wins = 0;

        for (let i = 0; i < numSimulations; i++) {
            let roll1 = die1[Math.floor(Math.random() * die1.length)];
            let roll2 = die2[Math.floor(Math.random() * die2.length)];
            if (roll1 > roll2) die1Wins++;
        }

        return ((die1Wins / numSimulations) * 100).toFixed(1) + "%";
    }
}
