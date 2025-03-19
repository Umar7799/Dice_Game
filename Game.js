import { DiceParser } from "./DiceParser.js";
import { DiceGame } from "./DiceGame.js";
import { ProbabilityCalculator } from "./ProbabilityCalculator.js";
import { ProbabilityTable } from "./ProbabilityTable.js";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Enter dice configurations or type 'help': ", (input) => {
    if (input.trim().toLowerCase() === "help") {
        console.log("\n📊 Probability Table (Winning Chances %)");
        const dice = [
            [2, 2, 4, 4, 9, 9],
            [6, 8, 1, 1, 8, 6],
            [7, 5, 3, 7, 5, 3]
        ];
        const probabilities = ProbabilityCalculator.calculateProbabilities(dice);
        ProbabilityTable.display(probabilities);
        return rl.close();
    }

    const dice = DiceParser.parseDice(input.split(" "));
    if (!dice) return rl.close();

    const game = new DiceGame(dice, rl);
    game.playGame(() => rl.close());
});

// 2,2,4,4,9,9 1,1,6,6,8,8 3,3,5,5,7,7
// 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6 1,2,3,4,5,6
// 1,1,6,6,8,8 3,3,5,5,7,7
// H,G,4,4,9,9 1,1,6,6,8,8 3,3,5,5,7,7
// 5,4,4,4,9,9 d,h,6,6,8,8 3,3,5,5,7,7