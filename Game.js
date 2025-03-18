import { DiceParser } from "./DiceParser.js";
import { DiceGame } from "./DiceGame.js";
import { ProbabilityCalculator } from "./ProbabilityCalculator.js";
import { ProbabilityTable } from "./ProbabilityTable.js";
import chalk from "chalk";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question(chalk.cyan("🎲 Enter dice configurations or type 'help': "), (input) => {
    if (input.trim().toLowerCase() === "help") {
        console.log(chalk.yellow("\n🎲 **How to Play:**"));
        console.log(chalk.green("1️⃣ Provide 3 dice, each containing exactly 6 numbers."));
        console.log(chalk.green("2️⃣ Example: node Game.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3"));
        console.log(chalk.green("3️⃣ The game will determine who picks first."));
        console.log(chalk.green("4️⃣ Choose a die and play against the computer in 3 rounds."));
        console.log(chalk.green("5️⃣ Highest roll wins the round. Best of 3 rounds wins!\n"));

        const defaultDice = [
            [2, 2, 4, 4, 9, 9],
            [6, 8, 1, 1, 8, 6],
            [7, 5, 3, 7, 5, 3]
        ];

        console.log(chalk.blue("📊 **Probability Table (Winning Chances %)**"));
        const probabilities = ProbabilityCalculator.calculateProbabilities(defaultDice);
        ProbabilityTable.display(probabilities);

        return rl.close();
    }

    const dice = DiceParser.parseDice(input.split(" "));
    if (!dice) return rl.close();
    
    const game = new DiceGame(dice, rl);
    game.playGame(() => rl.close());
});
