import { DiceParser } from "./DiceParser.js";
import { DiceGame } from "./DiceGame.js";
import { ProbabilityCalculator } from "./ProbabilityCalculator.js";
import { ProbabilityTable } from "./ProbabilityTable.js";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const diceArgs = process.argv.slice(2); 

if (diceArgs.length === 1 && diceArgs[0].toLowerCase() === "help") {
    console.log("\n📊 Probability Table (Winning Chances %)");

    const dice = [
        [2, 2, 4, 4, 9, 9],
        [6, 8, 1, 1, 8, 6],
        [7, 5, 3, 7, 5, 3]
    ];

    const probabilities = ProbabilityCalculator.calculateProbabilities(dice);
    ProbabilityTable.display(probabilities);

    process.exit(0);
}

const dice = DiceParser.parseDice(diceArgs);
if (!dice) {
    process.exit(1);
}

const game = new DiceGame(dice, rl);
game.playGame(() => rl.close());
